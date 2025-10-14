package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.Testemunha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestemunhaRepository extends JpaRepository<Testemunha, String> {
}

