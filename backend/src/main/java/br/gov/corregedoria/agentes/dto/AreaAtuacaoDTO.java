package br.gov.corregedoria.agentes.dto;

import jakarta.validation.constraints.NotBlank;

public class AreaAtuacaoDTO {

    private Long id;

    @NotBlank(message = "Nome da área de atuação é obrigatório")
    private String nomeAreaAtuacao;

    // Construtores
    public AreaAtuacaoDTO() {}

    public AreaAtuacaoDTO(String nomeAreaAtuacao) {
        this.nomeAreaAtuacao = nomeAreaAtuacao;
    }

    public AreaAtuacaoDTO(Long id, String nomeAreaAtuacao) {
        this.id = id;
        this.nomeAreaAtuacao = nomeAreaAtuacao;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeAreaAtuacao() {
        return nomeAreaAtuacao;
    }

    public void setNomeAreaAtuacao(String nomeAreaAtuacao) {
        this.nomeAreaAtuacao = nomeAreaAtuacao;
    }

    @Override
    public String toString() {
        return "AreaAtuacaoDTO{" +
                "id=" + id +
                ", nomeAreaAtuacao='" + nomeAreaAtuacao + '\'' +
                '}';
    }
}

