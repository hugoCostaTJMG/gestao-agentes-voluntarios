package br.gov.corregedoria.agentes.dto;

import java.time.LocalDate;
import java.util.Set;

public class AgenteVoluntarioResponseDTO {

    private Long id;
    private String nomeCompleto;
    private String cpf;
    private String telefone;
    private String email;
    private String disponibilidade;
    private String status;
    private String dataCadastro;
    private String usuarioCadastro;
    private Set<ComarcaDTO> comarcas;
    private Set<AreaAtuacaoDTO> areasAtuacao;

    // Campos adicionais para tela de edição
    private String numeroCarteiraIdentidade;
    private LocalDate dataExpedicaoCI;
    private String nacionalidade;
    private String naturalidade;
    private String uf;
    private LocalDate dataNascimento;
    private String filiacaoPai;
    private String filiacaoMae;

    // Opcional: ids diretos para facilitar binding no frontend
    private Set<Long> comarcasIds;
    private Set<Long> areasAtuacaoIds;

    public AgenteVoluntarioResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisponibilidade() { return disponibilidade; }
    public void setDisponibilidade(String disponibilidade) { this.disponibilidade = disponibilidade; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(String dataCadastro) { this.dataCadastro = dataCadastro; }

    public String getUsuarioCadastro() { return usuarioCadastro; }
    public void setUsuarioCadastro(String usuarioCadastro) { this.usuarioCadastro = usuarioCadastro; }

    public Set<ComarcaDTO> getComarcas() { return comarcas; }
    public void setComarcas(Set<ComarcaDTO> comarcas) { this.comarcas = comarcas; }

    public Set<AreaAtuacaoDTO> getAreasAtuacao() { return areasAtuacao; }
    public void setAreasAtuacao(Set<AreaAtuacaoDTO> areasAtuacao) { this.areasAtuacao = areasAtuacao; }

    public String getNumeroCarteiraIdentidade() { return numeroCarteiraIdentidade; }
    public void setNumeroCarteiraIdentidade(String numeroCarteiraIdentidade) { this.numeroCarteiraIdentidade = numeroCarteiraIdentidade; }

    public LocalDate getDataExpedicaoCI() { return dataExpedicaoCI; }
    public void setDataExpedicaoCI(LocalDate dataExpedicaoCI) { this.dataExpedicaoCI = dataExpedicaoCI; }

    public String getNacionalidade() { return nacionalidade; }
    public void setNacionalidade(String nacionalidade) { this.nacionalidade = nacionalidade; }

    public String getNaturalidade() { return naturalidade; }
    public void setNaturalidade(String naturalidade) { this.naturalidade = naturalidade; }

    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getFiliacaoPai() { return filiacaoPai; }
    public void setFiliacaoPai(String filiacaoPai) { this.filiacaoPai = filiacaoPai; }

    public String getFiliacaoMae() { return filiacaoMae; }
    public void setFiliacaoMae(String filiacaoMae) { this.filiacaoMae = filiacaoMae; }

    public Set<Long> getComarcasIds() { return comarcasIds; }
    public void setComarcasIds(Set<Long> comarcasIds) { this.comarcasIds = comarcasIds; }

    public Set<Long> getAreasAtuacaoIds() { return areasAtuacaoIds; }
    public void setAreasAtuacaoIds(Set<Long> areasAtuacaoIds) { this.areasAtuacaoIds = areasAtuacaoIds; }
}
