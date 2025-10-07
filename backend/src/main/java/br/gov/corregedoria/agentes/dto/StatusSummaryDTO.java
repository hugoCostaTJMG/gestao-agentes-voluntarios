package br.gov.corregedoria.agentes.dto;

public class StatusSummaryDTO {
    private String label;
    private long count;
    private String badgeVariant;

    public StatusSummaryDTO() {}
    public StatusSummaryDTO(String label, long count, String badgeVariant) {
        this.label = label;
        this.count = count;
        this.badgeVariant = badgeVariant;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
    public String getBadgeVariant() { return badgeVariant; }
    public void setBadgeVariant(String badgeVariant) { this.badgeVariant = badgeVariant; }
}

