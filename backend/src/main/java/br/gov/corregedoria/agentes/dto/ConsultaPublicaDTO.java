package br.gov.corregedoria.agentes.dto;

public class ConsultaPublicaDTO {

    private Long agenteId;
    private String nomeCompleto;
    private String situacao;
    private String dataCadastro;
    private String comarcasAtuacao;

    // Construtores
    public ConsultaPublicaDTO() {}

    public ConsultaPublicaDTO(Long agenteId, String nomeCompleto, String situacao,
                             String dataCadastro, String comarcasAtuacao) {
        this.agenteId = agenteId;
        this.nomeCompleto = nomeCompleto;
        this.situacao = situacao;
        this.dataCadastro = dataCadastro;
        this.comarcasAtuacao = comarcasAtuacao;
    }

    // Getters e Setters
    public Long getAgenteId() {
        return agenteId;
    }

    public void setAgenteId(Long agenteId) {
        this.agenteId = agenteId;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public String getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(String dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getComarcasAtuacao() {
        return comarcasAtuacao;
    }

    public void setComarcasAtuacao(String comarcasAtuacao) {
        this.comarcasAtuacao = comarcasAtuacao;
    }
}

