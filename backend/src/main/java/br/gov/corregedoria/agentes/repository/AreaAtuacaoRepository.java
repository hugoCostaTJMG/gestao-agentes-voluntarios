package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.AreaAtuacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AreaAtuacaoRepository extends JpaRepository<AreaAtuacao, Long> {

    /**
     * Busca uma área de atuação pelo nome
     */
    Optional<AreaAtuacao> findByNomeAreaAtuacao(String nomeAreaAtuacao);

    /**
     * Verifica se existe uma área de atuação com o nome informado
     */
    boolean existsByNomeAreaAtuacao(String nomeAreaAtuacao);
}

