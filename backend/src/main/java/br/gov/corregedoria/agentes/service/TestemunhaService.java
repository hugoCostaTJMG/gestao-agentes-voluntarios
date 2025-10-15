package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.Testemunha;
import br.gov.corregedoria.agentes.repository.TestemunhaRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class TestemunhaService {

    @Autowired
    private TestemunhaRepository repository;

    public Testemunha criar(@Valid Testemunha t) {
        if (t.getIdTestemunhaStr() == null || t.getIdTestemunhaStr().isBlank()) {
            t.setIdTestemunhaStr(UUID.randomUUID().toString());
        }
        return repository.save(t);
    }

    public Testemunha atualizar(Long id, @Valid Testemunha dados) {
        Testemunha existente = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Testemunha não encontrada: " + id));
        existente.setNomeTestemunha(dados.getNomeTestemunha());
        existente.setResidenciaTestemunha(dados.getResidenciaTestemunha());
        existente.setDocumentoTestemunha(dados.getDocumentoTestemunha());
        return repository.save(existente);
    }

    @Transactional(readOnly = true)
    public Testemunha buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Testemunha não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Testemunha> listar(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public void excluir(Long id) {
        Testemunha t = buscar(id);
        repository.delete(t);
    }
}
