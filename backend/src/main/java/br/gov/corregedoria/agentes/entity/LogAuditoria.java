package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "LOG_AUDITORIA")
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_LOG_AUDITORIA")
    @SequenceGenerator(name = "S_LOG_AUDITORIA", sequenceName = "S_LOG_AUDITORIA", allocationSize = 1)
    @Column(name = "ID", updatable = false, nullable = false)
    private Long id;

    @CreationTimestamp
    @Column(name = "DATA_HORA", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "USUARIO", nullable = false, length = 100)
    private String usuario;

    @Column(name = "TIPO_OPERACAO", nullable = false, length = 50)
    private String tipoOperacao;

    @Lob
    @Column(name = "DETALHES")
    private String detalhes;

    @Column(name = "IP_ORIGEM", length = 45)
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
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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
