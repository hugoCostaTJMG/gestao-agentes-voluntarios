package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.MenorEnvolvido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenorEnvolvidoRepository extends JpaRepository<MenorEnvolvido, Long> {
    List<MenorEnvolvido> findByAutoInfracao_Id(Long autoInfracaoId);
}
