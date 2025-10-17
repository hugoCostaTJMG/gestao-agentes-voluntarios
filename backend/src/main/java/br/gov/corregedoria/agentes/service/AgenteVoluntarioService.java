package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.*;
import br.gov.corregedoria.agentes.entity.*;
import br.gov.corregedoria.agentes.repository.*;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import br.gov.corregedoria.agentes.util.DocumentoUtil;
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
import java.util.Optional;

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

    @Autowired
    private CredencialRepository credencialRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Cadastra um novo agente voluntário
     */
    public AgenteVoluntarioResponseDTO cadastrarAgente(AgenteVoluntarioDTO dto, String usuarioLogado) {
        // Sanitiza e valida CPF
        String cpf = DocumentoUtil.cleanDigits(dto.getCpf());
        if (!DocumentoUtil.isValidCPF(cpf)) {
            throw new IllegalArgumentException("CPF inválido");
        }
        dto.setCpf(cpf);
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
        agente.setNumeroCarteiraIdentidade(dto.getNumeroCarteiraIdentidade());
        agente.setDataExpedicaoCI(dto.getDataExpedicaoCI());
        agente.setNacionalidade(dto.getNacionalidade());
        agente.setNaturalidade(dto.getNaturalidade());
        agente.setUf(dto.getUf());
        agente.setDataNascimento(dto.getDataNascimento());
        agente.setFiliacaoPai(dto.getFiliacaoPai());
        agente.setFiliacaoMae(dto.getFiliacaoMae());
        if (dto.getFotoBase64() != null && !dto.getFotoBase64().isBlank()) {
            agente.setFoto(decodeBase64(dto.getFotoBase64()));
        }
        agente.setUsuarioCadastro(usuarioLogado);
        agente.setStatus(StatusAgente.EM_ANALISE); // RN007 - Status inicial
        agente.setDataCadastro(java.time.LocalDateTime.now());

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

        // // Registrar auditoria
        //TODO corrigir auditoria
        // auditoriaUtil.registrarLog(usuarioLogado, "CADASTRO_AGENTE", 
        //         "Agente cadastrado: " + agente.getId() + " - " + agente.getNomeCompleto());

        return converterParaAgenteResponseDTO(agente);
    }

    /**
     * Busca agente por ID
     */
    @Transactional(readOnly = true)
    public AgenteVoluntarioResponseDTO buscarPorId(Long id) {
        AgenteVoluntario agente = agenteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + id));
        return converterParaAgenteResponseDTO(agente);
    }

    /**
     * Lista todos os agentes com paginação
     */
    @Transactional(readOnly = true)
    public Page<AgenteVoluntarioResponseDTO> listarAgentes(Pageable pageable) {
        return agenteRepository.findAll(pageable)
                .map(this::converterParaAgenteResponseDTO);
    }

    /**
     * Lista agentes por status
     */
    @Transactional(readOnly = true)
    public List<AgenteVoluntarioResponseDTO> listarPorStatus(StatusAgente status) {
        return agenteRepository.findByStatus(status).stream()
                .map(this::converterParaAgenteResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista agentes ativos (para emissão de credencial)
     */
    @Transactional(readOnly = true)
    public List<AgenteVoluntarioResponseDTO> listarAgentesAtivos() {
        return agenteRepository.findAgentesAtivos().stream()
                .map(this::converterParaAgenteResponseDTO)
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
        // auditoriaUtil.registrarLog(usuarioLogado, "ATUALIZACAO_STATUS", 
        //         String.format("Status do agente %s alterado de %s para %s", 
        //                 agente.getId(), statusAnterior, novoStatus));

        return converterParaAgenteResponseDTO(agente);
    }

    /**
     * Atualiza dados de um agente
     */
    public AgenteVoluntarioResponseDTO atualizarAgente(Long id, AgenteVoluntarioDTO dto, String usuarioLogado) {
        AgenteVoluntario agente = agenteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + id));

        // Sanitiza e valida CPF informado
        String novoCpf = DocumentoUtil.cleanDigits(dto.getCpf());
        if (!DocumentoUtil.isValidCPF(novoCpf)) {
            throw new IllegalArgumentException("CPF inválido");
        }

        // Verificar se CPF foi alterado e se já existe
        if (!agente.getCpf().equals(novoCpf) && agenteRepository.existsByCpf(novoCpf)) {
            throw new IllegalArgumentException("CPF já cadastrado no sistema");
        }

        // Atualizar dados
        agente.setNomeCompleto(dto.getNomeCompleto());
        agente.setCpf(novoCpf);
        agente.setTelefone(dto.getTelefone());
        agente.setEmail(dto.getEmail());
        agente.setDisponibilidade(dto.getDisponibilidade());
        agente.setNumeroCarteiraIdentidade(dto.getNumeroCarteiraIdentidade());
        agente.setDataExpedicaoCI(dto.getDataExpedicaoCI());
        agente.setNacionalidade(dto.getNacionalidade());
        agente.setNaturalidade(dto.getNaturalidade());
        agente.setUf(dto.getUf());
        agente.setDataNascimento(dto.getDataNascimento());
        agente.setFiliacaoPai(dto.getFiliacaoPai());
        agente.setFiliacaoMae(dto.getFiliacaoMae());
        if (dto.getFotoBase64() != null && !dto.getFotoBase64().isBlank()) {
            agente.setFoto(decodeBase64(dto.getFotoBase64()));
        }

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
        // auditoriaUtil.registrarLog(usuarioLogado, "ATUALIZACAO_AGENTE", 
        //         "Agente atualizado: " + agente.getId() + " - " + agente.getNomeCompleto());

        return converterParaAgenteResponseDTO(agente);
    }

    /**
     * Busca agentes por nome
     */
    @Transactional(readOnly = true)
    public List<AgenteVoluntarioResponseDTO> buscarPorNome(String nome) {
        return agenteRepository.findByNomeCompletoContainingIgnoreCase(nome).stream()
                .map(this::converterParaAgenteResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém os bytes da foto do agente (se existir)
     */
    @Transactional(readOnly = true)
    public Optional<byte[]> obterFotoAgente(Long id) {
        return agenteRepository.findById(id).map(AgenteVoluntario::getFoto);
    }

    /**
     * Busca agente por CPF
     */
    @Transactional(readOnly = true)
    public AgenteVoluntarioResponseDTO buscarPorCpf(String cpf) {
        String clean = DocumentoUtil.cleanDigits(cpf);
        if (!DocumentoUtil.isValidCPF(clean)) {
            throw new IllegalArgumentException("CPF inválido");
        }
        AgenteVoluntario agente = agenteRepository.findByCpf(clean)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado para o CPF: " + cpf));
        return converterParaAgenteResponseDTO(agente);
    }

    /**
     * Verifica se um agente pode emitir credencial
     * RN003 - Status para Emissão de Credencial
     */
    @Transactional(readOnly = true)
    public boolean podeEmitirCredencial(Long agenteId) {
        AgenteVoluntario agente = agenteRepository.findById(agenteId)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + agenteId));
        // Só pode emitir se estiver ATIVO e não houver credencial emitida anteriormente
        boolean ativo = agente.getStatus() == StatusAgente.ATIVO;
        boolean semCredencial = credencialRepository
                .findFirstByAgenteIdOrderByDataEmissaoDescIdDesc(agenteId)
                .isEmpty();
        return ativo && semCredencial;
    }

    /**
     * Converte entidade para DTO de resposta
     */
    private AgenteVoluntarioResponseDTO converterParaAgenteResponseDTO(AgenteVoluntario agente) {
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
        // Campos adicionais (para edição)
        dto.setNumeroCarteiraIdentidade(agente.getNumeroCarteiraIdentidade());
        dto.setDataExpedicaoCI(agente.getDataExpedicaoCI());
        dto.setNacionalidade(agente.getNacionalidade());
        dto.setNaturalidade(agente.getNaturalidade());
        dto.setUf(agente.getUf());
        dto.setDataNascimento(agente.getDataNascimento());
        dto.setFiliacaoPai(agente.getFiliacaoPai());
        dto.setFiliacaoMae(agente.getFiliacaoMae());

        // Converter comarcas
        Set<ComarcaDTO> comarcasDTO = agente.getComarcas().stream()
                .map(comarca -> new ComarcaDTO(comarca.getId(), comarca.getNomeComarca()))
                .collect(Collectors.toSet());
        dto.setComarcas(comarcasDTO);
        dto.setComarcasIds(agente.getComarcas().stream().map(Comarca::getId).collect(Collectors.toSet()));

        // Converter áreas de atuação
        Set<AreaAtuacaoDTO> areasDTO = agente.getAreasAtuacao().stream()
                .map(area -> new AreaAtuacaoDTO(area.getId(), area.getNomeAreaAtuacao()))
                .collect(Collectors.toSet());
        dto.setAreasAtuacao(areasDTO);
        dto.setAreasAtuacaoIds(agente.getAreasAtuacao().stream().map(AreaAtuacao::getId).collect(Collectors.toSet()));

        return dto;
    }

    private byte[] decodeBase64(String base64) {
        try {
            String data = base64;
            int comma = data.indexOf(',');
            if (data.startsWith("data:") && comma > 0) {
                data = data.substring(comma + 1);
            }
            return java.util.Base64.getDecoder().decode(data);
        } catch (Exception e) {
            return null;
        }
    }
}
