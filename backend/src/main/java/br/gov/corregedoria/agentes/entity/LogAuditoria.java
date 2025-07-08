package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "log_auditoria")
public class LogAuditoria {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id_log", updatable = false, nullable = false)
    private UUID id;

    @CreationTimestamp
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "usuario", nullable = false, length = 100)
    private String usuario;

    @Column(name = "tipo_operacao", nullable = false, length = 50)
    private String tipoOperacao;

    @Column(name = "detalhes", columnDefinition = "TEXT")
    private String detalhes;

    @Column(name = "ip_origem", length = 45)
    private String ipOrigem;

    // Construtores
    public LogAuditoria() {}

    public LogAuditoria(String usuario, String tipoOperacao, String detalhes, String ipOrigem) {
        this.usuario = usuario;
        this.tipoOperacao = tipoOperacao;
        this.detalhes = detalhes;
        this.ipOrigem = ipOrigem;
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getTipoOperacao() {
        return tipoOperacao;
    }

    public void setTipoOperacao(String tipoOperacao) {
        this.tipoOperacao = tipoOperacao;
    }

    public String getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(String detalhes) {
        this.detalhes = detalhes;
    }

    public String getIpOrigem() {
        return ipOrigem;
    }

    public void setIpOrigem(String ipOrigem) {
        this.ipOrigem = ipOrigem;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LogAuditoria)) return false;
        LogAuditoria that = (LogAuditoria) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "LogAuditoria{" +
                "id=" + id +
                ", dataHora=" + dataHora +
                ", usuario='" + usuario + '\'' +
                ", tipoOperacao='" + tipoOperacao + '\'' +
                '}';
    }
}

