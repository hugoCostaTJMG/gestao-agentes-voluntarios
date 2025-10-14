package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.Estabelecimento;
import br.gov.corregedoria.agentes.repository.EstabelecimentoRepository;
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
public class EstabelecimentoService {

    @Autowired
    private EstabelecimentoRepository repository;

    public Estabelecimento criar(@Valid Estabelecimento e) {
        if (e.getIdEstabelecimentoStr() == null || e.getIdEstabelecimentoStr().isBlank()) {
            e.setIdEstabelecimentoStr(UUID.randomUUID().toString());
        }
        if (e.getCnpj() != null && !e.getCnpj().isBlank() && repository.existsByCnpj(e.getCnpj())) {
            throw new IllegalStateException("CNPJ já cadastrado");
        }
        return repository.save(e);
    }

    public Estabelecimento atualizar(Long id, @Valid Estabelecimento dados) {
        Estabelecimento existente = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Estabelecimento não encontrado: " + id));
        if (dados.getCnpj() != null && !dados.getCnpj().equals(existente.getCnpj()) && repository.existsByCnpj(dados.getCnpj())) {
            throw new IllegalStateException("CNPJ já cadastrado");
        }
        existente.setNomeEstabelecimento(dados.getNomeEstabelecimento());
        existente.setCnpj(dados.getCnpj());
        existente.setEnderecoEstabelecimento(dados.getEnderecoEstabelecimento());
        existente.setComplementoEstabelecimento(dados.getComplementoEstabelecimento());
        existente.setBairroEstabelecimento(dados.getBairroEstabelecimento());
        existente.setCidadeEstabelecimento(dados.getCidadeEstabelecimento());
        if (dados.getIdEstabelecimentoStr() != null && !dados.getIdEstabelecimentoStr().isBlank()) {
            existente.setIdEstabelecimentoStr(dados.getIdEstabelecimentoStr());
        }
        return repository.save(existente);
    }

    @Transactional(readOnly = true)
    public Estabelecimento buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Estabelecimento não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Estabelecimento> listar(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public void excluir(Long id) {
        Estabelecimento e = buscar(id);
        repository.delete(e);
    }
}

