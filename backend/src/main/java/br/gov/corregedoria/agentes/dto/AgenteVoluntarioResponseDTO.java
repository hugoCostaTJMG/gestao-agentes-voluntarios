package br.gov.corregedoria.agentes.dto;

import java.util.Set;
import java.util.UUID;

public class AgenteVoluntarioResponseDTO {

    private UUID id;
    private String nomeCompleto;
    private String cpf;
    private String telefone;
    private String email;
    private String disponibilidade;
    private String status;
    private String dataCadastro;
    private String usuarioCadastro;
    private Set<ComarcaDTO> comarcas;
    private Set<AreaAtuacaoDTO> areasAtuacao;

    // Construtores
    public AgenteVoluntarioResponseDTO() {}

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisponibilidade() {
        return disponibilidade;
    }

    public void setDisponibilidade(String disponibilidade) {
        this.disponibilidade = disponibilidade;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(String dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getUsuarioCadastro() {
        return usuarioCadastro;
    }

    public void setUsuarioCadastro(String usuarioCadastro) {
        this.usuarioCadastro = usuarioCadastro;
    }

    public Set<ComarcaDTO> getComarcas() {
        return comarcas;
    }

    public void setComarcas(Set<ComarcaDTO> comarcas) {
        this.comarcas = comarcas;
    }

    public Set<AreaAtuacaoDTO> getAreasAtuacao() {
        return areasAtuacao;
    }

    public void setAreasAtuacao(Set<AreaAtuacaoDTO> areasAtuacao) {
        this.areasAtuacao = areasAtuacao;
    }
}

