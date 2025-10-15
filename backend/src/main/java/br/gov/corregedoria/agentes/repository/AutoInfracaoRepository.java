package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.AutoInfracao;
import br.gov.corregedoria.agentes.entity.StatusAutoInfracao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository para operações de banco de dados da entidade AutoInfracao
 * 
 * Implementa consultas customizadas para os filtros do UC006
 */
@Repository
public interface AutoInfracaoRepository extends JpaRepository<AutoInfracao, Long> {
    Optional<AutoInfracao> findByIdAutoInfracaoStr(String idAutoInfracaoStr);

    Page<AutoInfracao> findByStatusOrderByDataCadastroDesc(StatusAutoInfracao status, Pageable pageable);

    Page<AutoInfracao> findByDataInfracaoBetweenOrderByDataCadastroDesc(LocalDate dataInicio, LocalDate dataFim, Pageable pageable);

    long countByStatus(StatusAutoInfracao status);

    List<AutoInfracao> findByDataCadastroBetween(LocalDate dataInicio, LocalDate dataFim);
}
