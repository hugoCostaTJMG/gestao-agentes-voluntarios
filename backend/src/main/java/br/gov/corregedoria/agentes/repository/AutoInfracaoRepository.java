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
import java.util.UUID;

/**
 * Repository para operações de banco de dados da entidade AutoInfracao
 * 
 * Implementa consultas customizadas para os filtros do UC006
 */
@Repository
public interface AutoInfracaoRepository extends JpaRepository<AutoInfracao, String> {
    
    /**
     * Busca autos de infração por agente (matrícula)
     * Usado para agentes consultarem apenas seus próprios autos
     */
    Page<AutoInfracao> findByMatriculaAgenteOrderByDataCadastroDesc(String matriculaAgente, Pageable pageable);
    
    /**
     * Busca autos de infração por comarca
     * Usado para supervisores consultarem autos da sua comarca
     */
    Page<AutoInfracao> findByComarca_IdOrderByDataCadastroDesc(UUID codigoComarca, Pageable pageable);
    
    /**
     * Busca autos de infração por status
     */
    Page<AutoInfracao> findByStatusOrderByDataCadastroDesc(StatusAutoInfracao status, Pageable pageable);
    
    /**
     * Busca autos de infração por período (data da infração)
     */
    Page<AutoInfracao> findByDataInfracaoBetweenOrderByDataCadastroDesc(LocalDate dataInicio, LocalDate dataFim, Pageable pageable);
    
    /**
     * Busca autos de infração por nome do autuado (busca parcial, case insensitive)
     */
    Page<AutoInfracao> findByNomeAutuadoContainingIgnoreCaseOrderByDataCadastroDesc(String nomeAutuado, Pageable pageable);
    
    /**
     * Busca autos de infração por CPF/CNPJ do autuado
     */
    Page<AutoInfracao> findByCpfCnpjAutuadoOrderByDataCadastroDesc(String cpfCnpjAutuado, Pageable pageable);
    
    /**
     * Consulta complexa com múltiplos filtros
     * Permite filtrar por agente, status, período, autuado e comarca simultaneamente
     */
    @Query("SELECT a FROM AutoInfracao a WHERE " +
           "(:matriculaAgente IS NULL OR a.matriculaAgente = :matriculaAgente) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:dataInicio IS NULL OR a.dataInfracao >= :dataInicio) AND " +
           "(:dataFim IS NULL OR a.dataInfracao <= :dataFim) AND " +
           "(:nomeAutuado IS NULL OR LOWER(a.nomeAutuado) LIKE LOWER(CONCAT('%', :nomeAutuado, '%'))) AND " +
           "(:cpfCnpjAutuado IS NULL OR a.cpfCnpjAutuado = :cpfCnpjAutuado) AND " +
           "(:codigoComarca IS NULL OR a.comarca.id = :codigoComarca) AND " +
           "(:baseLegal IS NULL OR LOWER(a.baseLegal) LIKE LOWER(CONCAT('%', :baseLegal, '%'))) " +
           "ORDER BY a.dataCadastro DESC")
    Page<AutoInfracao> findWithFilters(
        @Param("matriculaAgente") String matriculaAgente,
        @Param("status") StatusAutoInfracao status,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim,
        @Param("nomeAutuado") String nomeAutuado,
        @Param("cpfCnpjAutuado") String cpfCnpjAutuado,
        @Param("codigoComarca") UUID codigoComarca,
        @Param("baseLegal") String baseLegal,
        Pageable pageable
    );
    
    /**
     * Consulta para supervisores - filtra por comarca do supervisor
     */
    @Query("SELECT a FROM AutoInfracao a WHERE " +
           "a.comarca.id = :codigoComarca AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:dataInicio IS NULL OR a.dataInfracao >= :dataInicio) AND " +
           "(:dataFim IS NULL OR a.dataInfracao <= :dataFim) AND " +
           "(:nomeAutuado IS NULL OR LOWER(a.nomeAutuado) LIKE LOWER(CONCAT('%', :nomeAutuado, '%'))) AND " +
           "(:cpfCnpjAutuado IS NULL OR a.cpfCnpjAutuado = :cpfCnpjAutuado) AND " +
           "(:matriculaAgente IS NULL OR a.matriculaAgente = :matriculaAgente) AND " +
           "(:baseLegal IS NULL OR LOWER(a.baseLegal) LIKE LOWER(CONCAT('%', :baseLegal, '%'))) " +
           "ORDER BY a.dataCadastro DESC")
    Page<AutoInfracao> findForSupervisor(
        @Param("codigoComarca") UUID codigoComarca,
        @Param("status") StatusAutoInfracao status,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim,
        @Param("nomeAutuado") String nomeAutuado,
        @Param("cpfCnpjAutuado") String cpfCnpjAutuado,
        @Param("matriculaAgente") String matriculaAgente,
        @Param("baseLegal") String baseLegal,
        Pageable pageable
    );
    
    /**
     * Consulta para agentes - apenas seus próprios autos
     */
    @Query("SELECT a FROM AutoInfracao a WHERE " +
           "a.matriculaAgente = :matriculaAgente AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:dataInicio IS NULL OR a.dataInfracao >= :dataInicio) AND " +
           "(:dataFim IS NULL OR a.dataInfracao <= :dataFim) AND " +
           "(:nomeAutuado IS NULL OR LOWER(a.nomeAutuado) LIKE LOWER(CONCAT('%', :nomeAutuado, '%'))) AND " +
           "(:cpfCnpjAutuado IS NULL OR a.cpfCnpjAutuado = :cpfCnpjAutuado) " +
           "ORDER BY a.dataCadastro DESC")
    Page<AutoInfracao> findForAgente(
        @Param("matriculaAgente") String matriculaAgente,
        @Param("status") StatusAutoInfracao status,
        @Param("dataInicio") LocalDate dataInicio,
        @Param("dataFim") LocalDate dataFim,
        @Param("nomeAutuado") String nomeAutuado,
        @Param("cpfCnpjAutuado") String cpfCnpjAutuado,
        Pageable pageable
    );
    
    /**
     * Busca auto de infração por ID com validação de acesso por agente
     */
    Optional<AutoInfracao> findByIdAndMatriculaAgente(String id, String matriculaAgente);
    
    /**
     * Busca auto de infração por ID com validação de acesso por comarca
     */
    @Query("SELECT a FROM AutoInfracao a WHERE a.id = :id AND a.comarca.id = :codigoComarca")
    Optional<AutoInfracao> findByIdAndComarca(@Param("id") String id, @Param("codigoComarca") UUID codigoComarca);
    
    /**
     * Conta autos de infração por status
     */
    long countByStatus(StatusAutoInfracao status);
    
    /**
     * Conta autos de infração por agente
     */
    long countByMatriculaAgente(String matriculaAgente);
    
    /**
     * Conta autos de infração por comarca
     */
    long countByComarca_Id(UUID codigoComarca);
    
    /**
     * Busca autos de infração criados em um período
     */
    List<AutoInfracao> findByDataCadastroBetween(LocalDate dataInicio, LocalDate dataFim);
    
    /**
     * Verifica se existe auto de infração com CPF/CNPJ específico em período
     * Útil para validações de duplicidade
     */
    boolean existsByCpfCnpjAutuadoAndDataInfracaoBetween(String cpfCnpjAutuado, LocalDate dataInicio, LocalDate dataFim);
    
    /**
     * Busca últimos autos de infração de um agente
     */
    List<AutoInfracao> findTop10ByMatriculaAgenteOrderByDataCadastroDesc(String matriculaAgente);
    
    /**
     * Busca autos de infração por base legal
     */
    Page<AutoInfracao> findByBaseLegalContainingIgnoreCaseOrderByDataCadastroDesc(String baseLegal, Pageable pageable);
}

