package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.Estabelecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstabelecimentoRepository extends JpaRepository<Estabelecimento, Long> {
    Optional<Estabelecimento> findByCnpj(String cnpj);
    boolean existsByCnpj(String cnpj);
}
