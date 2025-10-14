package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "responsavel")
public class Responsavel {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_RESPONSAVEL")
    @SequenceGenerator(name = "S_RESPONSAVEL", sequenceName = "S_RESPONSAVEL", allocationSize = 1)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(name = "id_responsavel_str", nullable = false, unique = true, length = 255)
    private String idResponsavelStr;

    @NotBlank
    @Size(max = 255)
    @Column(name = "nome_responsavel", nullable = false, length = 255)
    private String nomeResponsavel;

    @Size(max = 20)
    @Column(name = "rg_responsavel", length = 20)
    private String rgResponsavel;

    @Size(max = 14)
    @Column(name = "cpf_responsavel", length = 14, unique = true)
    private String cpfResponsavel;

    @Size(max = 255)
    @Column(name = "condicao_responsavel", length = 255)
    private String condicaoResponsavel;

    @Size(max = 500)
    @Column(name = "endereco_responsavel", length = 500)
    private String enderecoResponsavel;

    @Size(max = 255)
    @Column(name = "complemento_responsavel", length = 255)
    private String complementoResponsavel;

    @Size(max = 255)
    @Column(name = "bairro_responsavel", length = 255)
    private String bairroResponsavel;

    @Size(max = 255)
    @Column(name = "cidade_responsavel", length = 255)
    private String cidadeResponsavel;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdResponsavelStr() {
        return idResponsavelStr;
    }

    public void setIdResponsavelStr(String idResponsavelStr) {
        this.idResponsavelStr = idResponsavelStr;
    }

    public String getNomeResponsavel() {
        return nomeResponsavel;
    }

    public void setNomeResponsavel(String nomeResponsavel) {
        this.nomeResponsavel = nomeResponsavel;
    }

    public String getRgResponsavel() {
        return rgResponsavel;
    }

    public void setRgResponsavel(String rgResponsavel) {
        this.rgResponsavel = rgResponsavel;
    }

    public String getCpfResponsavel() {
        return cpfResponsavel;
    }

    public void setCpfResponsavel(String cpfResponsavel) {
        this.cpfResponsavel = cpfResponsavel;
    }

    public String getCondicaoResponsavel() {
        return condicaoResponsavel;
    }

    public void setCondicaoResponsavel(String condicaoResponsavel) {
        this.condicaoResponsavel = condicaoResponsavel;
    }

    public String getEnderecoResponsavel() {
        return enderecoResponsavel;
    }

    public void setEnderecoResponsavel(String enderecoResponsavel) {
        this.enderecoResponsavel = enderecoResponsavel;
    }

    public String getComplementoResponsavel() {
        return complementoResponsavel;
    }

    public void setComplementoResponsavel(String complementoResponsavel) {
        this.complementoResponsavel = complementoResponsavel;
    }

    public String getBairroResponsavel() {
        return bairroResponsavel;
    }

    public void setBairroResponsavel(String bairroResponsavel) {
        this.bairroResponsavel = bairroResponsavel;
    }

    public String getCidadeResponsavel() {
        return cidadeResponsavel;
    }

    public void setCidadeResponsavel(String cidadeResponsavel) {
        this.cidadeResponsavel = cidadeResponsavel;
    }
}

