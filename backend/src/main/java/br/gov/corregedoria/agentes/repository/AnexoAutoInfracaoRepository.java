package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.AnexoAutoInfracao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para operações de banco de dados da entidade AnexoAutoInfracao
 */
@Repository
public interface AnexoAutoInfracaoRepository extends JpaRepository<AnexoAutoInfracao, Long> {
    
    /**
     * Busca todos os anexos de um auto de infração
     */
    List<AnexoAutoInfracao> findByAutoInfracao_IdOrderByDataUploadDesc(String autoInfracaoId);
    
    /**
     * Busca anexo por nome do arquivo
     */
    Optional<AnexoAutoInfracao> findByNomeArquivo(String nomeArquivo);
    
    /**
     * Busca anexos por tipo de arquivo
     */
    List<AnexoAutoInfracao> findByTipoArquivoStartingWithOrderByDataUploadDesc(String tipoArquivo);
    
    /**
     * Busca apenas imagens de um auto de infração
     */
    @Query("SELECT a FROM AnexoAutoInfracao a WHERE a.autoInfracao.id = :autoInfracaoId AND a.tipoArquivo LIKE 'image/%' ORDER BY a.dataUpload DESC")
    List<AnexoAutoInfracao> findImagensByAutoInfracao(@Param("autoInfracaoId") String autoInfracaoId);
    
    /**
     * Busca apenas documentos de um auto de infração
     */
    @Query("SELECT a FROM AnexoAutoInfracao a WHERE a.autoInfracao.id = :autoInfracaoId AND " +
           "(a.tipoArquivo = 'application/pdf' OR a.tipoArquivo = 'application/msword' OR " +
           "a.tipoArquivo = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' OR " +
           "a.tipoArquivo = 'text/plain') ORDER BY a.dataUpload DESC")
    List<AnexoAutoInfracao> findDocumentosByAutoInfracao(@Param("autoInfracaoId") String autoInfracaoId);
    
    /**
     * Conta anexos de um auto de infração
     */
    long countByAutoInfracao_Id(String autoInfracaoId);
    
    /**
     * Calcula tamanho total dos anexos de um auto de infração
     */
    @Query("SELECT COALESCE(SUM(a.tamanhoArquivo), 0) FROM AnexoAutoInfracao a WHERE a.autoInfracao.id = :autoInfracaoId")
    Long sumTamanhoArquivosByAutoInfracao(@Param("autoInfracaoId") String autoInfracaoId);
    
    /**
     * Busca anexos por usuário que fez upload
     */
    List<AnexoAutoInfracao> findByUsuarioUploadOrderByDataUploadDesc(String usuarioUpload);
    
    /**
     * Remove todos os anexos de um auto de infração
     */
    void deleteByAutoInfracao_Id(String autoInfracaoId);
}

