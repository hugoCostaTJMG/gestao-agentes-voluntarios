package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.Comarca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComarcaRepository extends JpaRepository<Comarca, Long> {

    /**
     * Busca uma comarca pelo nome
     */
    Optional<Comarca> findByNomeComarca(String nomeComarca);

    /**
     * Verifica se existe uma comarca com o nome informado
     */
    boolean existsByNomeComarca(String nomeComarca);
}

