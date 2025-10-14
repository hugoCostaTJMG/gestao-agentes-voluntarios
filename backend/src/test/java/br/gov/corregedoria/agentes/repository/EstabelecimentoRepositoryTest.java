package br.gov.corregedoria.agentes.repository;

import br.gov.corregedoria.agentes.entity.Estabelecimento;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class EstabelecimentoRepositoryTest {

    @Autowired
    private EstabelecimentoRepository repository;

    @Test
    void shouldEnforceUniqueCnpj() {
        Estabelecimento a = new Estabelecimento();
        a.setIdEstabelecimentoStr("id-1");
        a.setNomeEstabelecimento("A");
        a.setCnpj("12345678901234");
        repository.saveAndFlush(a);

        Estabelecimento b = new Estabelecimento();
        b.setIdEstabelecimentoStr("id-2");
        b.setNomeEstabelecimento("B");
        b.setCnpj("12345678901234");

        Assertions.assertThrows(Exception.class, () -> {
            repository.saveAndFlush(b);
        });
    }
}

