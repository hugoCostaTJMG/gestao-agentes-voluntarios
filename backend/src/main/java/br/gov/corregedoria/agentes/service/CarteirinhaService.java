package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.CredencialRepository;
import br.gov.corregedoria.agentes.util.QRCodeUtil;
import com.google.zxing.WriterException;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.svgsupport.BatikSVGDrawer;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CarteirinhaService {
    private static final Logger log = LoggerFactory.getLogger(CarteirinhaService.class);

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;

    @Autowired
    private CredencialRepository credencialRepository;

    @Autowired
    private QRCodeUtil qrCodeUtil;

    @Value("${app.base-url}")
    private String baseUrl;

    public record Verificacao(boolean podeGerar, String mensagem) {}

    @Autowired
    private SpringTemplateEngine templateEngine;

    public Verificacao verificar(Long agenteId) {
        Optional<AgenteVoluntario> agenteOptional = agenteRepository.findById(agenteId);
        if (agenteOptional.isEmpty()) {
            return new Verificacao(false, "Agente não encontrado");
        }
        AgenteVoluntario agente = agenteOptional.get();
        if (agente.getStatus() != StatusAgente.ATIVO) {
            return new Verificacao(false, "Agente precisa estar ATIVO para emitir a carteirinha");
        }
        boolean temCredencial = !credencialRepository.findByAgenteId(agenteId).isEmpty();
        if (!temCredencial) {
            return new Verificacao(false, "Agente não possui credencial emitida. Emita a credencial antes da carteirinha.");
        }
        return new Verificacao(true, "OK");
    }

    public byte[] gerarPdf(Long agenteId, boolean inline) throws IOException, WriterException {
        AgenteVoluntario agente = agenteRepository.findById(agenteId)
                .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado: " + agenteId));
        Optional<Credencial> credencialOptional = credencialRepository.findFirstByAgenteIdOrderByDataEmissaoDescIdDesc(agenteId);
        if (credencialOptional.isEmpty()) {
            throw new IllegalStateException("Credencial não encontrada para o agente");
        }
        Credencial credencial = credencialOptional.get();
        String qrBase64 = qrCodeUtil.gerarQRCode(credencial.getQrCodeUrl());
        String qrDataUri = qrBase64 != null && !qrBase64.isBlank() ? "data:image/png;base64," + qrBase64 : null;

        String fotoDataUri = null;
        if (agente.getFoto() != null && agente.getFoto().length > 0) {
            String mime = deduzirMimeImagem(agente.getFoto());
            fotoDataUri = "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(agente.getFoto());
        }

        String logoDataUri = carregarLogoComoDataUri();

        // Variáveis do template
        String nomeCompleto = safe(agente.getNomeCompleto());
        String comarca = agente.getComarcas().stream().findFirst().map(c -> c.getNomeComarca()).orElse("NÃO INFORMADO");
        String ci = safe(agente.getNumeroCarteiraIdentidade());
        String uf = safe(agente.getUf());
        String cpf = safe(formatarCpf(agente.getCpf()));
        String nacionalidade = safe(agente.getNacionalidade());
        String naturalidade = safe(agente.getNaturalidade());
        String dataNascimento = agente.getDataNascimento() != null ? agente.getDataNascimento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
        String dataExpedicao = agente.getDataExpedicaoCI() != null ? agente.getDataExpedicaoCI().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
        String filiacao = (safe(agente.getFiliacaoPai()).isBlank() && safe(agente.getFiliacaoMae()).isBlank()) ? "" : ("Pai: " + safe(agente.getFiliacaoPai()) + "  |  Mãe: " + safe(agente.getFiliacaoMae()));
        String numeroCredencial = formatarNumeroComQuatroDigitos(credencial.getId());
        String codigoControle = "Cód.: " + credencial.getId();
        String versao = "v2.0";
        String provimento = "art. 362, §1º do Provimento nº 355/2018";
        String dataEmissao = credencial.getDataEmissao() != null ? credencial.getDataEmissao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";

        Context templateContext = new Context();
        templateContext.setVariable("logo", logoDataUri);
        templateContext.setVariable("foto", fotoDataUri);
        templateContext.setVariable("qr", qrDataUri);
        templateContext.setVariable("qrCode", qrDataUri); // compatibilidade com template
        templateContext.setVariable("codigoControle", codigoControle);
        templateContext.setVariable("versao", versao);
        templateContext.setVariable("provimento", provimento);
        templateContext.setVariable("dataEmissao", dataEmissao);
        templateContext.setVariable("nomeCompleto", nomeCompleto);
        templateContext.setVariable("comarca", comarca);
        templateContext.setVariable("ci", ci);
        templateContext.setVariable("uf", uf);
        templateContext.setVariable("cpf", cpf);
        templateContext.setVariable("nacionalidade", nacionalidade);
        templateContext.setVariable("naturalidade", naturalidade);
        templateContext.setVariable("dataNascimento", dataNascimento);
        templateContext.setVariable("dataExpedicao", dataExpedicao);
        templateContext.setVariable("filiacao", filiacao);
        templateContext.setVariable("numeroCredencial", numeroCredencial);

        String html = templateEngine.process("carteirinha_agente", templateContext);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useSVGDrawer(new BatikSVGDrawer());
            // Registrar fontes locais (Montserrat) para incorporação no PDF
            registrarFontes(builder);
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IOException("Falha ao gerar a carteirinha (HTML->PDF): " + e.getMessage(), e);
        }
    }

    public static class LoteItem {
        public String logo; public String foto; public String qrCode; public String codigoControle; public String versao; public String provimento; public String dataEmissao;
        public String nomeCompleto; public String comarca; public String ci; public String uf; public String cpf; public String nacionalidade; public String naturalidade;
        public String dataNascimento; public String dataExpedicao; public String filiacao; public String numeroCredencial;
    }

    public byte[] gerarPdfLote(List<Long> agenteIds) throws IOException, WriterException {
        String logoDataUri = carregarLogoComoDataUri();
        List<LoteItem> itens = new ArrayList<>();

        for (Long agenteId : agenteIds) {
            AgenteVoluntario agente = agenteRepository.findById(agenteId)
                    .orElseThrow(() -> new IllegalArgumentException("Agente não encontrado: " + agenteId));
            Optional<Credencial> credencialOptional = credencialRepository.findFirstByAgenteIdOrderByDataEmissaoDescIdDesc(agenteId);
            if (credencialOptional.isEmpty()) {
                // pula agentes sem credencial
                continue;
            }
            Credencial credencial = credencialOptional.get();
            String qrBase64 = qrCodeUtil.gerarQRCode(credencial.getQrCodeUrl());
            String qrDataUri = qrBase64 != null && !qrBase64.isBlank() ? "data:image/png;base64," + qrBase64 : null;

            String fotoDataUri = null;
            if (agente.getFoto() != null && agente.getFoto().length > 0) {
                String mime = deduzirMimeImagem(agente.getFoto());
                fotoDataUri = "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(agente.getFoto());
            }

            LoteItem it = new LoteItem();
            it.logo = logoDataUri;
            it.foto = fotoDataUri;
            it.qrCode = qrDataUri;
            it.codigoControle = "Cód.: " + credencial.getId();
            it.versao = "v2.0";
            it.provimento = "art. 362, §1º do Provimento nº 355/2018";
            it.dataEmissao = credencial.getDataEmissao() != null ? credencial.getDataEmissao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
            it.nomeCompleto = safe(agente.getNomeCompleto());
            it.comarca = agente.getComarcas().stream().findFirst().map(c -> c.getNomeComarca()).orElse("NÃO INFORMADO");
            it.ci = safe(agente.getNumeroCarteiraIdentidade());
            it.uf = safe(agente.getUf());
            it.cpf = safe(formatarCpf(agente.getCpf()));
            it.nacionalidade = safe(agente.getNacionalidade());
            it.naturalidade = safe(agente.getNaturalidade());
            it.dataNascimento = agente.getDataNascimento() != null ? agente.getDataNascimento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
            it.dataExpedicao = agente.getDataExpedicaoCI() != null ? agente.getDataExpedicaoCI().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
            it.filiacao = (safe(agente.getFiliacaoPai()).isBlank() && safe(agente.getFiliacaoMae()).isBlank()) ? "" : ("Pai: " + safe(agente.getFiliacaoPai()) + "  |  Mãe: " + safe(agente.getFiliacaoMae()));
            it.numeroCredencial = formatarNumeroComQuatroDigitos(credencial.getId());
            itens.add(it);
        }

        if (itens.isEmpty()) {
            throw new IllegalStateException("Nenhuma credencial encontrada para os agentes informados");
        }

        Context ctx = new Context();
        ctx.setVariable("itens", itens);

        String html = templateEngine.process("carteirinhas_lote", ctx);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useSVGDrawer(new BatikSVGDrawer());
            registrarFontes(builder);
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new IOException("Falha ao gerar o PDF em lote: " + e.getMessage(), e);
        }
    }

    /**
     * Registra as variantes da família Montserrat a partir de arquivos na pasta resources/fonts.
     * Coloque os arquivos TTF (ou OTF) no classpath em:
     *  - /fonts/Montserrat-Regular.ttf (peso 400)
     *  - /fonts/Montserrat-SemiBold.ttf (peso 600)
     *  - /fonts/Montserrat-Bold.ttf (peso 700)
     *  - /fonts/Montserrat-ExtraBold.ttf (peso 800)
     * Caso algum arquivo não exista, é simplesmente ignorado.
     */
    private void registrarFontes(PdfRendererBuilder builder) {
        addFont(builder, "/fonts/Montserrat-Regular.ttf", "Montserrat", 400);
        addFont(builder, "/fonts/Montserrat-Medium.ttf", "Montserrat", 500);
        addFont(builder, "/fonts/Montserrat-SemiBold.ttf", "Montserrat", 600);
        addFont(builder, "/fonts/Montserrat-Bold.ttf", "Montserrat", 700);
        addFont(builder, "/fonts/Montserrat-ExtraBold.ttf", "Montserrat", 800);
        // Se desejar suportar itálico, adicionar arquivos *Italic.ttf com FontStyle.ITALIC.
    }

    private void addFont(PdfRendererBuilder builder, String resourcePath, String family, int weight) {
        java.net.URL url = getClass().getResource(resourcePath);
        if (url == null) { 
            log.warn("Fonte não encontrada no classpath: {} (peso {})", resourcePath, weight);
            return; // arquivo não existe no classpath
        }
        com.openhtmltopdf.extend.FSSupplier<java.io.InputStream> supplier = () -> getClass().getResourceAsStream(resourcePath);
        try {
            builder.useFont(supplier, family, weight, BaseRendererBuilder.FontStyle.NORMAL, true);
            log.info("Fonte registrada: {} (peso {})", family, weight);
        } catch (Exception ignored) {
            log.warn("Falha ao registrar fonte: {} (peso {})", family, weight);
        }
    }

    private static String safe(String s) { return s == null ? "" : s; }

    private static String deduzirMimeImagem(byte[] data) {
        if (data == null || data.length < 4) return "image/jpeg";
        if ((data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47) return "image/png";
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8) return "image/jpeg";
        return "image/jpeg";
    }

    private String carregarLogoComoDataUri() throws IOException {
        // Preferir PNG direto (brasão raster) e manter fallback para SVG com rasterização
        String[][] candidates = new String[][]{
                {"/reports/icoMG.png", "image/png"},
                {"/reports/brasao.png", "image/png"},
                {"/reports/brasao_mg.png", "image/png"},
                {"/reports/Brasao_de_Minas_Gerais_PB.png", "image/png"},
                {"/reports/Brasão_de_Minas_Gerais_P&B.png", "image/png"},
                {"/reports/logo_tjmg.png", "image/png"},
                {"/reports/logo.png", "image/png"},
                {"/reports/icoMG.svg", "image/svg+xml"},
                {"/reports/Brasao_de_Minas_Gerais_PB.svg", "image/svg+xml"},
                {"/reports/Brasão_de_Minas_Gerais_P&B.svg", "image/svg+xml"},
                {"/reports/logo_tjmg.svg", "image/svg+xml"},
                {"/reports/logo.svg", "image/svg+xml"}
        };
        for (String[] c : candidates) {
            try (var is = getClass().getResourceAsStream(c[0])) {
                if (is != null) {
                    if ("image/svg+xml".equals(c[1])) {
                        String res = converterSvgParaPngDataUri(c[0], 160f);
                        if (res != null) return res;
                    } else {
                        byte[] bytes = is.readAllBytes();
                        return "data:" + c[1] + ";base64," + Base64.getEncoder().encodeToString(bytes);
                    }
                }
            }
        }
        return null;
    }

    // Converte um SVG de resources para PNG (Data URI) usando Batik
    private String converterSvgParaPngDataUri(String classpathSvg, float widthPx) {
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

    

    private static String formatarNumeroComQuatroDigitos(Long id) {
        if (id == null) return "0000";
        try { return String.format("%04d", id); } catch (Exception e) { return String.valueOf(id); }
    }

    private static String formatarCpf(String cpf) {
        if (cpf == null) return "";
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() == 11) {
            return digits.replaceFirst("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
        }
        return cpf;
    }
}
