package br.gov.corregedoria.agentes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class LoginGovBrDTO {

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
    private String cpf;

    @NotBlank(message = "Token do gov.br é obrigatório")
    private String govBrToken;

    private String nomeCompleto;
    private String email;

    // Construtores
    public LoginGovBrDTO() {}

    public LoginGovBrDTO(String cpf, String govBrToken) {
        this.cpf = cpf;
        this.govBrToken = govBrToken;
    }

    // Getters e Setters
    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getGovBrToken() {
        return govBrToken;
    }

    public void setGovBrToken(String govBrToken) {
        this.govBrToken = govBrToken;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "LoginGovBrDTO{" +
                "cpf='" + cpf + '\'' +
                ", nomeCompleto='" + nomeCompleto + '\'' +
                '}';
    }
}

