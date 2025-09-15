package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.CredencialDTO;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.CredencialRepository;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import br.gov.corregedoria.agentes.util.QRCodeUtil;
import com.google.zxing.WriterException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CredencialService {

    @Autowired
    private CredencialRepository credencialRepository;

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;

    @Autowired
    private QRCodeUtil qrCodeUtil;

    @Autowired
    private AuditoriaUtil auditoriaUtil;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Emite uma credencial para um agente ativo
     * RN003 - Status para Emissão de Credencial
     * RN004 - Geração de QR Code
     */
    public CredencialDTO emitirCredencial(Long agenteId, String usuarioLogado) throws WriterException, IOException {
        AgenteVoluntario agente = agenteRepository.findById(agenteId)
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado: " + agenteId));

        // RN003 - Verificar se o agente está ativo
        if (agente.getStatus() != StatusAgente.ATIVO) {
            throw new IllegalStateException("Apenas agentes com status 'Ativo' podem ter credenciais emitidas");
        }

        // Gerar URL de verificação
        // Criar credencial
        Credencial credencial = new Credencial(agente, null, usuarioLogado);
        credencial = credencialRepository.save(credencial);
        String urlVerificacao = qrCodeUtil.gerarUrlVerificacao(baseUrl, credencial.getId());
        credencial.setQrCodeUrl(urlVerificacao);
        credencial = credencialRepository.save(credencial);

        // Registrar auditoria
        auditoriaUtil.registrarLog(usuarioLogado, "EMISSAO_CREDENCIAL", 
                "Credencial emitida para agente: " + agente.getId() + " - " + agente.getNomeCompleto());

        return converterParaDTO(credencial);
    }

    /**
     * Lista credenciais de um agente
     */
    @Transactional(readOnly = true)
    public List<CredencialDTO> listarCredenciaisDoAgente(Long agenteId) {
        return credencialRepository.findByAgenteId(agenteId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca credencial por ID
     */
    @Transactional(readOnly = true)
    public CredencialDTO buscarCredencialPorId(Long credencialId) {
        Credencial credencial = credencialRepository.findById(credencialId)
                .orElseThrow(() -> new EntityNotFoundException("Credencial não encontrada: " + credencialId));
        return converterParaDTO(credencial);
    }

    /**
     * Gera o PDF da credencial
     */
    public byte[] gerarPDFCredencial(Long credencialId) throws WriterException, IOException {
        Credencial credencial = credencialRepository.findById(credencialId)
                .orElseThrow(() -> new EntityNotFoundException("Credencial não encontrada: " + credencialId));

        AgenteVoluntario agente = credencial.getAgente();
        
        // Gerar QR Code em Base64
        String qrCodeBase64 = qrCodeUtil.gerarQRCode(credencial.getQrCodeUrl());

        // Aqui você implementaria a geração do PDF usando iText ou outra biblioteca
        // Por simplicidade, retornando um array vazio
        // TODO: Implementar geração real do PDF
        return new byte[0];
    }

    /**
     * Converte entidade para DTO
     */
    private CredencialDTO converterParaDTO(Credencial credencial) {
        CredencialDTO dto = new CredencialDTO();
        dto.setId(credencial.getId());
        dto.setAgenteId(credencial.getAgente().getId());
        dto.setNomeAgente(credencial.getAgente().getNomeCompleto());
        dto.setCpfAgente(credencial.getAgente().getCpf());
        dto.setStatusAgente(credencial.getAgente().getStatus().getDescricao());
        dto.setDataEmissao(credencial.getDataEmissao().format(DATE_FORMATTER));
        dto.setQrCodeUrl(credencial.getQrCodeUrl());
        dto.setUsuarioEmissao(credencial.getUsuarioEmissao());
        return dto;
    }
}

