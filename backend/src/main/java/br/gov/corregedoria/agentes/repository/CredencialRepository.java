package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, UUID> {

    /**
     * Busca credenciais de um agente específico
     */
    List<Credencial> findByAgente(AgenteVoluntario agente);

    /**
     * Busca credenciais de um agente pelo ID do agente
     */
    List<Credencial> findByAgenteId(UUID agenteId);

    /**
     * Busca a credencial mais recente de um agente
     */
    @Query("SELECT c FROM Credencial c WHERE c.agente.id = :agenteId ORDER BY c.dataEmissao DESC")
    Optional<Credencial> findCredencialMaisRecenteByAgenteId(@Param("agenteId") UUID agenteId);

    /**
     * Busca credencial pela URL do QR Code
     */
    Optional<Credencial> findByQrCodeUrl(String qrCodeUrl);

    /**
     * Conta o número de credenciais emitidas por um usuário
     */
    long countByUsuarioEmissao(String usuarioEmissao);
}

