package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.Responsavel;
import br.gov.corregedoria.agentes.repository.ResponsavelRepository;
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
public class ResponsavelService {

    @Autowired
    private ResponsavelRepository repository;

    public Responsavel criar(@Valid Responsavel r) {
        if (r.getIdResponsavel() == null || r.getIdResponsavel().isBlank()) {
            r.setIdResponsavel(UUID.randomUUID().toString());
        }
        if (r.getCpfResponsavel() != null && !r.getCpfResponsavel().isBlank() && repository.existsByCpfResponsavel(r.getCpfResponsavel())) {
            throw new IllegalStateException("CPF já cadastrado");
        }
        return repository.save(r);
    }

    public Responsavel atualizar(String id, @Valid Responsavel dados) {
        Responsavel existente = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Responsável não encontrado: " + id));
        if (dados.getCpfResponsavel() != null && !dados.getCpfResponsavel().equals(existente.getCpfResponsavel()) && repository.existsByCpfResponsavel(dados.getCpfResponsavel())) {
            throw new IllegalStateException("CPF já cadastrado");
        }
        existente.setNomeResponsavel(dados.getNomeResponsavel());
        existente.setRgResponsavel(dados.getRgResponsavel());
        existente.setCpfResponsavel(dados.getCpfResponsavel());
        existente.setCondicaoResponsavel(dados.getCondicaoResponsavel());
        existente.setEnderecoResponsavel(dados.getEnderecoResponsavel());
        existente.setComplementoResponsavel(dados.getComplementoResponsavel());
        existente.setBairroResponsavel(dados.getBairroResponsavel());
        existente.setCidadeResponsavel(dados.getCidadeResponsavel());
        return repository.save(existente);
    }

    @Transactional(readOnly = true)
    public Responsavel buscar(String id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Responsável não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Responsavel> listar(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public void excluir(String id) {
        Responsavel r = buscar(id);
        repository.delete(r);
    }
}

