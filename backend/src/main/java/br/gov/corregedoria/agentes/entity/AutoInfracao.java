package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "AUTO_INFRACAO")
public class AutoInfracao {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_AUTO_INFRACAO")
    @SequenceGenerator(name = "S_AUTO_INFRACAO", sequenceName = "S_AUTO_INFRACAO", allocationSize = 1)
    @Column(name = "ID", updatable = false, nullable = false)
    private Long id;

    @Column(name = "ID_AUTO_INFRACAO_STR", unique = true, length = 255)
    private String idAutoInfracaoStr;

    @Column(name = "NUMERO_AUTO", unique = true, length = 255)
    private String numeroAuto;

    @NotNull
    @Column(name = "DATA_INFRACAO", nullable = false)
    private LocalDate dataInfracao;

    @Column(name = "HORARIO_INFRACAO")
    private LocalDateTime horarioInfracao;

    @Column(name = "LOCAL_INFRACAO", nullable = false, length = 500)
    private String localInfracao;

    @Column(name = "COMARCA", length = 255)
    private String comarcaTexto;

    @Size(max = 500)
    @Column(name = "FUNDAMENTO_LEGAL", length = 500)
    private String fundamentoLegal;

    @Size(max = 255)
    @Column(name = "ARTIGO_ECA", length = 255)
    private String artigoEca;

    @Size(max = 255)
    @Column(name = "PORTARIA_N", length = 255)
    private String portariaN;

    @Column(name = "NUMERO_CRIANCAS")
    private Integer numeroCriancas;

    @Column(name = "NUMERO_ADOLESCENTES")
    private Integer numeroAdolescentes;

    @Column(name = "ASSINATURA_AUTUADO")
    private Boolean assinaturaAutuado;

    @Size(max = 255)
    @Column(name = "NOME_COMISSARIO_AUTUANTE", length = 255)
    private String nomeComissarioAutuante;

    @Size(max = 255)
    @Column(name = "MATRICULA_AUTUANTE", length = 255)
    private String matriculaAutuante;

    @Lob
    @Column(name = "OBSERVACOES")
    private String observacoes;

    @Column(name = "DATA_INTIMACAO")
    private LocalDate dataIntimacao;

    @Column(name = "PRAZO_DEFESA")
    private LocalDate prazoDefesa;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false)
    private StatusAutoInfracao status = StatusAutoInfracao.RASCUNHO;

    @CreationTimestamp
    @Column(name = "DATA_CADASTRO", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "DATA_ATUALIZACAO")
    private LocalDateTime dataAtualizacao;

    @Column(name = "USUARIO_CADASTRO", nullable = false, updatable = false, length = 100)
    private String usuarioCadastro;

    @Column(name = "USUARIO_ATUALIZACAO", length = 100)
    private String usuarioAtualizacao;

    @Column(name = "DATA_CANCELAMENTO")
    private LocalDateTime dataCancelamento;

    @Column(name = "USUARIO_CANCELAMENTO", length = 100)
    private String usuarioCancelamento;

    @Size(max = 500)
    @Column(name = "JUSTIFICATIVA_CANCELAMENTO", length = 500)
    private String justificativaCancelamento;

    @OneToMany(mappedBy = "autoInfracao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AnexoAutoInfracao> anexos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ESTABELECIMENTO_ID", referencedColumnName = "ID", nullable = false)
    private Estabelecimento estabelecimento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "RESPONSAVEL_ID", referencedColumnName = "ID", nullable = false)
    private Responsavel responsavel;

    @OneToMany(mappedBy = "autoInfracao", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MenorEnvolvido> menoresEnvolvidos = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "AUTO_INFRACAO_TESTEMUNHA",
        joinColumns = @JoinColumn(name = "AUTO_ID", referencedColumnName = "ID"),
        inverseJoinColumns = @JoinColumn(name = "TESTEMUNHA_ID", referencedColumnName = "ID")
    )
    private Set<Testemunha> testemunhas = new HashSet<>();

    public AutoInfracao() {}

    public void registrar() {
        if (this.status != StatusAutoInfracao.RASCUNHO) {
            throw new IllegalStateException("Apenas autos em rascunho podem ser registrados");
        }
        this.status = StatusAutoInfracao.REGISTRADO;
    }

    public void cancelar(String usuarioCancelamento, String justificativa) {
        if (this.status == StatusAutoInfracao.CANCELADO) {
            throw new IllegalStateException("Auto já cancelado");
        }
        if (justificativa == null || justificativa.trim().length() < 20) {
            throw new IllegalArgumentException("Justificativa de cancelamento é obrigatória e deve ter pelo menos 20 caracteres");
        }
        this.status = StatusAutoInfracao.CANCELADO;
        this.dataCancelamento = LocalDateTime.now();
        this.usuarioCancelamento = usuarioCancelamento;
        this.justificativaCancelamento = justificativa;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdAutoInfracaoStr() { return idAutoInfracaoStr; }
    public void setIdAutoInfracaoStr(String idAutoInfracaoStr) { this.idAutoInfracaoStr = idAutoInfracaoStr; }

    public String getNumeroAuto() { return numeroAuto; }
    public void setNumeroAuto(String numeroAuto) { this.numeroAuto = numeroAuto; }

    public LocalDate getDataInfracao() { return dataInfracao; }
    public void setDataInfracao(LocalDate dataInfracao) { this.dataInfracao = dataInfracao; }

    public LocalDateTime getHorarioInfracao() { return horarioInfracao; }
    public void setHorarioInfracao(LocalDateTime horarioInfracao) { this.horarioInfracao = horarioInfracao; }

    public String getLocalInfracao() { return localInfracao; }
    public void setLocalInfracao(String localInfracao) { this.localInfracao = localInfracao; }

    public String getComarcaTexto() { return comarcaTexto; }
    public void setComarcaTexto(String comarcaTexto) { this.comarcaTexto = comarcaTexto; }

    public String getFundamentoLegal() { return fundamentoLegal; }
    public void setFundamentoLegal(String fundamentoLegal) { this.fundamentoLegal = fundamentoLegal; }

    public String getArtigoEca() { return artigoEca; }
    public void setArtigoEca(String artigoEca) { this.artigoEca = artigoEca; }

    public String getPortariaN() { return portariaN; }
    public void setPortariaN(String portariaN) { this.portariaN = portariaN; }

    public Integer getNumeroCriancas() { return numeroCriancas; }
    public void setNumeroCriancas(Integer numeroCriancas) { this.numeroCriancas = numeroCriancas; }

    public Integer getNumeroAdolescentes() { return numeroAdolescentes; }
    public void setNumeroAdolescentes(Integer numeroAdolescentes) { this.numeroAdolescentes = numeroAdolescentes; }

    public Boolean getAssinaturaAutuado() { return assinaturaAutuado; }
    public void setAssinaturaAutuado(Boolean assinaturaAutuado) { this.assinaturaAutuado = assinaturaAutuado; }

    public String getNomeComissarioAutuante() { return nomeComissarioAutuante; }
    public void setNomeComissarioAutuante(String nomeComissarioAutuante) { this.nomeComissarioAutuante = nomeComissarioAutuante; }

    public String getMatriculaAutuante() { return matriculaAutuante; }
    public void setMatriculaAutuante(String matriculaAutuante) { this.matriculaAutuante = matriculaAutuante; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDate getDataIntimacao() { return dataIntimacao; }
    public void setDataIntimacao(LocalDate dataIntimacao) { this.dataIntimacao = dataIntimacao; }

    public LocalDate getPrazoDefesa() { return prazoDefesa; }
    public void setPrazoDefesa(LocalDate prazoDefesa) { this.prazoDefesa = prazoDefesa; }

    public StatusAutoInfracao getStatus() { return status; }
    public void setStatus(StatusAutoInfracao status) { this.status = status; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }

    public String getUsuarioCadastro() { return usuarioCadastro; }
    public void setUsuarioCadastro(String usuarioCadastro) { this.usuarioCadastro = usuarioCadastro; }

    public String getUsuarioAtualizacao() { return usuarioAtualizacao; }
    public void setUsuarioAtualizacao(String usuarioAtualizacao) { this.usuarioAtualizacao = usuarioAtualizacao; }

    public LocalDateTime getDataCancelamento() { return dataCancelamento; }
    public void setDataCancelamento(LocalDateTime dataCancelamento) { this.dataCancelamento = dataCancelamento; }

    public String getUsuarioCancelamento() { return usuarioCancelamento; }
    public void setUsuarioCancelamento(String usuarioCancelamento) { this.usuarioCancelamento = usuarioCancelamento; }

    public String getJustificativaCancelamento() { return justificativaCancelamento; }
    public void setJustificativaCancelamento(String justificativaCancelamento) { this.justificativaCancelamento = justificativaCancelamento; }

    public List<AnexoAutoInfracao> getAnexos() { return anexos; }
    public void setAnexos(List<AnexoAutoInfracao> anexos) { this.anexos = anexos; }

    public Estabelecimento getEstabelecimento() { return estabelecimento; }
    public void setEstabelecimento(Estabelecimento estabelecimento) { this.estabelecimento = estabelecimento; }

    public Responsavel getResponsavel() { return responsavel; }
    public void setResponsavel(Responsavel responsavel) { this.responsavel = responsavel; }

    public Set<MenorEnvolvido> getMenoresEnvolvidos() { return menoresEnvolvidos; }
    public void setMenoresEnvolvidos(Set<MenorEnvolvido> menoresEnvolvidos) { this.menoresEnvolvidos = menoresEnvolvidos; }

    public Set<Testemunha> getTestemunhas() { return testemunhas; }
    public void setTestemunhas(Set<Testemunha> testemunhas) { this.testemunhas = testemunhas; }
}
