package br.gov.corregedoria.agentes.dto;

public class ActivityDTO {
    private String title;
    private String description;
    private String time;
    private String status;
    private String badgeVariant;

    public ActivityDTO() {}

    public ActivityDTO(String title, String description, String time, String status, String badgeVariant) {
        this.title = title;
        this.description = description;
        this.time = time;
        this.status = status;
        this.badgeVariant = badgeVariant;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBadgeVariant() { return badgeVariant; }
    public void setBadgeVariant(String badgeVariant) { this.badgeVariant = badgeVariant; }
}

