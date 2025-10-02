package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.DashboardOverviewDTO;
import br.gov.corregedoria.agentes.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dados consolidados para o painel")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Overview do Dashboard")
    @GetMapping("/overview")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('COMARCA') or hasRole('AGENTE')")
    public ResponseEntity<DashboardOverviewDTO> overview(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(dashboardService.overview(authentication));
    }
}
