package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.entity.AutoInfracao;
import br.gov.corregedoria.agentes.entity.StatusAutoInfracao;
import br.gov.corregedoria.agentes.service.AutoInfracaoService;
import io.swagger.v3.oas.annotations.Operation;
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


@RestController
@RequestMapping("/api/autos")
@Tag(name = "Autos de Infração", description = "APIs para gestão de autos de infração")
@CrossOrigin(origins = "*")
public class AutoInfracaoController {

    @Autowired
    private AutoInfracaoService autoService;

    @Operation(summary = "Listar autos de infração")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('uma_authorization')")
    public ResponseEntity<Page<AutoInfracao>> listar(Pageable pageable,
                                                    @RequestParam(required = false) StatusAutoInfracao status,
                                                    Authentication authentication) {
        String matricula = authentication.getName();
        Page<AutoInfracao> autos = autoService.listar(pageable, matricula, status);
        return ResponseEntity.ok(autos);
    }

    @Operation(summary = "Buscar auto por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('AGENTE')")
    public ResponseEntity<AutoInfracao> buscar(@PathVariable Long id,
                                               Authentication authentication) {
        Long agenteId = Long.parseLong(authentication.getName());
        String perfil = authentication.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("AGENTE");
        AutoInfracao auto = autoService.buscarPorId(id, agenteId, perfil);
        return ResponseEntity.ok(auto);
    }

    @Operation(summary = "Cadastrar auto de infração")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('uma_authorization')")
    public ResponseEntity<AutoInfracao> cadastrar(@Valid @RequestBody AutoInfracao auto,
                                                  Authentication authentication) {
        Long agenteId = Long.parseLong(authentication.getName());
        AutoInfracao salvo = autoService.cadastrar(auto, agenteId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @Operation(summary = "Atualizar auto de infração")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('AGENTE')")
    public ResponseEntity<AutoInfracao> atualizar(@PathVariable Long id,
                                                  @Valid @RequestBody AutoInfracao auto,
                                                  Authentication authentication) {
        Long agenteId = Long.parseLong(authentication.getName());
        String perfil = authentication.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("AGENTE");
        AutoInfracao atualizado = autoService.atualizar(id, auto, agenteId, perfil, authentication.getName());
        return ResponseEntity.ok(atualizado);
    }

    @Operation(summary = "Excluir auto de infração")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('AGENTE')")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        Authentication authentication) {
        Long agenteId = Long.parseLong(authentication.getName());
        autoService.excluir(id, agenteId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cancelar auto de infração")
    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR')")
    public ResponseEntity<AutoInfracao> cancelar(@PathVariable Long id,
                                                 @RequestBody String justificativa,
                                                 Authentication authentication) {
        String perfil = authentication.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("AGENTE");
        AutoInfracao auto = autoService.cancelar(id, justificativa, authentication.getName(), perfil);
        return ResponseEntity.ok(auto);
    }
}

