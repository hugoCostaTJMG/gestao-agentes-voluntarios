package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.*;
import br.gov.corregedoria.agentes.entity.*;
import br.gov.corregedoria.agentes.repository.*;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AgenteVoluntarioService {

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;

    @Autowired
    private ComarcaRepository comarcaRepository;

    @Autowired
    private AreaAtuacaoRepository areaAtuacaoRepository;

    @Autowired
    private AuditoriaUtil auditoriaUtil;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Cadastra um novo agente voluntário
     */
    public AgenteVoluntarioResponseDTO cadastrarAgente(AgenteVoluntarioDTO dto, String usuarioLogado) {
        // RN002 - Validação de CPF Único
        if (agenteRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado no sistema");
        }

        // Criar nova entidade
        AgenteVoluntario agente = new AgenteVoluntario();
        agente.setNomeCompleto(dto.getNomeCompleto());
        agente.setCpf(dto.getCpf());
        agente.setTelefone(dto.getTelefone());
        agente.setEmail(dto.getEmail());
        agente.setDisponibilidade(dto.getDisponibilidade());
        agente.setUsuarioCadastro(usuarioLogado);
        agente.setStatus(StatusAgente.EM_ANALISE); // RN007 - Status inicial

        // Associar comarcas
        Set<Comarca> comarcas = dto.getComarcasIds().stream()
                .map(id -> comarcaRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Comarca não encontrada: " + id)))
                .collect(Collectors.toSet());
        agente.setComarcas(comarcas);

        // Associar áreas de atuação
        Set<AreaAtuacao> areasAtuacao = dto.getAreasAtuacaoIds().stream()
                .map(id -> areaAtuacaoRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Área de atuação não encontrada: " + id)))
                .collect(Collectors.toSet());
        agente.setAreasAtuacao(areasAtuacao);

        // Salvar agente
        agente = agenteRepository.save(agente);

        // Registrar auditoria
        auditoriaUtil.registrarLog(usuarioLogado, "CADASTRO_AGENTE", 
                "Agente cadastrado: " + agente.getId() + " - " + agente.getNomeCompleto());

        return converterParaResponseDTO(agente);
    }

    /**
     * Busca agente por ID
     */
    @Transactional(readOnly = true)
    public AgenteVoluntarioResponseDTO buscarPorId(Long id) {
        AgenteVoluntario agente = agenteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + id));
        return converterParaResponseDTO(agente);
    }

    /**
     * Lista todos os agentes com paginação
     */
    @Transactional(readOnly = true)
    public Page<AgenteVoluntarioResponseDTO> listarAgentes(Pageable pageable) {
        return agenteRepository.findAll(pageable)
                .map(this::converterParaResponseDTO);
    }

    /**
     * Lista agentes por status
     */
    @Transactional(readOnly = true)
    public List<AgenteVoluntarioResponseDTO> listarPorStatus(StatusAgente status) {
        return agenteRepository.findByStatus(status).stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista agentes ativos (para emissão de credencial)
     */
    @Transactional(readOnly = true)
    public List<AgenteVoluntarioResponseDTO> listarAgentesAtivos() {
        return agenteRepository.findAgentesAtivos().stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza o status de um agente
     * RN006 - Atualização da Situação do Agente
     */
    public AgenteVoluntarioResponseDTO atualizarStatus(Long id, StatusAgente novoStatus, String usuarioLogado) {
        AgenteVoluntario agente = agenteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + id));

        StatusAgente statusAnterior = agente.getStatus();
        agente.setStatus(novoStatus);
        agente = agenteRepository.save(agente);

        // Registrar auditoria
        auditoriaUtil.registrarLog(usuarioLogado, "ATUALIZACAO_STATUS", 
                String.format("Status do agente %s alterado de %s para %s", 
                        agente.getId(), statusAnterior, novoStatus));

        return converterParaResponseDTO(agente);
    }

    /**
     * Atualiza dados de um agente
     */
    public AgenteVoluntarioResponseDTO atualizarAgente(Long id, AgenteVoluntarioDTO dto, String usuarioLogado) {
        AgenteVoluntario agente = agenteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + id));

        // Verificar se CPF foi alterado e se já existe
        if (!agente.getCpf().equals(dto.getCpf()) && agenteRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado no sistema");
        }

        // Atualizar dados
        agente.setNomeCompleto(dto.getNomeCompleto());
        agente.setCpf(dto.getCpf());
        agente.setTelefone(dto.getTelefone());
        agente.setEmail(dto.getEmail());
        agente.setDisponibilidade(dto.getDisponibilidade());

        // Atualizar comarcas
        Set<Comarca> comarcas = dto.getComarcasIds().stream()
                .map(comarcaId -> comarcaRepository.findById(comarcaId)
                        .orElseThrow(() -> new EntityNotFoundException("Comarca não encontrada: " + comarcaId)))
                .collect(Collectors.toSet());
        agente.setComarcas(comarcas);

        // Atualizar áreas de atuação
        Set<AreaAtuacao> areasAtuacao = dto.getAreasAtuacaoIds().stream()
                .map(areaId -> areaAtuacaoRepository.findById(areaId)
                        .orElseThrow(() -> new EntityNotFoundException("Área de atuação não encontrada: " + areaId)))
                .collect(Collectors.toSet());
        agente.setAreasAtuacao(areasAtuacao);

        agente = agenteRepository.save(agente);

        // Registrar auditoria
        auditoriaUtil.registrarLog(usuarioLogado, "ATUALIZACAO_AGENTE", 
                "Agente atualizado: " + agente.getId() + " - " + agente.getNomeCompleto());

        return converterParaResponseDTO(agente);
    }

    /**
     * Busca agentes por nome
     */
    @Transactional(readOnly = true)
    public List<AgenteVoluntarioResponseDTO> buscarPorNome(String nome) {
        return agenteRepository.findByNomeCompletoContainingIgnoreCase(nome).stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Verifica se um agente pode emitir credencial
     * RN003 - Status para Emissão de Credencial
     */
    @Transactional(readOnly = true)
    public boolean podeEmitirCredencial(Long agenteId) {
        AgenteVoluntario agente = agenteRepository.findById(agenteId)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + agenteId));
        return agente.podeEmitirCredencial();
    }

    /**
     * Converte entidade para DTO de resposta
     */
    private AgenteVoluntarioResponseDTO converterParaResponseDTO(AgenteVoluntario agente) {
        AgenteVoluntarioResponseDTO dto = new AgenteVoluntarioResponseDTO();
        dto.setId(agente.getId());
        dto.setNomeCompleto(agente.getNomeCompleto());
        dto.setCpf(agente.getCpf());
        dto.setTelefone(agente.getTelefone());
        dto.setEmail(agente.getEmail());
        dto.setDisponibilidade(agente.getDisponibilidade());
        dto.setStatus(agente.getStatus().getDescricao());
        dto.setDataCadastro(agente.getDataCadastro().format(DATE_FORMATTER));
        dto.setUsuarioCadastro(agente.getUsuarioCadastro());

        // Converter comarcas
        Set<ComarcaDTO> comarcasDTO = agente.getComarcas().stream()
                .map(comarca -> new ComarcaDTO(comarca.getId(), comarca.getNomeComarca()))
                .collect(Collectors.toSet());
        dto.setComarcas(comarcasDTO);

        // Converter áreas de atuação
        Set<AreaAtuacaoDTO> areasDTO = agente.getAreasAtuacao().stream()
                .map(area -> new AreaAtuacaoDTO(area.getId(), area.getNomeAreaAtuacao()))
                .collect(Collectors.toSet());
        dto.setAreasAtuacao(areasDTO);

        return dto;
    }
}

