package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.CredencialRepository;
import br.gov.corregedoria.agentes.util.QRCodeUtil;
import com.google.zxing.WriterException;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.openhtmltopdf.svgsupport.BatikSVGDrawer;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.nio.charset.StandardCharsets;
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

    @Autowired
    private SpringTemplateEngine templateEngine;

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
        String qrDataUri = qrBase64 != null && !qrBase64.isBlank() ? "data:image/png;base64," + qrBase64 : null;

        String fotoDataUri = null;
        if (ag.getFoto() != null && ag.getFoto().length > 0) {
            String mime = guessImageMime(ag.getFoto());
            fotoDataUri = "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(ag.getFoto());
        }

        String logoDataUri = loadLogoDataUri();

        // Variáveis do template
        String nomeCompleto = safe(ag.getNomeCompleto());
        String comarca = ag.getComarcas().stream().findFirst().map(c -> c.getNomeComarca()).orElse("NÃO INFORMADO");
        String ci = safe(ag.getNumeroCarteiraIdentidade());
        String uf = safe(ag.getUf());
        String cpf = safe(formatCpf(ag.getCpf()));
        String nacionalidade = safe(ag.getNacionalidade());
        String naturalidade = safe(ag.getNaturalidade());
        String dataNascimento = ag.getDataNascimento() != null ? ag.getDataNascimento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
        String dataExpedicao = ag.getDataExpedicaoCI() != null ? ag.getDataExpedicaoCI().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
        String filiacao = (safe(ag.getFiliacaoPai()).isBlank() && safe(ag.getFiliacaoMae()).isBlank()) ? "" : ("Pai: " + safe(ag.getFiliacaoPai()) + "  |  Mãe: " + safe(ag.getFiliacaoMae()));
        String numeroCredencial = padNumero(cred.getId());
        String codigoControle = "Cód.: " + cred.getId();
        String versao = "v2.0";
        String provimento = "art. 362, §1º do Provimento nº 355/2018";
        String dataEmissao = cred.getDataEmissao() != null ? cred.getDataEmissao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";

        Context ctx = new Context();
        ctx.setVariable("logo", logoDataUri);
        ctx.setVariable("foto", fotoDataUri);
        ctx.setVariable("qr", qrDataUri);
        ctx.setVariable("qrCode", qrDataUri); // compatibilidade com template
        ctx.setVariable("codigoControle", codigoControle);
        ctx.setVariable("versao", versao);
        ctx.setVariable("provimento", provimento);
        ctx.setVariable("dataEmissao", dataEmissao);
        ctx.setVariable("nomeCompleto", nomeCompleto);
        ctx.setVariable("comarca", comarca);
        ctx.setVariable("ci", ci);
        ctx.setVariable("uf", uf);
        ctx.setVariable("cpf", cpf);
        ctx.setVariable("nacionalidade", nacionalidade);
        ctx.setVariable("naturalidade", naturalidade);
        ctx.setVariable("dataNascimento", dataNascimento);
        ctx.setVariable("dataExpedicao", dataExpedicao);
        ctx.setVariable("filiacao", filiacao);
        ctx.setVariable("numeroCredencial", numeroCredencial);

        String html = templateEngine.process("carteirinha_agente", ctx);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useSVGDrawer(new BatikSVGDrawer());
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IOException("Falha ao gerar a carteirinha (HTML->PDF): " + e.getMessage(), e);
        }
    }

    private static String safe(String s) { return s == null ? "" : s; }

    private static String guessImageMime(byte[] data) {
        if (data == null || data.length < 4) return "image/jpeg";
        if ((data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47) return "image/png";
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8) return "image/jpeg";
        return "image/jpeg";
    }

    private String loadLogoDataUri() throws IOException {
        // Preferir SVG -> PNG (para evitar problemas do renderer com SVG em fast-mode)
        String svgPath = "/reports/Brasão_de_Minas_Gerais_P&B.svg";
        String pngFromSvg = trySvgToPngDataUri(svgPath, 160f);
        if (pngFromSvg != null) return pngFromSvg;

        String[][] candidates = new String[][]{
                {"/reports/logo_tjmg.png", "image/png"},
                {"/reports/logo.png", "image/png"},
                {"/reports/logo_tjmg.svg", "image/svg+xml"},
                {"/reports/logo.svg", "image/svg+xml"}
        };
        for (String[] c : candidates) {
            try (var is = getClass().getResourceAsStream(c[0])) {
                if (is != null) {
                    // Se for SVG, também tenta rasterizar
                    if ("image/svg+xml".equals(c[1])) {
                        String res = trySvgToPngDataUri(c[0], 160f);
                        if (res != null) return res;
                    }
                    byte[] bytes = is.readAllBytes();
                    return "data:" + c[1] + ";base64," + Base64.getEncoder().encodeToString(bytes);
                }
            }
        }
        return null;
    }

    // Converte um SVG de resources para PNG (Data URI) usando Batik
    private String trySvgToPngDataUri(String classpathSvg, float widthPx) {
        try (var is = getClass().getResourceAsStream(classpathSvg)) {
            if (is == null) return null;
            // Batik transcoder
            org.apache.batik.transcoder.image.PNGTranscoder t = new org.apache.batik.transcoder.image.PNGTranscoder();
            t.addTranscodingHint(org.apache.batik.transcoder.SVGAbstractTranscoder.KEY_WIDTH, widthPx);
            org.apache.batik.transcoder.TranscoderInput input = new org.apache.batik.transcoder.TranscoderInput(is);
            java.io.ByteArrayOutputStream os = new java.io.ByteArrayOutputStream();
            org.apache.batik.transcoder.TranscoderOutput output = new org.apache.batik.transcoder.TranscoderOutput(os);
            t.transcode(input, output);
            os.flush();
            String dataUri = "data:image/png;base64," + Base64.getEncoder().encodeToString(os.toByteArray());
            os.close();
            return dataUri;
        } catch (Exception e) {
            return null;
        }
    }

    

    private static String padNumero(Long id) {
        if (id == null) return "0000";
        try { return String.format("%04d", id); } catch (Exception e) { return String.valueOf(id); }
    }

    private static String formatCpf(String cpf) {
        if (cpf == null) return "";
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() == 11) {
            return digits.replaceFirst("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
        }
        return cpf;
    }
}
