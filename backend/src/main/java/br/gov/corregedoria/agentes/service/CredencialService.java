package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.CredencialDTO;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.CredencialRepository;
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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional
public class CredencialService {

    @Autowired
    private CredencialRepository credencialRepository;

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;

    @Autowired
    private QRCodeUtil qrCodeUtil;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.dev-base-url}")
    private String devBaseUrl;

    @Value("${app.environment:production}")
    private String appEnvironment;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @PersistenceContext
    private EntityManager entityManager;

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

        // Nova regra: emitir credencial apenas se o agente não tiver nenhuma emitida
        boolean jaPossuiCredencial = credencialRepository
                .findFirstByAgenteIdOrderByDataEmissaoDescIdDesc(agenteId)
                .isPresent();
        if (jaPossuiCredencial) {
            throw new IllegalStateException("Agente já possui credencial emitida");
        }

        // Pré-aloca ID pela sequência Oracle para compor a URL antes do insert (qr_code_url é NOT NULL)
        Long nextId = ((Number) entityManager.createNativeQuery("SELECT S_CREDENCIAL.NEXTVAL FROM dual").getSingleResult()).longValue();

        Credencial credencial = new Credencial(agente, null, usuarioLogado);
        credencial.setId(nextId);
        // define data de emissão imediatamente
        credencial.setDataEmissao(java.time.LocalDateTime.now());
        // gera URL pública a partir do ID já alocado
        String publicBase = resolvePublicBaseUrl();
        String urlVerificacao = qrCodeUtil.gerarUrlVerificacao(publicBase, nextId);
        credencial.setQrCodeUrl(urlVerificacao);
        // agora insere com todos os campos NOT NULL preenchidos
        credencial = credencialRepository.save(credencial);

        // Registrar auditoria
        // auditoriaUtil.registrarLog(usuarioLogado, "EMISSAO_CREDENCIAL", 
        //         "Credencial emitida para agente: " + agente.getId() + " - " + agente.getNomeCompleto());

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

        // Gera QR Code (Base64) a partir da URL pública de verificação
        String qrCodeBase64 = qrCodeUtil.gerarQRCode(credencial.getQrCodeUrl());
        byte[] qrBytes = java.util.Base64.getDecoder().decode(qrCodeBase64);

        // Monta PDF simples com iText 7
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(baos);
        com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
        com.itextpdf.layout.Document doc = new com.itextpdf.layout.Document(pdf, com.itextpdf.kernel.geom.PageSize.A6.rotate());
        doc.setMargins(20, 20, 20, 20);

        doc.add(new com.itextpdf.layout.element.Paragraph("Credencial de Agente Voluntário").setBold().setFontSize(14));
        doc.add(new com.itextpdf.layout.element.Paragraph("Nome: " + safe(agente.getNomeCompleto())));
        String comarca = agente.getComarcas().stream().findFirst().map(c -> c.getNomeComarca()).orElse("NÃO INFORMADO");
        doc.add(new com.itextpdf.layout.element.Paragraph("Comarca: " + comarca));
        doc.add(new com.itextpdf.layout.element.Paragraph("CPF: " + safe(agente.getCpf())));
        doc.add(new com.itextpdf.layout.element.Paragraph("Status: " + agente.getStatus().getDescricao()));
        if (credencial.getDataEmissao() != null) {
            doc.add(new com.itextpdf.layout.element.Paragraph("Emissão: " + credencial.getDataEmissao().format(DATE_FORMATTER)));
        }
        doc.add(new com.itextpdf.layout.element.Paragraph("Código: " + credencial.getId()));

        com.itextpdf.layout.element.Image qr = new com.itextpdf.layout.element.Image(com.itextpdf.io.image.ImageDataFactory.create(qrBytes));
        qr.setAutoScale(true);
        doc.add(new com.itextpdf.layout.element.Paragraph("\n"));
        doc.add(qr);
        doc.add(new com.itextpdf.layout.element.Paragraph("Verifique a autenticidade via QR Code"));

        doc.close();
        return baos.toByteArray();
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
        dto.setDataEmissao(credencial.getDataEmissao() != null ? credencial.getDataEmissao().format(DATE_FORMATTER) : "");
        dto.setQrCodeUrl(credencial.getQrCodeUrl());
        dto.setUsuarioEmissao(credencial.getUsuarioEmissao());
        return dto;
    }

    private static String safe(String s) { return s == null ? "" : s; }

    private String resolvePublicBaseUrl() {
        String b = (baseUrl == null) ? "" : baseUrl.trim();
        String d = (devBaseUrl == null) ? "" : devBaseUrl.trim();
        String profiles = (activeProfiles == null) ? "" : activeProfiles.toLowerCase();
        boolean isLocalEnv = "local".equalsIgnoreCase(appEnvironment) || profiles.contains("docker") || profiles.contains("dev");
        boolean baseLooksLocal = b.toLowerCase().contains("localhost") || b.contains("127.0.0.1");

        String chosen = (isLocalEnv && !baseLooksLocal && !d.isBlank()) ? d : b;
        // normalizar para não duplicar barras
        if (chosen.endsWith("/")) {
            chosen = chosen.substring(0, chosen.length() - 1);
        }
        return chosen;
    }
}
