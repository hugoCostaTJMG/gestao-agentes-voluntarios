package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "MENOR_ENVOLVIDO")
public class MenorEnvolvido {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_MENOR_ENVOLVIDO")
    @SequenceGenerator(name = "S_MENOR_ENVOLVIDO", sequenceName = "S_MENOR_ENVOLVIDO", allocationSize = 1)
    @Column(name = "ID", updatable = false, nullable = false)
    private Long id;

    @Column(name = "ID_MENOR_STR", length = 255, nullable = false, unique = true)
    private String idMenorStr;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AUTO_INFRACAO_ID", referencedColumnName = "ID", nullable = false)
    private AutoInfracao autoInfracao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdMenorStr() { return idMenorStr; }
    public void setIdMenorStr(String idMenorStr) { this.idMenorStr = idMenorStr; }

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
