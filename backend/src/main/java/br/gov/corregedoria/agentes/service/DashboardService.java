package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.ActivityDTO;
import br.gov.corregedoria.agentes.dto.DashboardOverviewDTO;
import br.gov.corregedoria.agentes.dto.StatusSummaryDTO;
import br.gov.corregedoria.agentes.entity.LogAuditoria;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.AutoInfracaoRepository;
import br.gov.corregedoria.agentes.repository.ComarcaRepository;
import br.gov.corregedoria.agentes.repository.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

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

    public DashboardOverviewDTO overview() {
        DashboardOverviewDTO dto = new DashboardOverviewDTO();
        dto.setTotalAgentes(agenteRepository.count());
        dto.setAgentesAtivos(agenteRepository.countByStatus(StatusAgente.ATIVO));
        dto.setAutosTotal(autoRepository.count());
        dto.setComarcasTotal(comarcaRepository.count());

        List<StatusSummaryDTO> status = new ArrayList<>();
        status.add(new StatusSummaryDTO("Ativos", agenteRepository.countByStatus(StatusAgente.ATIVO), "success"));
        status.add(new StatusSummaryDTO("Em Análise", agenteRepository.countByStatus(StatusAgente.EM_ANALISE), "warning"));
        status.add(new StatusSummaryDTO("Inativos", agenteRepository.countByStatus(StatusAgente.INATIVO), "danger"));
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
