package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.AgenteVoluntarioResponseDTO;
import br.gov.corregedoria.agentes.dto.LoginGovBrDTO;
import br.gov.corregedoria.agentes.service.GovBrAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação gov.br", description = "APIs para autenticação via gov.br")
@CrossOrigin(origins = "*")
public class GovBrAuthController {

    @Autowired
    private GovBrAuthService govBrAuthService;

    @Operation(summary = "Login via gov.br", 
               description = "Autentica um agente voluntário usando sua conta gov.br")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
        @ApiResponse(responseCode = "401", description = "Token inválido ou CPF não cadastrado"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping("/govbr/login")
    public ResponseEntity<AgenteVoluntarioResponseDTO> loginGovBr(
            @Valid @RequestBody LoginGovBrDTO loginDto) {
        
        AgenteVoluntarioResponseDTO response = govBrAuthService.autenticarViaGovBr(loginDto);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Verificar CPF cadastrado", 
               description = "Verifica se um CPF está cadastrado como agente voluntário")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificação realizada")
    })
    @GetMapping("/govbr/verificar-cpf/{cpf}")
    public ResponseEntity<Boolean> verificarCpfCadastrado(
            @Parameter(description = "CPF para verificação") @PathVariable String cpf) {
        
        boolean cadastrado = govBrAuthService.cpfCadastradoComoAgente(cpf);
        return ResponseEntity.ok(cadastrado);
    }

    @Operation(summary = "URL de autorização gov.br", 
               description = "Gera a URL para redirecionamento ao gov.br")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "URL gerada com sucesso")
    })
    @GetMapping("/govbr/authorize-url")
    public ResponseEntity<Map<String, String>> gerarUrlAutorizacao(
            @Parameter(description = "URI de redirecionamento") 
            @RequestParam String redirectUri) {
        
        String url = govBrAuthService.gerarUrlAutorizacaoGovBr(redirectUri);
        return ResponseEntity.ok(Map.of("authorizeUrl", url));
    }

    @Operation(summary = "Trocar código por token", 
               description = "Troca o código de autorização por um token de acesso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token obtido com sucesso"),
        @ApiResponse(responseCode = "400", description = "Código inválido")
    })
    @PostMapping("/govbr/token")
    public ResponseEntity<Map<String, String>> trocarCodigoPorToken(
            @Parameter(description = "Código de autorização") @RequestParam String code,
            @Parameter(description = "URI de redirecionamento") @RequestParam String redirectUri) {
        
        String token = govBrAuthService.trocarCodigoPorToken(code, redirectUri);
        return ResponseEntity.ok(Map.of("accessToken", token));
    }
}

