package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.entity.AutoInfracao;
import br.gov.corregedoria.agentes.entity.StatusAutoInfracao;
import br.gov.corregedoria.agentes.service.AutoInfracaoService;
import br.gov.corregedoria.agentes.entity.Comarca;
import br.gov.corregedoria.agentes.repository.ComarcaRepository;
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

    @Autowired
    private ComarcaRepository comarcaRepository;

    @Operation(summary = "Listar autos de infração")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('uma_authorization')")
    public ResponseEntity<Page<AutoInfracao>> listar(Pageable pageable,
                                                    @RequestParam(required = false) StatusAutoInfracao status,
                                                    Authentication authentication) {
        String matricula = authentication != null ? authentication.getName() : null;
        Page<AutoInfracao> autos = autoService.listar(pageable, matricula, status);
        return ResponseEntity.ok(autos);
    }

    @Operation(summary = "Buscar auto por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('AGENTE')")
    public ResponseEntity<AutoInfracao> buscar(@PathVariable Long id,
                                               Authentication authentication) {
        Long agenteId = null;
        try { agenteId = Long.parseLong(authentication.getName()); } catch (Exception ignored) {}
        String perfil = authentication.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("AGENTE");
        AutoInfracao auto = autoService.buscarPorId(id, agenteId, perfil);
        return ResponseEntity.ok(auto);
    }

    @Operation(summary = "Cadastrar auto de infração")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('uma_authorization')")
    public ResponseEntity<AutoInfracao> cadastrar(@Valid @RequestBody java.util.Map<String, Object> payload,
                                                  Authentication authentication) {
        Long agenteId = null;
        try { agenteId = Long.parseLong(authentication.getName()); } catch (Exception ignored) {}
        if (agenteId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        AutoInfracao auto = mapearAuto(payload);
        AutoInfracao salvo = autoService.cadastrar(auto, agenteId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @Operation(summary = "Atualizar auto de infração")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('AGENTE')")
    public ResponseEntity<AutoInfracao> atualizar(@PathVariable Long id,
                                                  @Valid @RequestBody java.util.Map<String, Object> payload,
                                                  Authentication authentication) {
        Long agenteId = null;
        try { agenteId = Long.parseLong(authentication.getName()); } catch (Exception ignored) {}
        String perfil = authentication.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("AGENTE");
        AutoInfracao auto = mapearAuto(payload);
        AutoInfracao atualizado = autoService.atualizar(id, auto, agenteId, perfil, authentication.getName());
        return ResponseEntity.ok(atualizado);
    }

    private AutoInfracao mapearAuto(java.util.Map<String, Object> payload) {
        AutoInfracao auto = new AutoInfracao();
        auto.setNomeAutuado((String) payload.get("nomeAutuado"));
        auto.setCpfCnpjAutuado((String) payload.get("cpfCnpjAutuado"));
        auto.setEnderecoAutuado((String) payload.get("enderecoAutuado"));
        auto.setContatoAutuado((String) payload.get("contatoAutuado"));
        auto.setBaseLegal((String) payload.get("baseLegal"));
        auto.setLocalInfracao((String) payload.get("localInfracao"));
        auto.setDescricaoConduta((String) payload.get("descricaoConduta"));
        Object iniciais = payload.get("iniciaisCrianca");
        if (iniciais instanceof String s) auto.setIniciaisCrianca(s);
        Object idade = payload.get("idadeCrianca");
        if (idade instanceof Number n) auto.setIdadeCrianca(n.intValue());
        Object sexo = payload.get("sexoCrianca");
        if (sexo instanceof String s) auto.setSexoCrianca(s);

        // Datas e horas
        Object dataInfracao = payload.get("dataInfracao");
        if (dataInfracao instanceof String ds && !ds.isBlank()) {
            auto.setDataInfracao(java.time.LocalDate.parse(ds));
        }
        Object horaInfracao = payload.get("horaInfracao");
        if (horaInfracao instanceof String hs && !hs.isBlank()) {
            auto.setHoraInfracao(java.time.LocalTime.parse(hs));
        }

        // Comarca
        Object comarcaIdObj = payload.get("comarcaId");
        if (comarcaIdObj instanceof Number n) {
            Long comarcaId = n.longValue();
            Comarca c = comarcaRepository.findById(comarcaId)
                    .orElseThrow(() -> new IllegalArgumentException("Comarca inválida: " + comarcaId));
            auto.setComarca(c);
        }
        return auto;
    }

    @Operation(summary = "Excluir auto de infração")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('AGENTE')")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        Authentication authentication) {
        Long agenteId = null;
        try { agenteId = Long.parseLong(authentication.getName()); } catch (Exception ignored) {}
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

    @Operation(summary = "Registrar auto de infração")
    @PatchMapping("/{id}/registrar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR') or hasRole('AGENTE')")
    public ResponseEntity<AutoInfracao> registrar(@PathVariable Long id,
                                                  Authentication authentication) {
        String perfil = authentication.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("AGENTE");
        AutoInfracao auto = autoService.registrar(id, authentication.getName(), perfil);
        return ResponseEntity.ok(auto);
    }
}
