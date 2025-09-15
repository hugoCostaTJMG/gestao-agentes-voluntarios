package br.gov.corregedoria.agentes.dto;

import jakarta.validation.constraints.NotBlank;

public class ComarcaDTO {

    private Long id;

    @NotBlank(message = "Nome da comarca é obrigatório")
    private String nomeComarca;

    // Construtores
    public ComarcaDTO() {}

    public ComarcaDTO(String nomeComarca) {
        this.nomeComarca = nomeComarca;
    }

    public ComarcaDTO(Long id, String nomeComarca) {
        this.id = id;
        this.nomeComarca = nomeComarca;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeComarca() {
        return nomeComarca;
    }

    public void setNomeComarca(String nomeComarca) {
        this.nomeComarca = nomeComarca;
    }

    @Override
    public String toString() {
        return "ComarcaDTO{" +
                "id=" + id +
                ", nomeComarca='" + nomeComarca + '\'' +
                '}';
    }
}

