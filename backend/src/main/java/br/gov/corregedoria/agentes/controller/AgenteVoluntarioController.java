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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('uma_authorization')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ') or hasRole('AGENTE')")
    public ResponseEntity<AgenteVoluntarioResponseDTO> buscarPorId(
            @Parameter(description = "ID do agente") @PathVariable Long id) {
        
        AgenteVoluntarioResponseDTO response = agenteService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Buscar agente por CPF",
               description = "Busca um agente voluntário pelo seu CPF")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Agente encontrado"),
        @ApiResponse(responseCode = "404", description = "Agente não encontrado"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/cpf/{cpf}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ') or hasRole('AGENTE')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('uma_authorization')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<Boolean> podeEmitirCredencial(
            @Parameter(description = "ID do agente") @PathVariable Long id) {
        
        boolean podeEmitir = agenteService.podeEmitirCredencial(id);
        return ResponseEntity.ok(podeEmitir);
    }
}
