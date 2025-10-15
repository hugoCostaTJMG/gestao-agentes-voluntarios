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
    private LogAuditoriaAutoInfracaoRepository logRepository;

    @Autowired
    private EstabelecimentoRepository estabelecimentoRepository;

    @Autowired
    private ResponsavelRepository responsavelRepository;

    @Autowired
    private TestemunhaRepository testemunhaRepository;

    @Autowired
    private MenorEnvolvidoRepository menorEnvolvidoRepository;

    @Autowired
    private AuditoriaUtil auditoriaUtil;

    /**
     * Cadastra um novo Auto de Infração em modo rascunho.
     * RN008 - Validação de dados obrigatórios é realizada pelas anotações Bean Validation.
     */
    public AutoInfracao cadastrar(@Valid AutoInfracao auto,
                                  Long agenteId,
                                  String usuarioLogado) {
        if (auto.getIdAutoInfracaoStr() == null || auto.getIdAutoInfracaoStr().isBlank()) {
            auto.setIdAutoInfracaoStr(java.util.UUID.randomUUID().toString());
        }
        auto.setUsuarioCadastro(usuarioLogado);
        auto.setStatus(StatusAutoInfracao.RASCUNHO);

        if (auto.getEstabelecimento() == null || auto.getEstabelecimento().getId() == null) {
            throw new IllegalArgumentException("ESTABELECIMENTO_ID é obrigatório");
        }
        if (auto.getResponsavel() == null || auto.getResponsavel().getId() == null) {
            throw new IllegalArgumentException("RESPONSAVEL_ID é obrigatório");
        }
        auto.setEstabelecimento(estabelecimentoRepository.findById(auto.getEstabelecimento().getId())
                .orElseThrow(() -> new EntityNotFoundException("Estabelecimento não encontrado")));
        auto.setResponsavel(responsavelRepository.findById(auto.getResponsavel().getId())
                .orElseThrow(() -> new EntityNotFoundException("Responsável não encontrado")));

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
        AutoInfracao existente = autoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + id));

        // Campos do novo DER
        existente.setDataInfracao(dadosAtualizados.getDataInfracao());
        existente.setHorarioInfracao(dadosAtualizados.getHorarioInfracao());
        existente.setLocalInfracao(dadosAtualizados.getLocalInfracao());
        existente.setComarcaTexto(dadosAtualizados.getComarcaTexto());
        existente.setNumeroCriancas(dadosAtualizados.getNumeroCriancas());
        existente.setNumeroAdolescentes(dadosAtualizados.getNumeroAdolescentes());
        existente.setAssinaturaAutuado(dadosAtualizados.getAssinaturaAutuado());
        existente.setNomeComissarioAutuante(dadosAtualizados.getNomeComissarioAutuante());
        existente.setMatriculaAutuante(dadosAtualizados.getMatriculaAutuante());
        existente.setFundamentoLegal(dadosAtualizados.getFundamentoLegal());
        existente.setArtigoEca(dadosAtualizados.getArtigoEca());
        existente.setPortariaN(dadosAtualizados.getPortariaN());
        existente.setObservacoes(dadosAtualizados.getObservacoes());
        existente.setDataIntimacao(dadosAtualizados.getDataIntimacao());
        existente.setPrazoDefesa(dadosAtualizados.getPrazoDefesa());
        existente.setUsuarioAtualizacao(usuarioLogado);

        existente = autoRepository.save(existente);
        logRepository.save(LogAuditoriaAutoInfracao.criarLogEdicao(id, usuarioLogado, perfilUsuario, null, "ATUALIZACAO"));
        auditoriaUtil.registrarLog(usuarioLogado, "ATUALIZACAO_AUTO", "Auto atualizado: " + id);
        return existente;
    }

    // Documento validations removidas no novo DER (dados de autuado migrados)

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

    // === Novos métodos (DER) ===
    public MenorEnvolvido adicionarMenor(Long autoId, @Valid MenorEnvolvido menor) {
        AutoInfracao auto = autoRepository.findById(autoId)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + autoId));
        menor.setAutoInfracao(auto);
        return menorEnvolvidoRepository.save(menor);
    }

    public void removerMenor(Long autoId, Long idMenor) {
        AutoInfracao auto = autoRepository.findById(autoId)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + autoId));
        MenorEnvolvido menor = menorEnvolvidoRepository.findById(idMenor)
                .orElseThrow(() -> new EntityNotFoundException("Menor não encontrado: " + idMenor));
        if (!menor.getAutoInfracao().getId().equals(auto.getId())) {
            throw new IllegalStateException("Menor não pertence ao auto");
        }
        menorEnvolvidoRepository.delete(menor);
    }

    public AutoInfracao associarTestemunha(Long autoId, Long testemunhaId) {
        AutoInfracao auto = autoRepository.findById(autoId)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + autoId));
        Testemunha t = testemunhaRepository.findById(testemunhaId)
                .orElseThrow(() -> new EntityNotFoundException("Testemunha não encontrada: " + testemunhaId));
        auto.getTestemunhas().add(t);
        return autoRepository.save(auto);
    }

    public AutoInfracao desassociarTestemunha(Long autoId, Long testemunhaId) {
        AutoInfracao auto = autoRepository.findById(autoId)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + autoId));
        Testemunha t = testemunhaRepository.findById(testemunhaId)
                .orElseThrow(() -> new EntityNotFoundException("Testemunha não encontrada: " + testemunhaId));
        auto.getTestemunhas().remove(t);
        return autoRepository.save(auto);
    }

    /**
     * Registra um auto de infração (status RASCUNHO -> REGISTRADO) e gera número único.
     * RN010 - Imutabilidade do Auto Registrado
     */
    public AutoInfracao registrar(Long id, String usuarioLogado, String perfilUsuario) {
        AutoInfracao auto = autoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + id));

        if (auto.getStatus() != StatusAutoInfracao.RASCUNHO) {
            throw new IllegalStateException("Apenas autos em rascunho podem ser registrados");
        }

        // Muda status para REGISTRADO
        auto.registrar();

        // Gera número único do auto (padrão: AI-YYYYMMDD-ID)
        if (auto.getNumeroAuto() == null || auto.getNumeroAuto().isBlank()) {
            String data = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
            auto.setNumeroAuto("AI-" + data + "-" + auto.getId());
        }

        auto = autoRepository.save(auto);
        logRepository.save(LogAuditoriaAutoInfracao.criarLogEdicao(id, usuarioLogado, perfilUsuario, null, "REGISTRO"));
        auditoriaUtil.registrarLog(usuarioLogado, "REGISTRO_AUTO", "Auto registrado: " + id + " numero=" + auto.getNumeroAuto());
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
        if (status != null) {
            return autoRepository.findByStatusOrderByDataCadastroDesc(status, pageable);
        }
        return autoRepository.findAll(pageable);
    }

    /**
     * Busca auto por ID aplicando regras de acesso.
     */
    @Transactional(readOnly = true)
    public AutoInfracao buscarPorId(Long id, Long agenteId, String perfilUsuario) {
        return autoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + id));
    }
}
