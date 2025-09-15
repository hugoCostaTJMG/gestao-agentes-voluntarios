package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.*;
import br.gov.corregedoria.agentes.repository.*;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsável pelas regras de negócio dos Autos de Infração.
 *
 * Implementa as regras RN008 até RN014 descritas na documentação.
 */
@Service
@Transactional
public class AutoInfracaoService {

    @Autowired
    private AutoInfracaoRepository autoRepository;

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;


    @Autowired
    private LogAuditoriaAutoInfracaoRepository logRepository;

    @Autowired
    private AuditoriaUtil auditoriaUtil;

    /**
     * Cadastra um novo Auto de Infração em modo rascunho.
     * RN008 - Validação de dados obrigatórios é realizada pelas anotações Bean Validation.
     */
    public AutoInfracao cadastrar(@Valid AutoInfracao auto,
                                  Long agenteId,
                                  String usuarioLogado) {
        AgenteVoluntario agente = agenteRepository.findById(agenteId)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + agenteId));
        auto.setAgente(agente);
        auto.setNomeAgente(agente.getNomeCompleto());
        auto.setMatriculaAgente(usuarioLogado); // assume login é a matrícula
        auto.setUsuarioCadastro(usuarioLogado);
        auto.setStatus(StatusAutoInfracao.RASCUNHO);

        auto = autoRepository.save(auto);
        logRepository.save(LogAuditoriaAutoInfracao.criarLogCriacao(auto.getId(), usuarioLogado, "AGENTE", null));
        auditoriaUtil.registrarLog(usuarioLogado, "CADASTRO_AUTO", "Auto criado: " + auto.getId());
        return auto;
    }

    /**
     * Atualiza um Auto de Infração existente.
     * RN010/RN011/RN012 aplicados conforme status e perfil do usuário.
     */
    public AutoInfracao atualizar(Long id,
                                  @Valid AutoInfracao dadosAtualizados,
                                  Long agenteId,
                                  String perfilUsuario,
                                  String usuarioLogado) {
        AutoInfracao existente = obterParaEdicao(id, agenteId, perfilUsuario);

        existente.setNomeAutuado(dadosAtualizados.getNomeAutuado());
        existente.setCpfCnpjAutuado(dadosAtualizados.getCpfCnpjAutuado());
        existente.setEnderecoAutuado(dadosAtualizados.getEnderecoAutuado());
        existente.setContatoAutuado(dadosAtualizados.getContatoAutuado());
        existente.setBaseLegal(dadosAtualizados.getBaseLegal());
        existente.setDataInfracao(dadosAtualizados.getDataInfracao());
        existente.setHoraInfracao(dadosAtualizados.getHoraInfracao());
        existente.setLocalInfracao(dadosAtualizados.getLocalInfracao());
        existente.setDescricaoConduta(dadosAtualizados.getDescricaoConduta());
        existente.setIniciaisCrianca(dadosAtualizados.getIniciaisCrianca());
        existente.setIdadeCrianca(dadosAtualizados.getIdadeCrianca());
        existente.setSexoCrianca(dadosAtualizados.getSexoCrianca());
        existente.setNomeTestemunha(dadosAtualizados.getNomeTestemunha());
        existente.setCpfTestemunha(dadosAtualizados.getCpfTestemunha());
        existente.setAssinaturaAutuado(dadosAtualizados.getAssinaturaAutuado());
        existente.setUsuarioAtualizacao(usuarioLogado);

        existente = autoRepository.save(existente);
        logRepository.save(LogAuditoriaAutoInfracao.criarLogEdicao(id, usuarioLogado, perfilUsuario, null, "ATUALIZACAO"));
        auditoriaUtil.registrarLog(usuarioLogado, "ATUALIZACAO_AUTO", "Auto atualizado: " + id);
        return existente;
    }

    /**
     * Cancela um auto de infração.
     * RN013 - Justificativa obrigatória. RN014 - Status final.
     */
    public AutoInfracao cancelar(Long id, String justificativa, String usuarioLogado, String perfilUsuario) {
        AutoInfracao auto = autoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + id));

        auto.cancelar(usuarioLogado, justificativa); // RN013/RN014
        auto = autoRepository.save(auto);
        logRepository.save(LogAuditoriaAutoInfracao.criarLogCancelamento(id, usuarioLogado, perfilUsuario, null, justificativa));
        auditoriaUtil.registrarLog(usuarioLogado, "CANCELAMENTO_AUTO", "Auto cancelado: " + id);
        return auto;
    }

    /**
     * Exclui um auto de infração em rascunho.
     * RN010 - Autos registrados não podem ser excluídos.
     */
    public void excluir(Long id, Long agenteId, String usuarioLogado) {
        AutoInfracao auto = autoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + id));

        if (!auto.getStatus().permiteExclusao()) {
            throw new IllegalStateException("Auto não pode ser excluído no status atual");
        }

        if (!auto.podeSerEditadoPorAgente(usuarioLogado) && !auto.podeSerEditadoPorSupervisor()) {
            throw new IllegalStateException("Usuário não autorizado a excluir este auto");
        }

        autoRepository.delete(auto);
        logRepository.save(LogAuditoriaAutoInfracao.criarLogEdicao(id, usuarioLogado, "AGENTE", null, "EXCLUSAO"));
        auditoriaUtil.registrarLog(usuarioLogado, "EXCLUSAO_AUTO", "Auto removido: " + id);
    }

    /**
     * Lista autos de infração com filtros genéricos.
     */
    @Transactional(readOnly = true)
    public Page<AutoInfracao> listar(Pageable pageable,
                                     String matriculaAgente,
                                     StatusAutoInfracao status) {
        return autoRepository.findWithFilters(matriculaAgente, status, null, null, null, null, null, null, pageable);
    }

    /**
     * Busca auto por ID aplicando regras de acesso.
     */
    @Transactional(readOnly = true)
    public AutoInfracao buscarPorId(Long id, Long agenteId, String perfilUsuario) {
        return obterParaEdicao(id, agenteId, perfilUsuario);
    }

    private AutoInfracao obterParaEdicao(Long id, Long agenteId, String perfilUsuario) {
        AutoInfracao auto = autoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + id));

        if (auto.getStatus() == StatusAutoInfracao.CANCELADO) {
            throw new IllegalStateException("Autos cancelados não podem ser editados");
        }

        // RN011 e RN012
        if (auto.getStatus() == StatusAutoInfracao.RASCUNHO) {
            if (!auto.getAgente().getId().equals(agenteId)) {
                throw new IllegalStateException("Acesso negado ao rascunho");
            }
        } else {
            if (!"SUPERVISOR".equals(perfilUsuario) && !"ADMIN".equals(perfilUsuario)) {
                throw new IllegalStateException("Somente supervisor pode editar este auto");
            }
        }
        return auto;
    }
}

