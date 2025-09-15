package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "area_atuacao")
public class AreaAtuacao {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "area_atuacao_seq")
    @SequenceGenerator(name = "area_atuacao_seq", sequenceName = "area_atuacao_seq", allocationSize = 1)
    @Column(name = "id_area_atuacao", updatable = false, nullable = false)
    private Long id;

    @NotBlank(message = "Nome da área de atuação é obrigatório")
    @Column(name = "nome_area_atuacao", nullable = false, unique = true, length = 255)
    private String nomeAreaAtuacao;

    @ManyToMany(mappedBy = "areasAtuacao", fetch = FetchType.LAZY)
    private Set<AgenteVoluntario> agentes = new HashSet<>();

    // Construtores
    public AreaAtuacao() {}

    public AreaAtuacao(String nomeAreaAtuacao) {
        this.nomeAreaAtuacao = nomeAreaAtuacao;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeAreaAtuacao() {
        return nomeAreaAtuacao;
    }

    public void setNomeAreaAtuacao(String nomeAreaAtuacao) {
        this.nomeAreaAtuacao = nomeAreaAtuacao;
    }

    public Set<AgenteVoluntario> getAgentes() {
        return agentes;
    }

    public void setAgentes(Set<AgenteVoluntario> agentes) {
        this.agentes = agentes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AreaAtuacao)) return false;
        AreaAtuacao that = (AreaAtuacao) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "AreaAtuacao{" +
                "id=" + id +
                ", nomeAreaAtuacao='" + nomeAreaAtuacao + '\'' +
                '}';
    }
}

