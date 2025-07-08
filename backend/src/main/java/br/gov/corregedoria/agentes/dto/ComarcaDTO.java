package br.gov.corregedoria.agentes.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class ComarcaDTO {

    private UUID id;

    @NotBlank(message = "Nome da comarca é obrigatório")
    private String nomeComarca;

    // Construtores
    public ComarcaDTO() {}

    public ComarcaDTO(String nomeComarca) {
        this.nomeComarca = nomeComarca;
    }

    public ComarcaDTO(UUID id, String nomeComarca) {
        this.id = id;
        this.nomeComarca = nomeComarca;
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
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

