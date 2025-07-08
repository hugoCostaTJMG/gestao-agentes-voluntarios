package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.ComarcaDTO;
import br.gov.corregedoria.agentes.entity.Comarca;
import br.gov.corregedoria.agentes.repository.ComarcaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comarcas")
@Tag(name = "Comarcas", description = "APIs para gestão de comarcas")
@CrossOrigin(origins = "*")
public class ComarcaController {

    @Autowired
    private ComarcaRepository comarcaRepository;

    @Operation(summary = "Listar todas as comarcas", 
               description = "Lista todas as comarcas cadastradas no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de comarcas"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<List<ComarcaDTO>> listarComarcas() {
        List<ComarcaDTO> comarcas = comarcaRepository.findAll().stream()
                .map(comarca -> new ComarcaDTO(comarca.getId(), comarca.getNomeComarca()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(comarcas);
    }

    @Operation(summary = "Cadastrar nova comarca", 
               description = "Cadastra uma nova comarca no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Comarca cadastrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Comarca já existe"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA')")
    public ResponseEntity<ComarcaDTO> cadastrarComarca(@Valid @RequestBody ComarcaDTO dto) {
        if (comarcaRepository.existsByNomeComarca(dto.getNomeComarca())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Comarca comarca = new Comarca(dto.getNomeComarca());
        comarca = comarcaRepository.save(comarca);
        
        ComarcaDTO response = new ComarcaDTO(comarca.getId(), comarca.getNomeComarca());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Buscar comarca por ID", 
               description = "Busca uma comarca específica pelo seu ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comarca encontrada"),
        @ApiResponse(responseCode = "404", description = "Comarca não encontrada"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<ComarcaDTO> buscarComarcaPorId(@PathVariable UUID id) {
        return comarcaRepository.findById(id)
                .map(comarca -> ResponseEntity.ok(new ComarcaDTO(comarca.getId(), comarca.getNomeComarca())))
                .orElse(ResponseEntity.notFound().build());
    }
}

