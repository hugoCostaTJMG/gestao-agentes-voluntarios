package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.AreaAtuacaoDTO;
import br.gov.corregedoria.agentes.entity.AreaAtuacao;
import br.gov.corregedoria.agentes.repository.AreaAtuacaoRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/areas-atuacao")
@Tag(name = "Áreas de Atuação", description = "APIs para gestão de áreas de atuação")
@CrossOrigin(origins = "*")
public class AreaAtuacaoController {

    @Autowired
    private AreaAtuacaoRepository areaAtuacaoRepository;

    @Operation(summary = "Listar todas as áreas de atuação", 
               description = "Lista todas as áreas de atuação cadastradas no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de áreas de atuação"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('uma_authorization')")
    public ResponseEntity<List<AreaAtuacaoDTO>> listarAreasAtuacao() {
        List<AreaAtuacaoDTO> areas = areaAtuacaoRepository.findAll().stream()
                .map(area -> new AreaAtuacaoDTO(area.getId(), area.getNomeAreaAtuacao()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(areas);
    }

    @Operation(summary = "Cadastrar nova área de atuação", 
               description = "Cadastra uma nova área de atuação no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Área de atuação cadastrada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
        @ApiResponse(responseCode = "409", description = "Área de atuação já existe"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('uma_authorization')")
    public ResponseEntity<AreaAtuacaoDTO> cadastrarAreaAtuacao(@Valid @RequestBody AreaAtuacaoDTO dto) {
        if (areaAtuacaoRepository.existsByNomeAreaAtuacao(dto.getNomeAreaAtuacao())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        AreaAtuacao area = new AreaAtuacao(dto.getNomeAreaAtuacao());
        area = areaAtuacaoRepository.save(area);
        
        AreaAtuacaoDTO response = new AreaAtuacaoDTO(area.getId(), area.getNomeAreaAtuacao());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Buscar área de atuação por ID", 
               description = "Busca uma área de atuação específica pelo seu ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Área de atuação encontrada"),
        @ApiResponse(responseCode = "404", description = "Área de atuação não encontrada"),
        @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<AreaAtuacaoDTO> buscarAreaAtuacaoPorId(@PathVariable Long id) {
        return areaAtuacaoRepository.findById(id)
                .map(area -> ResponseEntity.ok(new AreaAtuacaoDTO(area.getId(), area.getNomeAreaAtuacao())))
                .orElse(ResponseEntity.notFound().build());
    }
}

