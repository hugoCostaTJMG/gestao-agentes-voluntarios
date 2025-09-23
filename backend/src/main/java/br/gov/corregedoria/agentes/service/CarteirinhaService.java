package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.CredencialRepository;
import br.gov.corregedoria.agentes.util.QRCodeUtil;
import com.google.zxing.WriterException;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Optional;

@Service
public class CarteirinhaService {

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;

    @Autowired
    private CredencialRepository credencialRepository;

    @Autowired
    private QRCodeUtil qrCodeUtil;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public record Verificacao(boolean podeGerar, String mensagem) {}

    public Verificacao verificar(Long agenteId) {
        Optional<AgenteVoluntario> opt = agenteRepository.findById(agenteId);
        if (opt.isEmpty()) {
            return new Verificacao(false, "Agente não encontrado");
        }
        AgenteVoluntario ag = opt.get();
        if (ag.getStatus() != StatusAgente.ATIVO) {
            return new Verificacao(false, "Agente precisa estar ATIVO para emitir a carteirinha");
        }
        boolean temCredencial = !credencialRepository.findByAgenteId(agenteId).isEmpty();
        if (!temCredencial) {
            return new Verificacao(false, "Agente não possui credencial emitida. Emita a credencial antes da carteirinha.");
        }
        return new Verificacao(true, "OK");
    }

    public byte[] gerarPdf(Long agenteId, boolean inline) throws IOException, WriterException {
        AgenteVoluntario ag = agenteRepository.findById(agenteId)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado: " + agenteId));
        Optional<Credencial> credOpt = credencialRepository.findCredencialMaisRecenteByAgenteId(agenteId);
        if (credOpt.isEmpty()) {
            throw new IllegalStateException("Credencial não encontrada para o agente");
        }
        Credencial cred = credOpt.get();
        String qrBase64 = qrCodeUtil.gerarQRCode(cred.getQrCodeUrl());
        byte[] qrBytes = Base64.getDecoder().decode(qrBase64);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf, PageSize.A6.rotate());
        doc.setMargins(20, 20, 20, 20);

        // Cabeçalho
        doc.add(new Paragraph("Carteirinha de Agente Voluntário").setBold().setFontSize(14));

        // Dados do agente
        doc.add(new Paragraph("Nome: " + safe(ag.getNomeCompleto())));
        String comarca = ag.getComarcas().stream().findFirst().map(c -> c.getNomeComarca()).orElse("NÃO INFORMADO");
        doc.add(new Paragraph("Comarca: " + comarca));
        doc.add(new Paragraph("CPF: " + safe(ag.getCpf())));
        doc.add(new Paragraph("Status: " + ag.getStatus().getDescricao()));
        if (cred.getDataEmissao() != null) {
            doc.add(new Paragraph("Emissão: " + cred.getDataEmissao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
        }

        // QR Code
        Image qr = new Image(ImageDataFactory.create(qrBytes));
        qr.setAutoScale(true);
        doc.add(qr);
        doc.add(new Paragraph("Verifique a autenticidade via QR Code").setFontColor(ColorConstants.DARK_GRAY).setFontSize(9));

        doc.close();
        return baos.toByteArray();
    }

    private static String safe(String s) { return s == null ? "" : s; }
}
