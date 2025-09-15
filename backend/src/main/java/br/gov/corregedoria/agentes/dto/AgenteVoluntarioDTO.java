package br.gov.corregedoria.agentes.dto;

import br.gov.corregedoria.agentes.entity.StatusAgente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.util.Set;

public class AgenteVoluntarioDTO {

    private Long id;

    @NotBlank(message = "Nome completo é obrigatório")
    private String nomeCompleto;

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
    private String cpf;

    @NotBlank(message = "Telefone é obrigatório")
    private String telefone;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail deve ter formato válido")
    private String email;

    // Novos campos adicionados
    private String fotoBase64; // Para upload via frontend
    private String numeroCarteiraIdentidade;
    private LocalDate dataExpedicaoCI;
    private String nacionalidade;
    private String naturalidade;
    private String uf;
    private LocalDate dataNascimento;
    private String filiacaoPai;
    private String filiacaoMae;

    private String disponibilidade;

    @NotEmpty(message = "Pelo menos uma comarca deve ser selecionada")
    private Set<Long> comarcasIds;

    @NotEmpty(message = "Pelo menos uma área de atuação deve ser selecionada")
    private Set<Long> areasAtuacaoIds;

    private StatusAgente status;
    private String dataCadastro;
    private String usuarioCadastro;

    // Construtores
    public AgenteVoluntarioDTO() {}

    public AgenteVoluntarioDTO(String nomeCompleto, String cpf, String telefone, String email, 
                              String disponibilidade, Set<Long> comarcasIds, Set<Long> areasAtuacaoIds) {
        this.nomeCompleto = nomeCompleto;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
        this.disponibilidade = disponibilidade;
        this.comarcasIds = comarcasIds;
        this.areasAtuacaoIds = areasAtuacaoIds;
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

    public String getFotoBase64() {
        return fotoBase64;
    }

    public void setFotoBase64(String fotoBase64) {
        this.fotoBase64 = fotoBase64;
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

    public String getDisponibilidade() {
        return disponibilidade;
    }

    public void setDisponibilidade(String disponibilidade) {
        this.disponibilidade = disponibilidade;
    }

    public Set<Long> getComarcasIds() {
        return comarcasIds;
    }

    public void setComarcasIds(Set<Long> comarcasIds) {
        this.comarcasIds = comarcasIds;
    }

    public Set<Long> getAreasAtuacaoIds() {
        return areasAtuacaoIds;
    }

    public void setAreasAtuacaoIds(Set<Long> areasAtuacaoIds) {
        this.areasAtuacaoIds = areasAtuacaoIds;
    }

    public StatusAgente getStatus() {
        return status;
    }

    public void setStatus(StatusAgente status) {
        this.status = status;
    }

    public String getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(String dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getUsuarioCadastro() {
        return usuarioCadastro;
    }

    public void setUsuarioCadastro(String usuarioCadastro) {
        this.usuarioCadastro = usuarioCadastro;
    }

    @Override
    public String toString() {
        return "AgenteVoluntarioDTO{" +
                "id=" + id +
                ", nomeCompleto='" + nomeCompleto + '\'' +
                ", cpf='" + cpf + '\'' +
                ", status=" + status +
                '}';
    }
}

