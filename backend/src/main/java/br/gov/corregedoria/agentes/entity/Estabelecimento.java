package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "ESTABELECIMENTO")
public class Estabelecimento {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_ESTABELECIMENTO")
    @SequenceGenerator(name = "S_ESTABELECIMENTO", sequenceName = "S_ESTABELECIMENTO", allocationSize = 1)
    @Column(name = "ID", updatable = false, nullable = false)
    private Long id;

    @Column(name = "ID_ESTABELECIMENTO_STR", length = 255, unique = true, nullable = false)
    private String idEstabelecimentoStr;

    @Size(max = 18)
    @Column(name = "CNPJ", unique = true, length = 18)
    private String cnpj;

    @NotBlank
    @Size(max = 255)
    @Column(name = "NOME_ESTABELECIMENTO", nullable = false, length = 255)
    private String nomeEstabelecimento;

    @Size(max = 500)
    @Column(name = "ENDERECO_ESTABELECIMENTO", length = 500)
    private String enderecoEstabelecimento;

    @Size(max = 255)
    @Column(name = "COMPLEMENTO_ESTABELECIMENTO", length = 255)
    private String complementoEstabelecimento;

    @Size(max = 255)
    @Column(name = "BAIRRO_ESTABELECIMENTO", length = 255)
    private String bairroEstabelecimento;

    @Size(max = 255)
    @Column(name = "CIDADE_ESTABELECIMENTO", length = 255)
    private String cidadeEstabelecimento;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdEstabelecimentoStr() { return idEstabelecimentoStr; }
    public void setIdEstabelecimentoStr(String idEstabelecimentoStr) { this.idEstabelecimentoStr = idEstabelecimentoStr; }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getNomeEstabelecimento() {
        return nomeEstabelecimento;
    }

    public void setNomeEstabelecimento(String nomeEstabelecimento) {
        this.nomeEstabelecimento = nomeEstabelecimento;
    }

    public String getEnderecoEstabelecimento() {
        return enderecoEstabelecimento;
    }

    public void setEnderecoEstabelecimento(String enderecoEstabelecimento) {
        this.enderecoEstabelecimento = enderecoEstabelecimento;
    }

    public String getComplementoEstabelecimento() {
        return complementoEstabelecimento;
    }

    public void setComplementoEstabelecimento(String complementoEstabelecimento) {
        this.complementoEstabelecimento = complementoEstabelecimento;
    }

    public String getBairroEstabelecimento() {
        return bairroEstabelecimento;
    }

    public void setBairroEstabelecimento(String bairroEstabelecimento) {
        this.bairroEstabelecimento = bairroEstabelecimento;
    }

    public String getCidadeEstabelecimento() {
        return cidadeEstabelecimento;
    }

    public void setCidadeEstabelecimento(String cidadeEstabelecimento) {
        this.cidadeEstabelecimento = cidadeEstabelecimento;
    }
}
