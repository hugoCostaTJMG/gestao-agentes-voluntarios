package br.gov.corregedoria.agentes.dto;

import java.util.List;

public class DashboardOverviewDTO {
    private long totalAgentes;
    private long agentesAtivos;
    private long autosTotal;
    private long comarcasTotal;
    private List<StatusSummaryDTO> statusSummary;
    private List<ActivityDTO> activities;

    public DashboardOverviewDTO() {}

    public long getTotalAgentes() { return totalAgentes; }
    public void setTotalAgentes(long totalAgentes) { this.totalAgentes = totalAgentes; }

    public long getAgentesAtivos() { return agentesAtivos; }
    public void setAgentesAtivos(long agentesAtivos) { this.agentesAtivos = agentesAtivos; }

    public long getAutosTotal() { return autosTotal; }
    public void setAutosTotal(long autosTotal) { this.autosTotal = autosTotal; }

    public long getComarcasTotal() { return comarcasTotal; }
    public void setComarcasTotal(long comarcasTotal) { this.comarcasTotal = comarcasTotal; }

    public List<StatusSummaryDTO> getStatusSummary() { return statusSummary; }
    public void setStatusSummary(List<StatusSummaryDTO> statusSummary) { this.statusSummary = statusSummary; }

    public List<ActivityDTO> getActivities() { return activities; }
    public void setActivities(List<ActivityDTO> activities) { this.activities = activities; }
}

