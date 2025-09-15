package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.LogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

    /**
     * Busca logs por usuário
     */
    List<LogAuditoria> findByUsuario(String usuario);

    /**
     * Busca logs por tipo de operação
     */
    List<LogAuditoria> findByTipoOperacao(String tipoOperacao);

    /**
     * Busca logs por período
     */
    @Query("SELECT l FROM LogAuditoria l WHERE l.dataHora BETWEEN :dataInicio AND :dataFim ORDER BY l.dataHora DESC")
    List<LogAuditoria> findByPeriodo(@Param("dataInicio") LocalDateTime dataInicio, 
                                    @Param("dataFim") LocalDateTime dataFim);

    /**
     * Busca logs por usuário e período com paginação
     */
    @Query("SELECT l FROM LogAuditoria l WHERE l.usuario = :usuario AND l.dataHora BETWEEN :dataInicio AND :dataFim ORDER BY l.dataHora DESC")
    Page<LogAuditoria> findByUsuarioAndPeriodo(@Param("usuario") String usuario,
                                              @Param("dataInicio") LocalDateTime dataInicio,
                                              @Param("dataFim") LocalDateTime dataFim,
                                              Pageable pageable);

    /**
     * Busca logs mais recentes com paginação
     */
    Page<LogAuditoria> findAllByOrderByDataHoraDesc(Pageable pageable);
}

