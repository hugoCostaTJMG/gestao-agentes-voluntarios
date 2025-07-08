package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.ConsultaPublicaDTO;
import br.gov.corregedoria.agentes.service.ConsultaPublicaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/public")
@Tag(name = "Consulta Pública", description = "APIs públicas para verificação de credenciais")
@CrossOrigin(origins = "*")
public class ConsultaPublicaController {

    @Autowired
    private ConsultaPublicaService consultaPublicaService;

    @Operation(summary = "Verificar credencial via QR Code", 
               description = "Consulta pública para verificação de credencial através do QR Code")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Credencial válida - dados públicos retornados"),
        @ApiResponse(responseCode = "404", description = "Credencial não encontrada ou inválida")
    })
    @GetMapping("/verificar/{credencialId}")
    public ResponseEntity<ConsultaPublicaDTO> verificarCredencial(
            @Parameter(description = "ID da credencial obtido via QR Code") 
            @PathVariable UUID credencialId) {
        
        try {
            ConsultaPublicaDTO response = consultaPublicaService.consultarCredencial(credencialId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Verificar validade da credencial", 
               description = "Verifica apenas se uma credencial é válida (retorna true/false)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificação realizada")
    })
    @GetMapping("/validar/{credencialId}")
    public ResponseEntity<Boolean> validarCredencial(
            @Parameter(description = "ID da credencial") 
            @PathVariable UUID credencialId) {
        
        boolean valida = consultaPublicaService.credencialValida(credencialId);
        return ResponseEntity.ok(valida);
    }

    @Operation(summary = "Página de verificação", 
               description = "Página HTML para exibição dos dados públicos do agente")
    @GetMapping("/verificar/{credencialId}/pagina")
    public ResponseEntity<String> paginaVerificacao(
            @Parameter(description = "ID da credencial") 
            @PathVariable UUID credencialId) {
        
        try {
            ConsultaPublicaDTO dados = consultaPublicaService.consultarCredencial(credencialId);
            
            String html = gerarPaginaHTML(dados);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(html);
        } catch (Exception e) {
            String htmlErro = gerarPaginaErro();
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(htmlErro);
        }
    }

    private String gerarPaginaHTML(ConsultaPublicaDTO dados) {
        return """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificação de Credencial - Agente Voluntário</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { color: #2c5aa0; font-size: 24px; font-weight: bold; }
                    .status-ativo { color: #28a745; font-weight: bold; }
                    .status-inativo { color: #dc3545; font-weight: bold; }
                    .info-item { margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #2c5aa0; }
                    .info-label { font-weight: bold; color: #495057; }
                    .info-value { color: #212529; margin-top: 5px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6c757d; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🏛️ Corregedoria</div>
                        <h2>Verificação de Credencial</h2>
                        <p>Agente Voluntário da Infância e Juventude</p>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Nome Completo:</div>
                        <div class="info-value">%s</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Situação Atual:</div>
                        <div class="info-value %s">%s</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Comarca(s) de Atuação:</div>
                        <div class="info-value">%s</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Data de Cadastro:</div>
                        <div class="info-value">%s</div>
                    </div>
                    
                    <div class="footer">
                        <p>✅ Credencial verificada em %s</p>
                        <p>Esta consulta é pública e exibe apenas informações básicas do agente.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                dados.getNomeCompleto(),
                dados.getSituacao().equals("Ativo") ? "status-ativo" : "status-inativo",
                dados.getSituacao(),
                dados.getComarcasAtuacao(),
                dados.getDataCadastro(),
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            );
    }

    private String gerarPaginaErro() {
        return """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Credencial Inválida</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                    .error { color: #dc3545; font-size: 18px; margin: 20px 0; }
                    .logo { color: #2c5aa0; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🏛️ Corregedoria</div>
                    <h2>❌ Credencial Inválida</h2>
                    <div class="error">
                        O QR Code escaneado não corresponde a uma credencial válida ou a credencial pode ter sido revogada.
                    </div>
                    <p>Por favor, verifique se o QR Code está correto ou entre em contato com a Corregedoria para mais informações.</p>
                </div>
            </body>
            </html>
            """;
    }
}

