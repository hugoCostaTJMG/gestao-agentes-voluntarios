package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Entidade que representa um Auto de Infração registrado no sistema
 * 
 * Implementa os requisitos dos casos de uso UC005 e UC006
 * RN008 - Dados Obrigatórios para Cadastro
 * RN010 - Imutabilidade do Auto Registrado
 */
@Entity
@Table(name = "auto_infracao")
public class AutoInfracao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_AUTO_INFRACAO")
    @SequenceGenerator(name = "S_AUTO_INFRACAO", sequenceName = "S_AUTO_INFRACAO", allocationSize = 1)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    // Identificador string adicional (para novas relações do DER)
    @Column(name = "id_auto_infracao_str", unique = true, length = 255)
    private String idAutoInfracaoStr;

    @Column(name = "numero_auto", unique = true, length = 30)
    private String numeroAuto;
    
    // === DADOS DO AUTUADO (Obrigatórios) ===
    
    @NotBlank(message = "Nome do autuado é obrigatório")
    @Size(max = 200, message = "Nome do autuado deve ter no máximo 200 caracteres")
    @Column(name = "nome_autuado", nullable = false, length = 200)
    private String nomeAutuado;
    
    @NotBlank(message = "CPF/CNPJ do autuado é obrigatório")
    @Size(max = 18, message = "CPF/CNPJ deve ter no máximo 18 caracteres")
    @Column(name = "cpf_cnpj_autuado", nullable = false, length = 18)
    private String cpfCnpjAutuado;
    
    @NotBlank(message = "Endereço do autuado é obrigatório")
    @Size(max = 500, message = "Endereço deve ter no máximo 500 caracteres")
    @Column(name = "endereco_autuado", nullable = false, length = 500)
    private String enderecoAutuado;
    
    @NotBlank(message = "Contato do autuado é obrigatório")
    @Size(max = 100, message = "Contato deve ter no máximo 100 caracteres")
    @Column(name = "contato_autuado", nullable = false, length = 100)
    private String contatoAutuado;
    
    // === DADOS DO AGENTE (Obrigatórios - preenchidos automaticamente) ===
    
    @NotNull(message = "Agente voluntário é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agente_id", nullable = false)
    private AgenteVoluntario agente;
    
    @NotBlank(message = "Nome completo do agente é obrigatório")
    @Size(max = 200, message = "Nome do agente deve ter no máximo 200 caracteres")
    @Column(name = "nome_agente", nullable = false, length = 200)
    private String nomeAgente;
    
    @NotBlank(message = "Matrícula do agente é obrigatória")
    @Size(max = 50, message = "Matrícula deve ter no máximo 50 caracteres")
    @Column(name = "matricula_agente", nullable = false, length = 50)
    private String matriculaAgente;
    
    // === DADOS DA COMARCA ===
    
    @NotNull(message = "Comarca é obrigatória")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comarca_id", nullable = false)
    private Comarca comarca;

    // Campo texto para comarca conforme novo DER
    @Column(name = "comarca", length = 255)
    private String comarcaTexto;
    
    // === BASE LEGAL (Obrigatória) ===
    
    @NotBlank(message = "Base legal é obrigatória")
    @Size(max = 1000, message = "Base legal deve ter no máximo 1000 caracteres")
    @Column(name = "base_legal", nullable = false, length = 1000)
    private String baseLegal;

    // Novos campos do DER
    @Size(max = 500)
    @Column(name = "fundamento_legal", length = 500)
    private String fundamentoLegal;

    @Size(max = 255)
    @Column(name = "artigo_eca", length = 255)
    private String artigoEca;

    @Size(max = 255)
    @Column(name = "portaria_n", length = 255)
    private String portariaN;
    
    // === DADOS DA INFRAÇÃO (Obrigatórios) ===
    
    @NotNull(message = "Data da infração é obrigatória")
    @Column(name = "data_infracao", nullable = false)
    private LocalDate dataInfracao;
    
    @NotNull(message = "Hora da infração é obrigatória")
    @Column(name = "hora_infracao", nullable = false)
    private LocalTime horaInfracao;

    // Campo novo (DER): timestamp completo da infração
    @Column(name = "horario_infracao")
    private LocalDateTime horarioInfracao;
    
    @NotBlank(message = "Local da infração é obrigatório")
    @Size(max = 500, message = "Local da infração deve ter no máximo 500 caracteres")
    @Column(name = "local_infracao", nullable = false, length = 500)
    private String localInfracao;
    
    @NotBlank(message = "Descrição da conduta infracional é obrigatória")
    @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres")
    @Column(name = "descricao_conduta", nullable = false, length = 2000)
    private String descricaoConduta;
    
    // === DADOS DA CRIANÇA/ADOLESCENTE (Opcionais) ===
    
    @Size(max = 10, message = "Iniciais devem ter no máximo 10 caracteres")
    @Column(name = "iniciais_crianca", length = 10)
    private String iniciaisCrianca;
    
    @Min(value = 0, message = "Idade deve ser maior ou igual a 0")
    @Max(value = 18, message = "Idade deve ser menor ou igual a 18")
    @Column(name = "idade_crianca")
    private Integer idadeCrianca;
    
    @Size(max = 1, message = "Sexo deve ter 1 caractere")
    @Pattern(regexp = "[MF]", message = "Sexo deve ser M ou F")
    @Column(name = "sexo_crianca", length = 1)
    private String sexoCrianca;

    @Column(name = "numero_criancas")
    private Integer numeroCriancas;

    @Column(name = "numero_adolescentes")
    private Integer numeroAdolescentes;
    
    // === DADOS DAS TESTEMUNHAS (Opcionais) ===
    
    @Size(max = 200, message = "Nome da testemunha deve ter no máximo 200 caracteres")
    @Column(name = "nome_testemunha", length = 200)
    private String nomeTestemunha;
    
    @Size(max = 14, message = "CPF da testemunha deve ter no máximo 14 caracteres")
    @Column(name = "cpf_testemunha", length = 14)
    private String cpfTestemunha;
    
    // === ASSINATURA (Opcional) ===
    
    @Column(name = "assinatura_autuado")
    private Boolean assinaturaAutuado;

    @Size(max = 255)
    @Column(name = "nome_comissario_autuante", length = 255)
    private String nomeComissarioAutuante;

    @Size(max = 255)
    @Column(name = "matricula_autuante", length = 255)
    private String matriculaAutuante;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    @Column(name = "data_intimacao")
    private LocalDate dataIntimacao;

    @Column(name = "prazo_defesa")
    private LocalDate prazoDefesa;
    
    // === CONTROLE DO SISTEMA ===
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusAutoInfracao status = StatusAutoInfracao.RASCUNHO;
    
    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
    
    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    @Column(name = "usuario_cadastro", nullable = false, updatable = false, length = 100)
    private String usuarioCadastro;
    
    @Column(name = "usuario_atualizacao", length = 100)
    private String usuarioAtualizacao;
    
    // === CANCELAMENTO ===
    
    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;
    
    @Column(name = "usuario_cancelamento", length = 100)
    private String usuarioCancelamento;
    
    @Size(max = 500, message = "Justificativa de cancelamento deve ter no máximo 500 caracteres")
    @Column(name = "justificativa_cancelamento", length = 500)
    private String justificativaCancelamento;
    
    // === RELACIONAMENTOS ===
    
    @OneToMany(mappedBy = "autoInfracao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AnexoAutoInfracao> anexos = new ArrayList<>();

    // Novos relacionamentos do DER
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "estabelecimento_id")
    private Estabelecimento estabelecimento;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "responsavel_id")
    private Responsavel responsavel;

    @OneToMany(mappedBy = "autoInfracao", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MenorEnvolvido> menoresEnvolvidos = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "auto_infracao_testemunha",
        joinColumns = @JoinColumn(name = "auto_id"),
        inverseJoinColumns = @JoinColumn(name = "testemunha_id")
    )
    private Set<Testemunha> testemunhas = new HashSet<>();
    
    // === CONSTRUTORES ===
    
    public AutoInfracao() {}
    
    // === MÉTODOS DE NEGÓCIO ===
    
    /**
     * Verifica se o auto pode ser editado pelo agente informado
     */
    public boolean podeSerEditadoPorAgente(String matriculaAgente) {
        return this.status.permiteEdicaoAgente() && 
               this.matriculaAgente.equals(matriculaAgente);
    }
    
    /**
     * Verifica se o auto pode ser editado por supervisor
     */
    public boolean podeSerEditadoPorSupervisor() {
        return this.status.permiteEdicaoSupervisor();
    }
    
    /**
     * Verifica se o auto pode ser cancelado
     */
    public boolean podeSerCancelado() {
        return this.status.permiteCancelamento();
    }
    
    /**
     * Cancela o auto de infração com justificativa
     */
    public void cancelar(String usuarioCancelamento, String justificativa) {
        if (!podeSerCancelado()) {
            throw new IllegalStateException("Auto de infração não pode ser cancelado no status atual: " + this.status);
        }
        
        if (justificativa == null || justificativa.trim().length() < 20) {
            throw new IllegalArgumentException("Justificativa de cancelamento é obrigatória e deve ter pelo menos 20 caracteres");
        }
        
        this.status = StatusAutoInfracao.CANCELADO;
        this.dataCancelamento = LocalDateTime.now();
        this.usuarioCancelamento = usuarioCancelamento;
        this.justificativaCancelamento = justificativa;
    }
    
    /**
     * Registra o auto de infração (muda status de RASCUNHO para REGISTRADO)
     */
    public void registrar() {
        if (this.status != StatusAutoInfracao.RASCUNHO) {
            throw new IllegalStateException("Apenas autos em rascunho podem ser registrados");
        }
        this.status = StatusAutoInfracao.REGISTRADO;
    }
    
    // === GETTERS E SETTERS ===
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdAutoInfracaoStr() {
        return idAutoInfracaoStr;
    }

    public void setIdAutoInfracaoStr(String idAutoInfracaoStr) {
        this.idAutoInfracaoStr = idAutoInfracaoStr;
    }

    public String getNumeroAuto() {
        return numeroAuto;
    }

    public void setNumeroAuto(String numeroAuto) {
        this.numeroAuto = numeroAuto;
    }
    
    public String getNomeAutuado() {
        return nomeAutuado;
    }
    
    public void setNomeAutuado(String nomeAutuado) {
        this.nomeAutuado = nomeAutuado;
    }
    
    public String getCpfCnpjAutuado() {
        return cpfCnpjAutuado;
    }
    
    public void setCpfCnpjAutuado(String cpfCnpjAutuado) {
        this.cpfCnpjAutuado = cpfCnpjAutuado;
    }
    
    public String getEnderecoAutuado() {
        return enderecoAutuado;
    }
    
    public void setEnderecoAutuado(String enderecoAutuado) {
        this.enderecoAutuado = enderecoAutuado;
    }
    
    public String getContatoAutuado() {
        return contatoAutuado;
    }
    
    public void setContatoAutuado(String contatoAutuado) {
        this.contatoAutuado = contatoAutuado;
    }
    
    public AgenteVoluntario getAgente() {
        return agente;
    }
    
    public void setAgente(AgenteVoluntario agente) {
        this.agente = agente;
    }
    
    public String getNomeAgente() {
        return nomeAgente;
    }
    
    public void setNomeAgente(String nomeAgente) {
        this.nomeAgente = nomeAgente;
    }
    
    public String getMatriculaAgente() {
        return matriculaAgente;
    }
    
    public void setMatriculaAgente(String matriculaAgente) {
        this.matriculaAgente = matriculaAgente;
    }
    
    public Comarca getComarca() {
        return comarca;
    }
    
    public void setComarca(Comarca comarca) {
        this.comarca = comarca;
    }
    
    public String getBaseLegal() {
        return baseLegal;
    }
    
    public void setBaseLegal(String baseLegal) {
        this.baseLegal = baseLegal;
    }
    
    public LocalDate getDataInfracao() {
        return dataInfracao;
    }
    
    public void setDataInfracao(LocalDate dataInfracao) {
        this.dataInfracao = dataInfracao;
    }
    
    public LocalTime getHoraInfracao() {
        return horaInfracao;
    }
    
    public void setHoraInfracao(LocalTime horaInfracao) {
        this.horaInfracao = horaInfracao;
    }
    
    public String getLocalInfracao() {
        return localInfracao;
    }
    
    public void setLocalInfracao(String localInfracao) {
        this.localInfracao = localInfracao;
    }
    
    public String getDescricaoConduta() {
        return descricaoConduta;
    }
    
    public void setDescricaoConduta(String descricaoConduta) {
        this.descricaoConduta = descricaoConduta;
    }
    
    public String getIniciaisCrianca() {
        return iniciaisCrianca;
    }
    
    public void setIniciaisCrianca(String iniciaisCrianca) {
        this.iniciaisCrianca = iniciaisCrianca;
    }
    
    public Integer getIdadeCrianca() {
        return idadeCrianca;
    }
    
    public void setIdadeCrianca(Integer idadeCrianca) {
        this.idadeCrianca = idadeCrianca;
    }
    
    public String getSexoCrianca() {
        return sexoCrianca;
    }
    
    public void setSexoCrianca(String sexoCrianca) {
        this.sexoCrianca = sexoCrianca;
    }
    
    public String getNomeTestemunha() {
        return nomeTestemunha;
    }
    
    public void setNomeTestemunha(String nomeTestemunha) {
        this.nomeTestemunha = nomeTestemunha;
    }
    
    public String getCpfTestemunha() {
        return cpfTestemunha;
    }
    
    public void setCpfTestemunha(String cpfTestemunha) {
        this.cpfTestemunha = cpfTestemunha;
    }
    
    public Boolean getAssinaturaAutuado() {
        return assinaturaAutuado;
    }
    
    public void setAssinaturaAutuado(Boolean assinaturaAutuado) {
        this.assinaturaAutuado = assinaturaAutuado;
    }
    
    public StatusAutoInfracao getStatus() {
        return status;
    }
    
    public void setStatus(StatusAutoInfracao status) {
        this.status = status;
    }
    
    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }
    
    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }
    
    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }
    
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
    
    public String getUsuarioCadastro() {
        return usuarioCadastro;
    }
    
    public void setUsuarioCadastro(String usuarioCadastro) {
        this.usuarioCadastro = usuarioCadastro;
    }
    
    public String getUsuarioAtualizacao() {
        return usuarioAtualizacao;
    }
    
    public void setUsuarioAtualizacao(String usuarioAtualizacao) {
        this.usuarioAtualizacao = usuarioAtualizacao;
    }
    
    public LocalDateTime getDataCancelamento() {
        return dataCancelamento;
    }
    
    public void setDataCancelamento(LocalDateTime dataCancelamento) {
        this.dataCancelamento = dataCancelamento;
    }
    
    public String getUsuarioCancelamento() {
        return usuarioCancelamento;
    }
    
    public void setUsuarioCancelamento(String usuarioCancelamento) {
        this.usuarioCancelamento = usuarioCancelamento;
    }
    
    public String getJustificativaCancelamento() {
        return justificativaCancelamento;
    }
    
    public void setJustificativaCancelamento(String justificativaCancelamento) {
        this.justificativaCancelamento = justificativaCancelamento;
    }
    
    public List<AnexoAutoInfracao> getAnexos() {
        return anexos;
    }
    
    public void setAnexos(List<AnexoAutoInfracao> anexos) {
        this.anexos = anexos;
    }
    
    // === GETTERS/SETTERS ADICIONAIS (novo DER) ===
    public LocalDateTime getHorarioInfracao() { return horarioInfracao; }
    public void setHorarioInfracao(LocalDateTime horarioInfracao) { this.horarioInfracao = horarioInfracao; }

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

    public Estabelecimento getEstabelecimento() { return estabelecimento; }
    public void setEstabelecimento(Estabelecimento estabelecimento) { this.estabelecimento = estabelecimento; }

    public Responsavel getResponsavel() { return responsavel; }
    public void setResponsavel(Responsavel responsavel) { this.responsavel = responsavel; }

    public Set<MenorEnvolvido> getMenoresEnvolvidos() { return menoresEnvolvidos; }
    public void setMenoresEnvolvidos(Set<MenorEnvolvido> menoresEnvolvidos) { this.menoresEnvolvidos = menoresEnvolvidos; }

    public Set<Testemunha> getTestemunhas() { return testemunhas; }
    public void setTestemunhas(Set<Testemunha> testemunhas) { this.testemunhas = testemunhas; }
}
