package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "TESTEMUNHA")
public class Testemunha {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_TESTEMUNHA")
    @SequenceGenerator(name = "S_TESTEMUNHA", sequenceName = "S_TESTEMUNHA", allocationSize = 1)
    @Column(name = "ID", updatable = false, nullable = false)
    private Long id;

    @Column(name = "ID_TESTEMUNHA_STR", length = 255, nullable = false, unique = true)
    private String idTestemunhaStr;

    @NotBlank
    @Size(max = 255)
    @Column(name = "NOME_TESTEMUNHA", nullable = false, length = 255)
    private String nomeTestemunha;

    @Size(max = 500)
    @Column(name = "RESIDENCIA_TESTEMUNHA", length = 500)
    private String residenciaTestemunha;

    @Size(max = 255)
    @Column(name = "DOCUMENTO_TESTEMUNHA", length = 255)
    private String documentoTestemunha;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdTestemunhaStr() { return idTestemunhaStr; }
    public void setIdTestemunhaStr(String idTestemunhaStr) { this.idTestemunhaStr = idTestemunhaStr; }

    public String getNomeTestemunha() {
        return nomeTestemunha;
    }

    public void setNomeTestemunha(String nomeTestemunha) {
        this.nomeTestemunha = nomeTestemunha;
    }

    public String getResidenciaTestemunha() {
        return residenciaTestemunha;
    }

    public void setResidenciaTestemunha(String residenciaTestemunha) {
        this.residenciaTestemunha = residenciaTestemunha;
    }

    public String getDocumentoTestemunha() {
        return documentoTestemunha;
    }

    public void setDocumentoTestemunha(String documentoTestemunha) {
        this.documentoTestemunha = documentoTestemunha;
    }
}
