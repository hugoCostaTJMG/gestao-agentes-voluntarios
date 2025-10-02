package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CredencialRepository extends JpaRepository<Credencial, Long> {

    /**
     * Busca credenciais de um agente específico
     */
    List<Credencial> findByAgente(AgenteVoluntario agente);

    /**
     * Busca credenciais de um agente pelo ID do agente
     */
    List<Credencial> findByAgenteId(Long agenteId);

    /**
     * Busca a credencial mais recente de um agente (seguro para múltiplos resultados)
     * Observação: usa derivation com FIRST + ORDER BY para gerar LIMIT 1.
     */
    Optional<Credencial> findFirstByAgenteIdOrderByDataEmissaoDescIdDesc(Long agenteId);

    /**
     * Busca credencial pela URL do QR Code
     */
    Optional<Credencial> findByQrCodeUrl(String qrCodeUrl);

    /**
     * Conta o número de credenciais emitidas por um usuário
     */
    long countByUsuarioEmissao(String usuarioEmissao);

    /**
     * Busca a credencial mais recente emitida por um determinado identificador de emissão
     * (usuarioEmissao). Útil para consulta pública quando a chave do QR não é o ID numérico.
     */
    Optional<Credencial> findFirstByUsuarioEmissaoOrderByDataEmissaoDescIdDesc(String usuarioEmissao);
}
