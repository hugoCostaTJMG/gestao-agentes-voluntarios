package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.CredencialDTO;
import br.gov.corregedoria.agentes.service.CredencialService;
import com.google.zxing.WriterException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/credenciais")
@Tag(name = "Credenciais", description = "APIs para gestão de credenciais")
@CrossOrigin(origins = "*")
public class CredencialController {

    @Autowired
    private CredencialService credencialService;

    @Operation(summary = "Emitir credencial para agente", 
               description = "Emite uma nova credencial para um agente ativo")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Credencial emitida com sucesso"),
        @ApiResponse(responseCode = "400", description = "Agente não está ativo"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PostMapping("/emitir/{agenteId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COFIJ')")
    public ResponseEntity<CredencialDTO> emitirCredencial(
            @Parameter(description = "ID do agente") @PathVariable Long agenteId,
            Authentication authentication) throws WriterException, IOException {
        
        String usuarioLogado = authentication.getName();
        CredencialDTO response = credencialService.emitirCredencial(agenteId, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Listar credenciais do agente", 
               description = "Lista todas as credenciais emitidas para um agente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de credenciais"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/agente/{agenteId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<List<CredencialDTO>> listarCredenciaisDoAgente(
            @Parameter(description = "ID do agente") @PathVariable Long agenteId) {
        
        List<CredencialDTO> response = credencialService.listarCredenciaisDoAgente(agenteId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Buscar credencial por ID", 
               description = "Busca uma credencial específica pelo seu ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Credencial encontrada"),
        @ApiResponse(responseCode = "404", description = "Credencial não encontrada"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/{credencialId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<CredencialDTO> buscarCredencialPorId(
            @Parameter(description = "ID da credencial") @PathVariable Long credencialId) {
        
        CredencialDTO response = credencialService.buscarCredencialPorId(credencialId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Gerar PDF da credencial", 
               description = "Gera o arquivo PDF da credencial para impressão")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Credencial não encontrada"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/{credencialId}/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COFIJ')")
    public ResponseEntity<byte[]> gerarPDFCredencial(
            @Parameter(description = "ID da credencial") @PathVariable Long credencialId)
            throws WriterException, IOException {
        
        byte[] pdfBytes = credencialService.gerarPDFCredencial(credencialId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "credencial_" + credencialId + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}

