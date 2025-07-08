// package br.gov.corregedoria.agentes.controller;

// import br.gov.corregedoria.agentes.service.CarteirinhaService;
// import br.gov.corregedoria.agentes.util.AuditoriaUtil;
// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.Parameter;
// import io.swagger.v3.oas.annotations.responses.ApiResponse;
// import io.swagger.v3.oas.annotations.responses.ApiResponses;
// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// import io.swagger.v3.oas.annotations.tags.Tag;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import javax.servlet.http.HttpServletRequest;
// import java.time.LocalDateTime;
// import java.time.format.DateTimeFormatter;

// /**
//  * Controller para geração de carteirinha de agente voluntário
//  */
// @RestController
// @RequestMapping("/api/carteirinha")
// @Tag(name = "Carteirinha", description = "Operações relacionadas à geração de carteirinha de agente voluntário")
// @SecurityRequirement(name = "bearerAuth")
// public class CarteirinhaController {

//     @Autowired
//     private CarteirinhaService carteirinhaService;

//     @Autowired
//     private AuditoriaUtil auditoriaUtil;

//     /**
//      * Gera a carteirinha do agente voluntário em PDF
//      */
//     @GetMapping("/gerar/{agenteId}")
//     @Operation(summary = "Gerar carteirinha do agente voluntário", 
//                description = "Gera a carteirinha oficial do agente voluntário em formato PDF")
//     @ApiResponses(value = {
//         @ApiResponse(responseCode = "200", description = "Carteirinha gerada com sucesso"),
//         @ApiResponse(responseCode = "400", description = "Dados inválidos"),
//         @ApiResponse(responseCode = "403", description = "Acesso negado"),
//         @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
//         @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
//     })
//     @PreAuthorize("hasAnyRole('CORREGEDORIA', 'COFIJ', 'ADMINISTRADOR')")
//     public ResponseEntity<?> gerarCarteirinha(
//             @Parameter(description = "ID do agente voluntário", required = true)
//             @PathVariable String agenteId,
//             HttpServletRequest request) {
        
//         try {
//             // Verificar se o agente pode ter carteirinha gerada
//             if (!carteirinhaService.podeGerarCarteirinha(agenteId)) {
//                 return ResponseEntity.badRequest()
//                     .body(Map.of("erro", "Agente não está apto para geração de carteirinha. " +
//                                         "Verifique se está ativo e possui credencial válida."));
//             }

//             // Gerar carteirinha
//             byte[] carteirinhaPdf = carteirinhaService.gerarCarteirinha(agenteId);

//             // Registrar auditoria
//             auditoriaUtil.registrarOperacao(
//                 "GERAR_CARTEIRINHA",
//                 "Carteirinha gerada para agente: " + agenteId,
//                 request
//             );

//             // Preparar resposta
//             String nomeArquivo = "carteirinha_agente_" + 
//                                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
//                                ".pdf";

//             HttpHeaders headers = new HttpHeaders();
//             headers.setContentType(MediaType.APPLICATION_PDF);
//             headers.setContentDispositionFormData("attachment", nomeArquivo);
//             headers.setContentLength(carteirinhaPdf.length);

//             return ResponseEntity.ok()
//                 .headers(headers)
//                 .body(carteirinhaPdf);

//         } catch (RuntimeException e) {
//             // Registrar erro de auditoria
//             auditoriaUtil.registrarOperacao(
//                 "ERRO_GERAR_CARTEIRINHA",
//                 "Erro ao gerar carteirinha para agente: " + agenteId + " - " + e.getMessage(),
//                 request
//             );

//             return ResponseEntity.badRequest()
//                 .body(Map.of("erro", e.getMessage()));

//         } catch (Exception e) {
//             // Registrar erro de auditoria
//             auditoriaUtil.registrarOperacao(
//                 "ERRO_GERAR_CARTEIRINHA",
//                 "Erro interno ao gerar carteirinha para agente: " + agenteId + " - " + e.getMessage(),
//                 request
//             );

//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(Map.of("erro", "Erro interno do servidor ao gerar carteirinha"));
//         }
//     }

//     /**
//      * Verifica se o agente pode ter carteirinha gerada
//      */
//     @GetMapping("/verificar/{agenteId}")
//     @Operation(summary = "Verificar se agente pode ter carteirinha gerada", 
//                description = "Verifica se o agente está apto para geração de carteirinha")
//     @ApiResponses(value = {
//         @ApiResponse(responseCode = "200", description = "Verificação realizada com sucesso"),
//         @ApiResponse(responseCode = "403", description = "Acesso negado")
//     })
//     @PreAuthorize("hasAnyRole('CORREGEDORIA', 'COFIJ', 'ADMINISTRADOR')")
//     public ResponseEntity<?> verificarAgenteCarteirinha(
//             @Parameter(description = "ID do agente voluntário", required = true)
//             @PathVariable String agenteId) {
        
//         try {
//             boolean podeGerar = carteirinhaService.podeGerarCarteirinha(agenteId);
            
//             return ResponseEntity.ok(Map.of(
//                 "podeGerar", podeGerar,
//                 "mensagem", podeGerar ? 
//                     "Agente apto para geração de carteirinha" : 
//                     "Agente não está apto para geração de carteirinha"
//             ));

//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(Map.of("erro", "Erro ao verificar status do agente"));
//         }
//     }

//     /**
//      * Visualizar carteirinha (preview) sem download
//      */
//     @GetMapping("/preview/{agenteId}")
//     @Operation(summary = "Visualizar preview da carteirinha", 
//                description = "Gera preview da carteirinha para visualização no navegador")
//     @ApiResponses(value = {
//         @ApiResponse(responseCode = "200", description = "Preview gerado com sucesso"),
//         @ApiResponse(responseCode = "400", description = "Dados inválidos"),
//         @ApiResponse(responseCode = "403", description = "Acesso negado"),
//         @ApiResponse(responseCode = "404", description = "Agente não encontrado")
//     })
//     @PreAuthorize("hasAnyRole('CORREGEDORIA', 'COFIJ', 'ADMINISTRADOR')")
//     public ResponseEntity<?> previewCarteirinha(
//             @Parameter(description = "ID do agente voluntário", required = true)
//             @PathVariable String agenteId,
//             HttpServletRequest request) {
        
//         try {
//             // Verificar se o agente pode ter carteirinha gerada
//             if (!carteirinhaService.podeGerarCarteirinha(agenteId)) {
//                 return ResponseEntity.badRequest()
//                     .body(Map.of("erro", "Agente não está apto para geração de carteirinha"));
//             }

//             // Gerar carteirinha
//             byte[] carteirinhaPdf = carteirinhaService.gerarCarteirinha(agenteId);

//             // Registrar auditoria
//             auditoriaUtil.registrarOperacao(
//                 "PREVIEW_CARTEIRINHA",
//                 "Preview de carteirinha visualizado para agente: " + agenteId,
//                 request
//             );

//             // Preparar resposta para visualização inline
//             HttpHeaders headers = new HttpHeaders();
//             headers.setContentType(MediaType.APPLICATION_PDF);
//             headers.setContentDispositionFormData("inline", "preview_carteirinha.pdf");

//             return ResponseEntity.ok()
//                 .headers(headers)
//                 .body(carteirinhaPdf);

//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(Map.of("erro", "Erro ao gerar preview da carteirinha"));
//         }
//     }
// }

