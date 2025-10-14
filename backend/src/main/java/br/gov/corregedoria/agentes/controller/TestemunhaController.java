package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.entity.Testemunha;
import br.gov.corregedoria.agentes.service.TestemunhaService;
import br.gov.corregedoria.agentes.web.dto.TestemunhaDtos;
import br.gov.corregedoria.agentes.web.mapper.DomainMappers;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/testemunhas")
@Tag(name = "Testemunhas")
@CrossOrigin(origins = "*")
public class TestemunhaController {

    @Autowired
    private TestemunhaService service;

    @Operation(summary = "Listar testemunhas")
    @GetMapping
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<Page<TestemunhaDtos.TestemunhaResponse>> listar(Pageable pageable) {
        Page<TestemunhaDtos.TestemunhaResponse> page = service.listar(pageable)
                .map(DomainMappers::toDto);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Buscar testemunha por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<TestemunhaDtos.TestemunhaResponse> buscar(@PathVariable Long id) {
        Testemunha t = service.buscar(id);
        return ResponseEntity.ok(DomainMappers.toDto(t));
    }

    @Operation(summary = "Criar testemunha")
    @PostMapping
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<TestemunhaDtos.TestemunhaResponse> criar(@Valid @RequestBody TestemunhaDtos.TestemunhaRequest dto) {
        Testemunha salvo = service.criar(DomainMappers.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(DomainMappers.toDto(salvo));
    }

    @Operation(summary = "Atualizar testemunha")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<TestemunhaDtos.TestemunhaResponse> atualizar(@PathVariable Long id,
                                                  @Valid @RequestBody TestemunhaDtos.TestemunhaRequest dto) {
        Testemunha atualizado = service.atualizar(id, DomainMappers.toEntity(dto));
        return ResponseEntity.ok(DomainMappers.toDto(atualizado));
    }

    @Operation(summary = "Excluir testemunha")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}

