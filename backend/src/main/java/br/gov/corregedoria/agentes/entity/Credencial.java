package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "CREDENCIAL")
public class Credencial {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_CREDENCIAL")
    @SequenceGenerator(name = "S_CREDENCIAL", sequenceName = "S_CREDENCIAL", allocationSize = 1)
    @Column(name = "ID", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "AGENTE_ID", nullable = false)
    private AgenteVoluntario agente;

    @CreationTimestamp
    @Column(name = "DATA_EMISSAO", nullable = false)
    private LocalDateTime dataEmissao;

    @Column(name = "QR_CODE_URL", nullable = false, length = 500)
    private String qrCodeUrl;

    @Column(name = "USUARIO_EMISSAO", nullable = false, length = 100)
    private String usuarioEmissao;

    // Construtores
    public Credencial() {}

    public Credencial(AgenteVoluntario agente, String qrCodeUrl, String usuarioEmissao) {
        this.agente = agente;
        this.qrCodeUrl = qrCodeUrl;
        this.usuarioEmissao = usuarioEmissao;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AgenteVoluntario getAgente() {
        return agente;
    }

    public void setAgente(AgenteVoluntario agente) {
        this.agente = agente;
    }

    public LocalDateTime getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDateTime dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getUsuarioEmissao() {
        return usuarioEmissao;
    }

    public void setUsuarioEmissao(String usuarioEmissao) {
        this.usuarioEmissao = usuarioEmissao;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Credencial)) return false;
        Credencial that = (Credencial) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Credencial{" +
                "id=" + id +
                ", dataEmissao=" + dataEmissao +
                ", qrCodeUrl='" + qrCodeUrl + '\'' +
                '}';
    }
}

