// package br.gov.corregedoria.agentes.service;

// import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
// import br.gov.corregedoria.agentes.entity.Comarca;
// import br.gov.corregedoria.agentes.entity.Credencial;
// import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
// import br.gov.corregedoria.agentes.repository.CredencialRepository;
// import br.gov.corregedoria.agentes.util.QRCodeUtil;
// import net.sf.jasperreports.engine.*;
// import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.core.io.ClassPathResource;
// import org.springframework.stereotype.Service;

// import java.io.InputStream;
// import java.time.LocalDate;
// import java.time.format.DateTimeFormatter;
// import java.util.*;

// /**
//  * Service para geração de carteirinha de agente voluntário usando JasperReports
//  */
// @Service
// public class CarteirinhaService {

//     @Autowired
//     private AgenteVoluntarioRepository agenteRepository;

//     @Autowired
//     private CredencialRepository credencialRepository;

//     @Autowired
//     private QRCodeUtil qrCodeUtil;

//     /**
//      * Gera a carteirinha do agente voluntário em PDF
//      */
//     public byte[] gerarCarteirinha(String agenteId) throws Exception {
//         // Buscar dados do agente
//         AgenteVoluntario agente = agenteRepository.findById(agenteId)
//             .orElseThrow(() -> new RuntimeException("Agente não encontrado: " + agenteId));

//         // Buscar credencial ativa do agente
//         Credencial credencial = credencialRepository.findByAgenteIdAndStatus(agenteId, "ATIVA")
//             .orElseThrow(() -> new RuntimeException("Credencial ativa não encontrada para o agente"));

//         // Preparar dados para o relatório
//         Map<String, Object> dadosCarteirinha = prepararDadosCarteirinha(agente, credencial);

//         // Parâmetros do relatório
//         Map<String, Object> parametros = prepararParametros(agente, credencial);

//         // Dados para o JasperReports
//         List<Map<String, Object>> dados = Arrays.asList(dadosCarteirinha);
//         JRDataSource dataSource = new JRBeanCollectionDataSource(dados);

//         // Carregar e compilar template
//         InputStream templateStream = new ClassPathResource("reports/carteirinha_agente.jrxml").getInputStream();
//         JasperReport jasperReport = JasperCompileManager.compileReport(templateStream);

//         // Gerar relatório
//         JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parametros, dataSource);

//         // Exportar para PDF
//         return JasperExportManager.exportReportToPdf(jasperPrint);
//     }

//     /**
//      * Prepara os dados da carteirinha
//      */
//     private Map<String, Object> prepararDadosCarteirinha(AgenteVoluntario agente, Credencial credencial) {
//         Map<String, Object> dados = new HashMap<>();

//         // Dados da frente
//         dados.put("nomeCompleto", agente.getNomeCompleto());
//         dados.put("comarca", obterNomeComarca(agente));
//         dados.put("fotoPath", agente.getFotoPath());
//         dados.put("numeroCredencial", credencial.getNumeroCredencial());

//         // Dados do verso
//         dados.put("carteiraIdentidade", agente.getNumeroCI());
//         dados.put("uf", agente.getUf());
//         dados.put("cpf", formatarCPF(agente.getCpf()));
//         dados.put("nacionalidade", agente.getNacionalidade());
//         dados.put("naturalidade", agente.getNaturalidade());
//         dados.put("dataNascimento", formatarData(agente.getDataNascimento()));
//         dados.put("dataExpedicao", formatarData(agente.getDataExpedicaoCI()));
//         dados.put("filiacao", formatarFiliacao(agente));
//         dados.put("validade", "TEMPO INDETERMINADO");

//         return dados;
//     }

//     /**
//      * Prepara os parâmetros do relatório
//      */
//     private Map<String, Object> prepararParametros(AgenteVoluntario agente, Credencial credencial) throws Exception {
//         Map<String, Object> parametros = new HashMap<>();

//         // Imagens
//         parametros.put("LOGO_TJMG", new ClassPathResource("images/brasao_tjmg.png").getInputStream());
//         parametros.put("FOTO_AGENTE", obterFotoAgente(agente.getFotoPath()));

//         // QR Code para consulta pública
//         String urlConsulta = "https://agentes.tjmg.jus.br/consulta/" + credencial.getNumeroCredencial();
//         byte[] qrCodeBytes = qrCodeUtil.gerarQRCode(urlConsulta, 100, 100);
//         parametros.put("QR_CODE", qrCodeBytes);

//         // Dados de controle
//         parametros.put("CODIGO_CONTROLE", "Cod. 10.20.254-4");
//         parametros.put("VERSAO", "versão de 20/06/2022");
//         parametros.put("PROVIMENTO", "art. 362, §1º do Provimento nº 355/2018");

//         // Data de emissão
//         parametros.put("DATA_EMISSAO", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

//         return parametros;
//     }

//     /**
//      * Obtém o nome da comarca do agente
//      */
//     private String obterNomeComarca(AgenteVoluntario agente) {
//         // Buscar comarca através do relacionamento agente_comarca
//         return agente.getComarcas().stream()
//             .filter(ac -> ac.getAtivo())
//             .map(ac -> ac.getComarca().getNomeComarca())
//             .findFirst()
//             .orElse("NÃO INFORMADO");
//     }

//     /**
//      * Formata CPF para exibição
//      */
//     private String formatarCPF(String cpf) {
//         if (cpf == null || cpf.length() != 11) {
//             return cpf;
//         }
//         return cpf.substring(0, 3) + "." + 
//                cpf.substring(3, 6) + "." + 
//                cpf.substring(6, 9) + "-" + 
//                cpf.substring(9);
//     }

//     /**
//      * Formata data para exibição
//      */
//     private String formatarData(LocalDate data) {
//         if (data == null) {
//             return "";
//         }
//         return data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
//     }

//     /**
//      * Formata filiação (pai e mãe)
//      */
//     private String formatarFiliacao(AgenteVoluntario agente) {
//         StringBuilder filiacao = new StringBuilder();
        
//         if (agente.getFiliacao_mae() != null && !agente.getFiliacao_mae().trim().isEmpty()) {
//             filiacao.append("Mãe: ").append(agente.getFiliacao_mae());
//         }
        
//         if (agente.getFiliacao_pai() != null && !agente.getFiliacao_pai().trim().isEmpty()) {
//             if (filiacao.length() > 0) {
//                 filiacao.append("\n");
//             }
//             filiacao.append("Pai: ").append(agente.getFiliacao_pai());
//         }
        
//         return filiacao.toString();
//     }

//     /**
//      * Obtém a foto do agente
//      */
//     private InputStream obterFotoAgente(String fotoPath) {
//         try {
//             if (fotoPath != null && !fotoPath.trim().isEmpty()) {
//                 return new ClassPathResource("uploads/" + fotoPath).getInputStream();
//             } else {
//                 // Foto padrão se não houver foto
//                 return new ClassPathResource("images/foto_padrao.png").getInputStream();
//             }
//         } catch (Exception e) {
//             try {
//                 return new ClassPathResource("images/foto_padrao.png").getInputStream();
//             } catch (Exception ex) {
//                 return null;
//             }
//         }
//     }

//     /**
//      * Valida se o agente pode ter carteirinha gerada
//      */
//     public boolean podeGerarCarteirinha(String agenteId) {
//         Optional<AgenteVoluntario> agente = agenteRepository.findById(agenteId);
//         if (!agente.isPresent()) {
//             return false;
//         }

//         // Verificar se agente está ativo
//         if (!"ATIVO".equals(agente.get().getStatus())) {
//             return false;
//         }

//         // Verificar se possui credencial ativa
//         Optional<Credencial> credencial = credencialRepository.findByAgenteIdAndStatus(agenteId, "ATIVA");
//         return credencial.isPresent();
//     }

// }

