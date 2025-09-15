package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.LogAuditoriaAutoInfracao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository para operações de banco de dados da entidade LogAuditoriaAutoInfracao
 */
@Repository
public interface LogAuditoriaAutoInfracaoRepository extends JpaRepository<LogAuditoriaAutoInfracao, Long> {
    
    /**
     * Busca logs de auditoria de um auto de infração específico
     */
    List<LogAuditoriaAutoInfracao> findByAutoInfracaoIdOrderByDataOperacaoDesc(Long autoInfracaoId);
    
    /**
     * Busca logs de auditoria por usuário
     */
    Page<LogAuditoriaAutoInfracao> findByUsuarioOrderByDataOperacaoDesc(String usuario, Pageable pageable);
    
    /**
     * Busca logs de auditoria por tipo de operação
     */
    Page<LogAuditoriaAutoInfracao> findByTipoOperacaoOrderByDataOperacaoDesc(String tipoOperacao, Pageable pageable);
    
    /**
     * Busca logs de auditoria por período
     */
    Page<LogAuditoriaAutoInfracao> findByDataOperacaoBetweenOrderByDataOperacaoDesc(
        LocalDateTime dataInicio, LocalDateTime dataFim, Pageable pageable);
    
    /**
     * Busca logs de operações que falharam
     */
    Page<LogAuditoriaAutoInfracao> findBySucessoFalseOrderByDataOperacaoDesc(Pageable pageable);
    
    /**
     * Busca logs de tentativas de acesso negado
     */
    Page<LogAuditoriaAutoInfracao> findByTipoOperacaoAndSucessoFalseOrderByDataOperacaoDesc(
        String tipoOperacao, Pageable pageable);
    
    /**
     * Consulta complexa para relatórios de auditoria
     */
    @Query("SELECT l FROM LogAuditoriaAutoInfracao l WHERE " +
           "(:autoInfracaoId IS NULL OR l.autoInfracaoId = :autoInfracaoId) AND " +
           "(:usuario IS NULL OR l.usuario = :usuario) AND " +
           "(:tipoOperacao IS NULL OR l.tipoOperacao = :tipoOperacao) AND " +
           "(:dataInicio IS NULL OR l.dataOperacao >= :dataInicio) AND " +
           "(:dataFim IS NULL OR l.dataOperacao <= :dataFim) AND " +
           "(:sucesso IS NULL OR l.sucesso = :sucesso) " +
           "ORDER BY l.dataOperacao DESC")
    Page<LogAuditoriaAutoInfracao> findWithFilters(
        @Param("autoInfracaoId") Long autoInfracaoId,
        @Param("usuario") String usuario,
        @Param("tipoOperacao") String tipoOperacao,
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim,
        @Param("sucesso") Boolean sucesso,
        Pageable pageable
    );
    
    /**
     * Conta operações por tipo
     */
    long countByTipoOperacao(String tipoOperacao);
    
    /**
     * Conta operações por usuário
     */
    long countByUsuario(String usuario);
    
    /**
     * Conta operações que falharam
     */
    long countBySucessoFalse();
    
    /**
     * Busca últimas operações de um auto de infração
     */
    List<LogAuditoriaAutoInfracao> findTop10ByAutoInfracaoIdOrderByDataOperacaoDesc(Long autoInfracaoId);
    
    /**
     * Busca operações de cancelamento
     */
    List<LogAuditoriaAutoInfracao> findByTipoOperacaoAndJustificativaIsNotNullOrderByDataOperacaoDesc(String tipoOperacao);
    
    /**
     * Estatísticas de operações por período
     */
    @Query("SELECT l.tipoOperacao, COUNT(l) FROM LogAuditoriaAutoInfracao l " +
           "WHERE l.dataOperacao BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY l.tipoOperacao ORDER BY COUNT(l) DESC")
    List<Object[]> getEstatisticasOperacoesPorPeriodo(
        @Param("dataInicio") LocalDateTime dataInicio, 
        @Param("dataFim") LocalDateTime dataFim);
    
    /**
     * Usuários mais ativos por período
     */
    @Query("SELECT l.usuario, COUNT(l) FROM LogAuditoriaAutoInfracao l " +
           "WHERE l.dataOperacao BETWEEN :dataInicio AND :dataFim " +
           "GROUP BY l.usuario ORDER BY COUNT(l) DESC")
    List<Object[]> getUsuariosMaisAtivosPorPeriodo(
        @Param("dataInicio") LocalDateTime dataInicio, 
        @Param("dataFim") LocalDateTime dataFim);
}

