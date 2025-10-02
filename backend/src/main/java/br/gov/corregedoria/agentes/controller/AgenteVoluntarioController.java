package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.AgenteVoluntarioDTO;
import br.gov.corregedoria.agentes.dto.AgenteVoluntarioResponseDTO;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.service.AgenteVoluntarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agentes")
@Tag(name = "Agentes Voluntários", description = "APIs para gestão de agentes voluntários")
@CrossOrigin(origins = "*")
public class AgenteVoluntarioController {

    @Autowired
    private AgenteVoluntarioService agenteService;

    @Operation(summary = "Cadastrar novo agente voluntário", 
               description = "Cadastra um novo agente voluntário no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Agente cadastrado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "CPF já cadastrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PostMapping
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('COMARCA')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> cadastrarAgente(
            @Valid @RequestBody AgenteVoluntarioDTO dto,
            Authentication authentication) {
        
        String usuarioLogado = authentication.getName();
        AgenteVoluntarioResponseDTO response = agenteService.cadastrarAgente(dto, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Buscar agente por ID", 
               description = "Busca um agente voluntário pelo seu ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Agente encontrado"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('COMARCA')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> buscarPorId(
            @Parameter(description = "ID do agente") @PathVariable Long id) {
        
        AgenteVoluntarioResponseDTO response = agenteService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Obter dados do próprio agente (perfil AGENTE)",
               description = "Retorna os dados do agente vinculado ao usuário autenticado (via CPF do token)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dados do agente encontrados"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado para o usuário atual"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/me")
    @PreAuthorize("hasRole('AGENTE')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> buscarPorIdAgenteVoluntario(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String cpf = extractCpfFromJwt(jwt);
        if (cpf == null || cpf.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        try {
            AgenteVoluntarioResponseDTO dto = agenteService.buscarPorCpf(cpf);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private static String extractCpfFromJwt(Jwt jwt) {
        try {
            Object claimCpf = jwt.getClaims().get("cpf");
            String cpf = claimCpf instanceof String ? (String) claimCpf : null;
            if (cpf == null || cpf.isBlank()) {
                Object doc = jwt.getClaims().get("documento");
                cpf = doc instanceof String ? (String) doc : null;
            }
            if (cpf == null) return null;
            return cpf.replaceAll("\\D", "");
        } catch (Exception e) {
            return null;
        }
    }

    @Operation(summary = "Obter foto do agente", description = "Retorna a foto do agente, caso cadastrada")
    @GetMapping("/{id}/foto")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('COMARCA') or hasRole('AGENTE')")
    public ResponseEntity<byte[]> obterFoto(@Parameter(description = "ID do agente") @PathVariable Long id,
                                            @AuthenticationPrincipal Jwt jwt,
                                            Authentication authentication) {
        // Se for AGENTE, restringe à própria foto
        try {
            boolean isAgente = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_AGENTE".equalsIgnoreCase(a.getAuthority()));
            if (isAgente && jwt != null) {
                String cpf = extractCpfFromJwt(jwt);
                if (cpf != null && !cpf.isBlank()) {
                    try {
                        AgenteVoluntarioResponseDTO me = agenteService.buscarPorCpf(cpf);
                        if (me.getId() != null && !me.getId().equals(id)) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                        }
                    } catch (Exception ignored) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                }
            }
        } catch (Exception ignored) { }

        return agenteService.obterFotoAgente(id)
                .filter(foto -> foto != null && foto.length > 0)
                .map(foto -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(deduzirMimeImagem(foto)))
                        .body(foto))
                .orElse(ResponseEntity.notFound().build());
    }

    private static String deduzirMimeImagem(byte[] data) {
        if (data == null || data.length < 4) return MediaType.IMAGE_JPEG_VALUE;
        if ((data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47) return MediaType.IMAGE_PNG_VALUE;
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8) return MediaType.IMAGE_JPEG_VALUE;
        return MediaType.IMAGE_JPEG_VALUE;
    }

    @Operation(summary = "Buscar agente por CPF",
               description = "Busca um agente voluntário pelo seu CPF")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Agente encontrado"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/cpf/{cpf}")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('COMARCA')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> buscarPorCpf(
            @Parameter(description = "CPF do agente") @PathVariable String cpf) {

        AgenteVoluntarioResponseDTO response = agenteService.buscarPorCpf(cpf);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Listar todos os agentes", 
               description = "Lista todos os agentes voluntários com paginação")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de agentes"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('COMARCA')")
    public ResponseEntity<Page<AgenteVoluntarioResponseDTO>> listarAgentes(Pageable pageable) {
        Page<AgenteVoluntarioResponseDTO> response = agenteService.listarAgentes(pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Listar agentes por status", 
               description = "Lista agentes voluntários filtrados por status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de agentes"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<List<AgenteVoluntarioResponseDTO>> listarPorStatus(
            @Parameter(description = "Status do agente") @PathVariable StatusAgente status) {
        
        List<AgenteVoluntarioResponseDTO> response = agenteService.listarPorStatus(status);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Listar agentes ativos", 
               description = "Lista apenas agentes com status ativo (para emissão de credencial)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de agentes ativos"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PreAuthorize("hasRole('CORREGEDORIA')")
    @GetMapping("/ativos")
    public ResponseEntity<List<AgenteVoluntarioResponseDTO>> listarAgentesAtivos() {
        List<AgenteVoluntarioResponseDTO> response = agenteService.listarAgentesAtivos();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Atualizar status do agente", 
               description = "Atualiza o status de um agente voluntário")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status atualizado com sucesso"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PatchMapping(value = "/{id}/status", params = "status")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> atualizarStatus(
            @Parameter(description = "ID do agente") @PathVariable Long id,
            @Parameter(description = "Novo status") @RequestParam StatusAgente status,
            Authentication authentication) {
        
        String usuarioLogado = authentication.getName();
        AgenteVoluntarioResponseDTO response = agenteService.atualizarStatus(id, status, usuarioLogado);
        return ResponseEntity.ok(response);
    }

    // Alternativa: aceitar JSON no corpo em vez de query param
    public static class UpdateStatusRequest {
        private StatusAgente status;
        public StatusAgente getStatus() { return status; }
        public void setStatus(StatusAgente status) { this.status = status; }
    }

    @PatchMapping(value = "/{id}/status", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> atualizarStatusJson(
            @Parameter(description = "ID do agente") @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Objeto com o novo status")
            @RequestBody UpdateStatusRequest body,
            Authentication authentication) {
        if (body == null || body.getStatus() == null) {
            throw new IllegalArgumentException("Campo 'status' é obrigatório");
        }
        String usuarioLogado = authentication.getName();
        AgenteVoluntarioResponseDTO response = agenteService.atualizarStatus(id, body.getStatus(), usuarioLogado);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Atualizar dados do agente", 
               description = "Atualiza os dados de um agente voluntário")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Agente atualizado com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
        @ApiResponse(responseCode = "409", description = "CPF já cadastrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> atualizarAgente(
            @Parameter(description = "ID do agente") @PathVariable Long id,
            @Valid @RequestBody AgenteVoluntarioDTO dto,
            Authentication authentication) {
        
        String usuarioLogado = authentication.getName();
        AgenteVoluntarioResponseDTO response = agenteService.atualizarAgente(id, dto, usuarioLogado);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Buscar agentes por nome", 
               description = "Busca agentes voluntários pelo nome (busca parcial)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de agentes encontrados"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/buscar")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('COMARCA')")
    public ResponseEntity<List<AgenteVoluntarioResponseDTO>> buscarPorNome(
            @Parameter(description = "Nome para busca") @RequestParam String nome) {
        
        List<AgenteVoluntarioResponseDTO> response = agenteService.buscarPorNome(nome);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Verificar se agente pode emitir credencial", 
               description = "Verifica se um agente está apto para emissão de credencial")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificação realizada"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/{id}/pode-emitir-credencial")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<Boolean> podeEmitirCredencial(
            @Parameter(description = "ID do agente") @PathVariable Long id) {
        
        boolean podeEmitir = agenteService.podeEmitirCredencial(id);
        return ResponseEntity.ok(podeEmitir);
    }
}
