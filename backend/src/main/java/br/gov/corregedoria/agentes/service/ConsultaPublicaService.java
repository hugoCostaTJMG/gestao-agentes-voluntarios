package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.ConsultaPublicaDTO;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.repository.CredencialRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ConsultaPublicaService {

    @Autowired
    private CredencialRepository credencialRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Consulta pública de credencial via QR Code
     * RN005 - Consulta Pública de Credencial
     */
    public ConsultaPublicaDTO consultarCredencial(Long credencialId) {
        Credencial credencial = credencialRepository.findById(credencialId)
                .orElseThrow(() -> new EntityNotFoundException("Credencial não encontrada"));

        AgenteVoluntario agente = credencial.getAgente();

        // RN005 - Retornar apenas dados públicos
        String comarcasAtuacao = agente.getComarcas().stream()
                .map(comarca -> comarca.getNomeComarca())
                .collect(Collectors.joining(", "));

        return new ConsultaPublicaDTO(
                agente.getId(),
                agente.getNomeCompleto(),
                agente.getStatus().getDescricao(),
                agente.getDataCadastro().format(DATE_FORMATTER),
                comarcasAtuacao
        );
    }

    /**
     * Verifica se uma credencial é válida
     */
    public boolean credencialValida(Long credencialId) {
        return credencialRepository.existsById(credencialId);
    }
}

