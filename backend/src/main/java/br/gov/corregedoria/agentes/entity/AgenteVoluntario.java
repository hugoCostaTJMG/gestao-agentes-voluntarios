package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "AGENTE_VOLUNTARIO")
public class AgenteVoluntario {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_AGENTE_VOLUNTARIO")
    @SequenceGenerator(name = "S_AGENTE_VOLUNTARIO", sequenceName = "S_AGENTE_VOLUNTARIO", allocationSize = 1)
    @Column(name = "ID", updatable = false, nullable = false)
    private Long id;

    @Column(name = "ID_AGENTE_NEGOCIO", length = 255)
    private String idAgenteNegocio;

    @NotBlank(message = "Nome completo é obrigatório")
    @Column(name = "nome_completo", nullable = false, length = 255)
    private String nomeCompleto;

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @NotBlank(message = "Telefone é obrigatório")
    @Column(name = "telefone", nullable = false, length = 20)
    private String telefone;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail deve ter formato válido")
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    // Novos campos adicionados
    @Lob
    @Column(name = "foto")
    private byte[] foto;

    @Column(name = "numero_carteira_identidade", length = 20)
    private String numeroCarteiraIdentidade;

    @Column(name = "data_expedicao_ci")
    private LocalDate dataExpedicaoCI;

    @Column(name = "nacionalidade", length = 50)
    private String nacionalidade;

    @Column(name = "naturalidade", length = 100)
    private String naturalidade;

    @Column(name = "uf", length = 2)
    private String uf;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(name = "filiacao_pai", length = 255)
    private String filiacaoPai;

    @Column(name = "filiacao_mae", length = 255)
    private String filiacaoMae;

    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false)
    private LocalDateTime dataCadastro;

    @NotBlank(message = "Usuário de cadastro é obrigatório")
    @Column(name = "usuario_cadastro", nullable = false, length = 100)
    private String usuarioCadastro;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusAgente status = StatusAgente.EM_ANALISE;

    @Column(name = "disponibilidade", length = 500)
    private String disponibilidade;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "AGENTE_COMARCA",
        joinColumns = @JoinColumn(name = "AGENTE_ID", referencedColumnName = "ID"),
        inverseJoinColumns = @JoinColumn(name = "COMARCA_ID", referencedColumnName = "ID")
    )
    private Set<Comarca> comarcas = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "agente_area_atuacao",
        joinColumns = @JoinColumn(name = "AGENTE_ID"),
        inverseJoinColumns = @JoinColumn(name = "AREA_ATUACAO_ID")
    )
    private Set<AreaAtuacao> areasAtuacao = new HashSet<>();

    @OneToMany(mappedBy = "agente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Credencial> credenciais = new HashSet<>();

    // Construtores
    public AgenteVoluntario() {}

    public AgenteVoluntario(String nomeCompleto, String cpf, String telefone, String email, 
                           String usuarioCadastro, String disponibilidade) {
        this.nomeCompleto = nomeCompleto;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
        this.usuarioCadastro = usuarioCadastro;
        this.disponibilidade = disponibilidade;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public byte[] getFoto() {
        return foto;
    }

    public void setFoto(byte[] foto) {
        this.foto = foto;
    }

    public String getNumeroCarteiraIdentidade() {
        return numeroCarteiraIdentidade;
    }

    public void setNumeroCarteiraIdentidade(String numeroCarteiraIdentidade) {
        this.numeroCarteiraIdentidade = numeroCarteiraIdentidade;
    }

    public LocalDate getDataExpedicaoCI() {
        return dataExpedicaoCI;
    }

    public void setDataExpedicaoCI(LocalDate dataExpedicaoCI) {
        this.dataExpedicaoCI = dataExpedicaoCI;
    }

    public String getNacionalidade() {
        return nacionalidade;
    }

    public void setNacionalidade(String nacionalidade) {
        this.nacionalidade = nacionalidade;
    }

    public String getNaturalidade() {
        return naturalidade;
    }

    public void setNaturalidade(String naturalidade) {
        this.naturalidade = naturalidade;
    }

    public String getUf() {
        return uf;
    }

    public String getIdAgenteNegocio() {
        return idAgenteNegocio;
    }

    public void setIdAgenteNegocio(String idAgenteNegocio) {
        this.idAgenteNegocio = idAgenteNegocio;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getFiliacaoPai() {
        return filiacaoPai;
    }

    public void setFiliacaoPai(String filiacaoPai) {
        this.filiacaoPai = filiacaoPai;
    }

    public String getFiliacaoMae() {
        return filiacaoMae;
    }

    public void setFiliacaoMae(String filiacaoMae) {
        this.filiacaoMae = filiacaoMae;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getUsuarioCadastro() {
        return usuarioCadastro;
    }

    public void setUsuarioCadastro(String usuarioCadastro) {
        this.usuarioCadastro = usuarioCadastro;
    }

    public StatusAgente getStatus() {
        return status;
    }

    public void setStatus(StatusAgente status) {
        this.status = status;
    }

    public String getDisponibilidade() {
        return disponibilidade;
    }

    public void setDisponibilidade(String disponibilidade) {
        this.disponibilidade = disponibilidade;
    }

    public Set<Comarca> getComarcas() {
        return comarcas;
    }

    public void setComarcas(Set<Comarca> comarcas) {
        this.comarcas = comarcas;
    }

    public Set<AreaAtuacao> getAreasAtuacao() {
        return areasAtuacao;
    }

    public void setAreasAtuacao(Set<AreaAtuacao> areasAtuacao) {
        this.areasAtuacao = areasAtuacao;
    }

    public Set<Credencial> getCredenciais() {
        return credenciais;
    }

    public void setCredenciais(Set<Credencial> credenciais) {
        this.credenciais = credenciais;
    }

    // Métodos auxiliares
    public void adicionarComarca(Comarca comarca) {
        this.comarcas.add(comarca);
        comarca.getAgentes().add(this);
    }

    public void removerComarca(Comarca comarca) {
        this.comarcas.remove(comarca);
        comarca.getAgentes().remove(this);
    }

    public void adicionarAreaAtuacao(AreaAtuacao areaAtuacao) {
        this.areasAtuacao.add(areaAtuacao);
        areaAtuacao.getAgentes().add(this);
    }

    public void removerAreaAtuacao(AreaAtuacao areaAtuacao) {
        this.areasAtuacao.remove(areaAtuacao);
        areaAtuacao.getAgentes().remove(this);
    }

    public boolean podeEmitirCredencial() {
        return this.status == StatusAgente.ATIVO;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AgenteVoluntario)) return false;
        AgenteVoluntario that = (AgenteVoluntario) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "AgenteVoluntario{" +
                "id=" + id +
                ", nomeCompleto='" + nomeCompleto + '\'' +
                ", cpf='" + cpf + '\'' +
                ", status=" + status +
                '}';
    }
}
