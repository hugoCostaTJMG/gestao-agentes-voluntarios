package br.gov.corregedoria.agentes.dto;


public class CredencialDTO {

    private Long id;
    private Long agenteId;
    private String nomeAgente;
    private String cpfAgente;
    private String statusAgente;
    private String dataEmissao;
    private String qrCodeUrl;
    private String usuarioEmissao;

    // Construtores
    public CredencialDTO() {}

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAgenteId() {
        return agenteId;
    }

    public void setAgenteId(Long agenteId) {
        this.agenteId = agenteId;
    }

    public String getNomeAgente() {
        return nomeAgente;
    }

    public void setNomeAgente(String nomeAgente) {
        this.nomeAgente = nomeAgente;
    }

    public String getCpfAgente() {
        return cpfAgente;
    }

    public void setCpfAgente(String cpfAgente) {
        this.cpfAgente = cpfAgente;
    }

    public String getStatusAgente() {
        return statusAgente;
    }

    public void setStatusAgente(String statusAgente) {
        this.statusAgente = statusAgente;
    }

    public String getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(String dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getUsuarioEmissao() {
        return usuarioEmissao;
    }

    public void setUsuarioEmissao(String usuarioEmissao) {
        this.usuarioEmissao = usuarioEmissao;
    }
}

