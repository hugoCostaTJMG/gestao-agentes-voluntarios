package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.entity.Estabelecimento;
import br.gov.corregedoria.agentes.service.EstabelecimentoService;
import br.gov.corregedoria.agentes.web.dto.EstabelecimentoDtos;
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
@RequestMapping("/api/estabelecimentos")
@Tag(name = "Estabelecimentos")
@CrossOrigin(origins = "*")
public class EstabelecimentoController {

    @Autowired
    private EstabelecimentoService service;

    @Operation(summary = "Listar estabelecimentos")
    @GetMapping
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<Page<EstabelecimentoDtos.EstabelecimentoResponse>> listar(Pageable pageable) {
        Page<EstabelecimentoDtos.EstabelecimentoResponse> page = service.listar(pageable)
                .map(DomainMappers::toDto);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Buscar estabelecimento por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<EstabelecimentoDtos.EstabelecimentoResponse> buscar(@PathVariable Long id) {
        Estabelecimento e = service.buscar(id);
        return ResponseEntity.ok(DomainMappers.toDto(e));
    }

    @Operation(summary = "Criar estabelecimento")
    @PostMapping
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<EstabelecimentoDtos.EstabelecimentoResponse> criar(@Valid @RequestBody EstabelecimentoDtos.EstabelecimentoRequest dto) {
        Estabelecimento salvo = service.criar(DomainMappers.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(DomainMappers.toDto(salvo));
    }

    @Operation(summary = "Atualizar estabelecimento")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<EstabelecimentoDtos.EstabelecimentoResponse> atualizar(@PathVariable Long id,
                                                  @Valid @RequestBody EstabelecimentoDtos.EstabelecimentoRequest dto) {
        Estabelecimento atualizado = service.atualizar(id, DomainMappers.toEntity(dto));
        return ResponseEntity.ok(DomainMappers.toDto(atualizado));
    }

    @Operation(summary = "Excluir estabelecimento")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CORREGEDORIA')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}

