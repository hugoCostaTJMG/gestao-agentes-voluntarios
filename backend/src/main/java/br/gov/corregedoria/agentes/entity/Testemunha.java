package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "TESTEMUNHA")
public class Testemunha {

    @Id
    @Column(name = "ID_TESTEMUNHA", length = 255)
    private String idTestemunha;

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

    public String getIdTestemunha() {
        return idTestemunha;
    }

    public void setIdTestemunha(String idTestemunha) {
        this.idTestemunha = idTestemunha;
    }

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

