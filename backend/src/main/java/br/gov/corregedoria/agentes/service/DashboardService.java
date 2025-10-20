package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.ActivityDTO;
import br.gov.corregedoria.agentes.dto.DashboardOverviewDTO;
import br.gov.corregedoria.agentes.dto.StatusSummaryDTO;
import br.gov.corregedoria.agentes.entity.LogAuditoria;
import br.gov.corregedoria.agentes.entity.StatusAutoInfracao;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.AutoInfracaoRepository;
import br.gov.corregedoria.agentes.repository.ComarcaRepository;
import br.gov.corregedoria.agentes.repository.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;
import br.gov.corregedoria.agentes.util.DocumentoUtil;

@Service
public class DashboardService {

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;
    @Autowired
    private AutoInfracaoRepository autoRepository;
    @Autowired
    private ComarcaRepository comarcaRepository;
    @Autowired
    private LogAuditoriaRepository logRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public DashboardOverviewDTO overview(Authentication authentication) {
        if (authentication != null) {
            boolean isAgente = hasRole(authentication, "ROLE_AGENTE");
            boolean isCorregedoria = hasRole(authentication, "ROLE_CORREGEDORIA");
            boolean isComarca = hasRole(authentication, "ROLE_COMARCA");

            // Usuários com perfil de gestão (Corregedoria/Comarca) devem ver o overview administrativo
            if (!isCorregedoria && !isComarca && isAgente) {
                String usuario = DocumentoUtil.cleanDigits(authentication.getName());
                return overviewForAgente(usuario);
            }
        }
        return overviewForAdmin();
    }

    private DashboardOverviewDTO overviewForAdmin() {
        DashboardOverviewDTO dto = new DashboardOverviewDTO();
        // Tolerância a schema ausente/indisponível: retorna zeros ao invés de 500
        dto.setTotalAgentes(safe(() -> agenteRepository.count(), 0L));
        dto.setAgentesAtivos(safe(() -> agenteRepository.countByStatus(StatusAgente.ATIVO), 0L));
        dto.setAutosTotal(safe(() -> autoRepository.count(), 0L));
        dto.setComarcasTotal(safe(() -> comarcaRepository.count(), 0L));

        List<StatusSummaryDTO> status = new ArrayList<>();
        status.add(new StatusSummaryDTO("Ativos", safe(() -> agenteRepository.countByStatus(StatusAgente.ATIVO), 0L), "success"));
        status.add(new StatusSummaryDTO("Em Análise", safe(() -> agenteRepository.countByStatus(StatusAgente.EM_ANALISE), 0L), "warning"));
        status.add(new StatusSummaryDTO("Inativos", safe(() -> agenteRepository.countByStatus(StatusAgente.INATIVO), 0L), "danger"));
        dto.setStatusSummary(status);

        try {
            var logs = logRepository.findAllByOrderByDataHoraDesc(PageRequest.of(0, 5));
            List<ActivityDTO> acts = logs.map(this::toActivity).getContent();
            dto.setActivities(acts);
        } catch (Exception e) {
            dto.setActivities(List.of());
        }
        return dto;
    }

    private DashboardOverviewDTO overviewForAgente(String usuario) {
        DashboardOverviewDTO dto = new DashboardOverviewDTO();
        // Para AGENTE, mostramos apenas métricas relacionadas ao próprio usuário
        long meusAutos = safe(() -> autoRepository.count(), 0L);
        dto.setTotalAgentes(0); // não exibido no frontend para AGENTE
        dto.setAgentesAtivos(0); // não exibido para AGENTE
        dto.setAutosTotal(meusAutos);
        dto.setComarcasTotal(0); // não exibido para AGENTE

        List<StatusSummaryDTO> status = new ArrayList<>();
        status.add(new StatusSummaryDTO("Rascunho", safe(() -> autoRepository.countByStatus(StatusAutoInfracao.RASCUNHO), 0L), "neutral"));
        status.add(new StatusSummaryDTO("Registrado", safe(() -> autoRepository.countByStatus(StatusAutoInfracao.REGISTRADO), 0L), "primary"));
        status.add(new StatusSummaryDTO("Concluído", safe(() -> autoRepository.countByStatus(StatusAutoInfracao.CONCLUIDO), 0L), "success"));
        status.add(new StatusSummaryDTO("Cancelado", safe(() -> autoRepository.countByStatus(StatusAutoInfracao.CANCELADO), 0L), "danger"));
        dto.setStatusSummary(status);

        try {
            // Últimos logs do próprio usuário no último ano
            var logs = logRepository.findByUsuarioAndPeriodo(
                    usuario,
                    LocalDateTime.now().minusYears(1),
                    LocalDateTime.now(),
                    PageRequest.of(0, 5)
            );
            dto.setActivities(logs.map(this::toActivity).getContent());
        } catch (Exception e) {
            dto.setActivities(List.of());
        }
        return dto;
    }

    private <T> T safe(Supplier<T> supplier, T fallback) {
        try {
            return supplier.get();
        } catch (DataAccessException ex) {
            return fallback;
        } catch (RuntimeException ex) {
            return fallback;
        }
    }

    private boolean hasRole(Authentication auth, String role) {
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if (role.equalsIgnoreCase(ga.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private ActivityDTO toActivity(LogAuditoria log) {
        String variant = switch (safe(log.getTipoOperacao())) {
            case "EMISSAO_CREDENCIAL" -> "success";
            case "CADASTRO_AGENTE" -> "info";
            case "REGISTRO_AUTO", "ATUALIZACAO_AUTO" -> "primary";
            case "CANCELAMENTO_AUTO" -> "danger";
            default -> "neutral";
        };
        String time = log.getDataHora() != null ? log.getDataHora().format(TIME_FMT) : "";
        String title = safe(log.getUsuario());
        String desc = safe(log.getDetalhes());
        String status = safe(log.getTipoOperacao());
        return new ActivityDTO(title, desc, time, status, variant);
    }

    private static String safe(String v) { return v == null ? "" : v; }
}
