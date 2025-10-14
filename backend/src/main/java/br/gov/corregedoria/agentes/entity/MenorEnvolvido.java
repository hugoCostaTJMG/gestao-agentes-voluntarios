package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "MENOR_ENVOLVIDO")
public class MenorEnvolvido {

    @Id
    @Column(name = "ID_MENOR", length = 255)
    private String idMenor;

    @Size(max = 255)
    @Column(name = "NOME_MENOR", length = 255, nullable = false)
    private String nomeMenor;

    @Past
    @Column(name = "DATA_NASCIMENTO_MENOR")
    private LocalDate dataNascimentoMenor;

    @Size(max = 255)
    @Column(name = "DOCUMENTO_MENOR", length = 255)
    private String documentoMenor;

    @Size(max = 500)
    @Column(name = "FILIACAO_MENOR", length = 500)
    private String filiacaoMenor;

    @Size(max = 500)
    @Column(name = "RESIDENCIA_MENOR", length = 500)
    private String residenciaMenor;

    // Join uses the string key in AUTO_INFRACAO.ID_AUTO_INFRACAO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_AUTO_INFRACAO", referencedColumnName = "ID_AUTO_INFRACAO", nullable = false)
    private AutoInfracao autoInfracao;

    public String getIdMenor() {
        return idMenor;
    }

    public void setIdMenor(String idMenor) {
        this.idMenor = idMenor;
    }

    public String getNomeMenor() {
        return nomeMenor;
    }

    public void setNomeMenor(String nomeMenor) {
        this.nomeMenor = nomeMenor;
    }

    public LocalDate getDataNascimentoMenor() {
        return dataNascimentoMenor;
    }

    public void setDataNascimentoMenor(LocalDate dataNascimentoMenor) {
        this.dataNascimentoMenor = dataNascimentoMenor;
    }

    public String getDocumentoMenor() {
        return documentoMenor;
    }

    public void setDocumentoMenor(String documentoMenor) {
        this.documentoMenor = documentoMenor;
    }

    public String getFiliacaoMenor() {
        return filiacaoMenor;
    }

    public void setFiliacaoMenor(String filiacaoMenor) {
        this.filiacaoMenor = filiacaoMenor;
    }

    public String getResidenciaMenor() {
        return residenciaMenor;
    }

    public void setResidenciaMenor(String residenciaMenor) {
        this.residenciaMenor = residenciaMenor;
    }

    public AutoInfracao getAutoInfracao() {
        return autoInfracao;
    }

    public void setAutoInfracao(AutoInfracao autoInfracao) {
        this.autoInfracao = autoInfracao;
    }
}

