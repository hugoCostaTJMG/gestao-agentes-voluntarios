package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidade que registra todas as operações realizadas nos Autos de Infração
 * para fins de auditoria e rastreabilidade
 * 
 * RNF005 - Controle de Acesso: Registra tentativas de acesso e operações
 * UC006 - Logs de Auditoria de Alteração/Cancelamento
 */
@Entity
@Table(name = "log_auditoria_auto_infracao")
public class LogAuditoriaAutoInfracao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "log_ai_seq")
    @SequenceGenerator(name = "log_ai_seq", sequenceName = "log_ai_seq", allocationSize = 1)
    private Long id;

    @NotNull(message = "ID do auto de infração é obrigatório")
    @Column(name = "auto_infracao_id", nullable = false)
    private Long autoInfracaoId;
    
    @NotBlank(message = "Tipo de operação é obrigatório")
    @Size(max = 50, message = "Tipo de operação deve ter no máximo 50 caracteres")
    @Column(name = "tipo_operacao", nullable = false, length = 50)
    private String tipoOperacao;
    
    @NotBlank(message = "Usuário é obrigatório")
    @Size(max = 100, message = "Usuário deve ter no máximo 100 caracteres")
    @Column(name = "usuario", nullable = false, length = 100)
    private String usuario;
    
    @Size(max = 50, message = "Perfil do usuário deve ter no máximo 50 caracteres")
    @Column(name = "perfil_usuario", length = 50)
    private String perfilUsuario;
    
    @CreationTimestamp
    @Column(name = "data_operacao", nullable = false, updatable = false)
    private LocalDateTime dataOperacao;
    
    @Size(max = 100, message = "Endereço IP deve ter no máximo 100 caracteres")
    @Column(name = "endereco_ip", length = 100)
    private String enderecoIp;
    
    @Column(name = "detalhes", columnDefinition = "TEXT")
    private String detalhes;
    
    @Size(max = 500, message = "Justificativa deve ter no máximo 500 caracteres")
    @Column(name = "justificativa", length = 500)
    private String justificativa;
    
    @Column(name = "sucesso", nullable = false)
    private Boolean sucesso = true;
    
    @Size(max = 500, message = "Mensagem de erro deve ter no máximo 500 caracteres")
    @Column(name = "mensagem_erro", length = 500)
    private String mensagemErro;
    
    // === CONSTRUTORES ===
    
    public LogAuditoriaAutoInfracao() {}
    
    public LogAuditoriaAutoInfracao(Long autoInfracaoId, String tipoOperacao, String usuario,
                                  String perfilUsuario, String enderecoIp) {
        this.autoInfracaoId = autoInfracaoId;
        this.tipoOperacao = tipoOperacao;
        this.usuario = usuario;
        this.perfilUsuario = perfilUsuario;
        this.enderecoIp = enderecoIp;
    }
    
    // === MÉTODOS DE CONVENIÊNCIA ===
    
    /**
     * Cria um log de criação de auto de infração
     */
    public static LogAuditoriaAutoInfracao criarLogCriacao(Long autoInfracaoId, String usuario,
                                                         String perfilUsuario, String enderecoIp) {
        LogAuditoriaAutoInfracao log = new LogAuditoriaAutoInfracao(autoInfracaoId, "CRIACAO", 
                                                                   usuario, perfilUsuario, enderecoIp);
        log.setDetalhes("Auto de infração criado");
        return log;
    }
    
    /**
     * Cria um log de edição de auto de infração
     */
    public static LogAuditoriaAutoInfracao criarLogEdicao(Long autoInfracaoId, String usuario,
                                                        String perfilUsuario, String enderecoIp,
                                                        String camposAlterados) {
        LogAuditoriaAutoInfracao log = new LogAuditoriaAutoInfracao(autoInfracaoId, "EDICAO", 
                                                                   usuario, perfilUsuario, enderecoIp);
        log.setDetalhes("Campos alterados: " + camposAlterados);
        return log;
    }
    
    /**
     * Cria um log de cancelamento de auto de infração
     */
    public static LogAuditoriaAutoInfracao criarLogCancelamento(Long autoInfracaoId, String usuario,
                                                              String perfilUsuario, String enderecoIp,
                                                              String justificativa) {
        LogAuditoriaAutoInfracao log = new LogAuditoriaAutoInfracao(autoInfracaoId, "CANCELAMENTO", 
                                                                   usuario, perfilUsuario, enderecoIp);
        log.setDetalhes("Auto de infração cancelado");
        log.setJustificativa(justificativa);
        return log;
    }
    
    /**
     * Cria um log de consulta de auto de infração
     */
    public static LogAuditoriaAutoInfracao criarLogConsulta(Long autoInfracaoId, String usuario,
                                                          String perfilUsuario, String enderecoIp) {
        LogAuditoriaAutoInfracao log = new LogAuditoriaAutoInfracao(autoInfracaoId, "CONSULTA", 
                                                                   usuario, perfilUsuario, enderecoIp);
        log.setDetalhes("Auto de infração consultado");
        return log;
    }
    
    /**
     * Cria um log de tentativa de acesso negado
     */
    public static LogAuditoriaAutoInfracao criarLogAcessoNegado(Long autoInfracaoId, String usuario,
                                                              String perfilUsuario, String enderecoIp,
                                                              String operacaoTentada, String motivo) {
        LogAuditoriaAutoInfracao log = new LogAuditoriaAutoInfracao(autoInfracaoId, "ACESSO_NEGADO", 
                                                                   usuario, perfilUsuario, enderecoIp);
        log.setDetalhes("Tentativa de " + operacaoTentada);
        log.setMensagemErro(motivo);
        log.setSucesso(false);
        return log;
    }
    
    // === GETTERS E SETTERS ===
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getAutoInfracaoId() {
        return autoInfracaoId;
    }

    public void setAutoInfracaoId(Long autoInfracaoId) {
        this.autoInfracaoId = autoInfracaoId;
    }
    
    public String getTipoOperacao() {
        return tipoOperacao;
    }
    
    public void setTipoOperacao(String tipoOperacao) {
        this.tipoOperacao = tipoOperacao;
    }
    
    public String getUsuario() {
        return usuario;
    }
    
    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }
    
    public String getPerfilUsuario() {
        return perfilUsuario;
    }
    
    public void setPerfilUsuario(String perfilUsuario) {
        this.perfilUsuario = perfilUsuario;
    }
    
    public LocalDateTime getDataOperacao() {
        return dataOperacao;
    }
    
    public void setDataOperacao(LocalDateTime dataOperacao) {
        this.dataOperacao = dataOperacao;
    }
    
    public String getEnderecoIp() {
        return enderecoIp;
    }
    
    public void setEnderecoIp(String enderecoIp) {
        this.enderecoIp = enderecoIp;
    }
    
    public String getDetalhes() {
        return detalhes;
    }
    
    public void setDetalhes(String detalhes) {
        this.detalhes = detalhes;
    }
    
    public String getJustificativa() {
        return justificativa;
    }
    
    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }
    
    public Boolean getSucesso() {
        return sucesso;
    }
    
    public void setSucesso(Boolean sucesso) {
        this.sucesso = sucesso;
    }
    
    public String getMensagemErro() {
        return mensagemErro;
    }
    
    public void setMensagemErro(String mensagemErro) {
        this.mensagemErro = mensagemErro;
    }
}

