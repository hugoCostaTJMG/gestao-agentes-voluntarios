package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.GenericGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "comarca")
public class Comarca {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id_comarca", updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Nome da comarca é obrigatório")
    @Column(name = "nome_comarca", nullable = false, unique = true, length = 255)
    private String nomeComarca;

    @ManyToMany(mappedBy = "comarcas", fetch = FetchType.LAZY)
    private Set<AgenteVoluntario> agentes = new HashSet<>();

    // Construtores
    public Comarca() {}

    public Comarca(String nomeComarca) {
        this.nomeComarca = nomeComarca;
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCodigoComarca() {
    return this.id;
}
public void setCodigoComarca(UUID codigoComarca) {
    this.id = codigoComarca;
}

    public String getNomeComarca() {
        return nomeComarca;
    }

    public void setNomeComarca(String nomeComarca) {
        this.nomeComarca = nomeComarca;
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
        if (!(o instanceof Comarca)) return false;
        Comarca comarca = (Comarca) o;
        return id != null && id.equals(comarca.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Comarca{" +
                "id=" + id +
                ", nomeComarca='" + nomeComarca + '\'' +
                '}';
    }
}

