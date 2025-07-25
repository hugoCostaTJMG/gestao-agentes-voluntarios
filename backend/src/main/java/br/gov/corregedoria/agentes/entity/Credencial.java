package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "credencial")
public class Credencial {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id_credencial", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_agente", nullable = false)
    private AgenteVoluntario agente;

    @CreationTimestamp
    @Column(name = "data_emissao", nullable = false)
    private LocalDateTime dataEmissao;

    @Column(name = "qr_code_url", nullable = false, length = 500)
    private String qrCodeUrl;

    @Column(name = "usuario_emissao", nullable = false, length = 100)
    private String usuarioEmissao;

    // Construtores
    public Credencial() {}

    public Credencial(AgenteVoluntario agente, String qrCodeUrl, String usuarioEmissao) {
        this.agente = agente;
        this.qrCodeUrl = qrCodeUrl;
        this.usuarioEmissao = usuarioEmissao;
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
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

