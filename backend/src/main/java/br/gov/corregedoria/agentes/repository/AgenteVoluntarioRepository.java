package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.StatusAgente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgenteVoluntarioRepository extends JpaRepository<AgenteVoluntario, UUID> {

    /**
     * Verifica se existe um agente com o CPF informado
     */
    boolean existsByCpf(String cpf);

    /**
     * Busca um agente pelo CPF
     */
    Optional<AgenteVoluntario> findByCpf(String cpf);

    /**
     * Busca agentes por status
     */
    List<AgenteVoluntario> findByStatus(StatusAgente status);

    /**
     * Busca agentes por status com paginação
     */
    Page<AgenteVoluntario> findByStatus(StatusAgente status, Pageable pageable);

    /**
     * Busca agentes por nome (busca parcial, case insensitive)
     */
    @Query("SELECT a FROM AgenteVoluntario a WHERE LOWER(a.nomeCompleto) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<AgenteVoluntario> findByNomeCompletoContainingIgnoreCase(@Param("nome") String nome);

    /**
     * Busca agentes por comarca
     */
    @Query("SELECT a FROM AgenteVoluntario a JOIN a.comarcas c WHERE c.nomeComarca = :nomeComarca")
    List<AgenteVoluntario> findByComarca(@Param("nomeComarca") String nomeComarca);

    /**
     * Busca agentes por área de atuação
     */
    @Query("SELECT a FROM AgenteVoluntario a JOIN a.areasAtuacao aa WHERE aa.nomeAreaAtuacao = :nomeAreaAtuacao")
    List<AgenteVoluntario> findByAreaAtuacao(@Param("nomeAreaAtuacao") String nomeAreaAtuacao);

    /**
     * Busca agentes ativos que podem emitir credencial
     */
    @Query("SELECT a FROM AgenteVoluntario a WHERE a.status = 'ATIVO'")
    List<AgenteVoluntario> findAgentesAtivos();

    /**
     * Conta o número de agentes por status
     */
    long countByStatus(StatusAgente status);

    /**
     * Busca agentes cadastrados por um usuário específico
     */
    List<AgenteVoluntario> findByUsuarioCadastro(String usuarioCadastro);
}

