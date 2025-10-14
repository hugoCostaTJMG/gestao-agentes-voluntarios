package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.Responsavel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResponsavelRepository extends JpaRepository<Responsavel, String> {
    Optional<Responsavel> findByCpfResponsavel(String cpfResponsavel);
    boolean existsByCpfResponsavel(String cpfResponsavel);
}

