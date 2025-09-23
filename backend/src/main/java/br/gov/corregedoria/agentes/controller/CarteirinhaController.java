package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.service.CarteirinhaService;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carteirinha")
@Tag(name = "Carteirinha", description = "Geração de carteirinha do agente voluntário")
@CrossOrigin(origins = "*")
public class CarteirinhaController {

    private final CarteirinhaService service;
    private final AuditoriaUtil auditoriaUtil;

    public CarteirinhaController(CarteirinhaService service, AuditoriaUtil auditoriaUtil) {
        this.service = service;
        this.auditoriaUtil = auditoriaUtil;
    }

    @Operation(summary = "Verificar se pode gerar carteirinha")
    @GetMapping("/verificar/{agenteId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<?> verificar(@PathVariable Long agenteId) {
        var v = service.verificar(agenteId);
        return ResponseEntity.ok(java.util.Map.of(
                "podeGerar", v.podeGerar(),
                "mensagem", v.mensagem()
        ));
    }

    @Operation(summary = "Preview da carteirinha (PDF inline)")
    @GetMapping("/preview/{agenteId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<byte[]> preview(@PathVariable Long agenteId, Authentication auth) throws Exception {
        byte[] pdf = service.gerarPdf(agenteId, true);
        auditoriaUtil.registrarLog(auth != null ? auth.getName() : "anon", "PREVIEW_CARTEIRINHA", "Agente=" + agenteId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=carteirinha_preview.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @Operation(summary = "Gerar carteirinha (PDF para download)")
    @GetMapping("/gerar/{agenteId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENTE') or hasRole('CORREGEDORIA') or hasRole('COFIJ')")
    public ResponseEntity<byte[]> gerar(@PathVariable Long agenteId, Authentication auth) throws Exception {
        byte[] pdf = service.gerarPdf(agenteId, false);
        auditoriaUtil.registrarLog(auth != null ? auth.getName() : "anon", "GERAR_CARTEIRINHA", "Agente=" + agenteId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=carteirinha_" + agenteId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

