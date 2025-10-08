package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.ConsultaPublicaDTO;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.entity.Credencial;
import br.gov.corregedoria.agentes.repository.CredencialRepository;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
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

    @Autowired
    private AgenteVoluntarioRepository agenteVoluntarioRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Consulta pública de credencial via QR Code
     * RN005 - Consulta Pública de Credencial
     */
    public ConsultaPublicaDTO consultarCredencial(Long credencialId) {
        return consultarCredencialPorChave(String.valueOf(credencialId));
    }

    /**
     * Consulta pública aceitando chave flexível (ID numérico ou usuarioEmissao)
     */
    public ConsultaPublicaDTO consultarCredencialPorChave(String chave) {
        Credencial credencial;
        // 1) Se for número válido, busca por ID
        try {
            long id = Long.parseLong(chave);
            credencial = credencialRepository.findById(id)
                    .orElse(null);
        } catch (NumberFormatException nfe) {
            credencial = null;
        }
        // 2) Senão, tenta por usuarioEmissao (mais recente)
        if (credencial == null) {
            credencial = credencialRepository
                    .findFirstByUsuarioEmissaoOrderByDataEmissaoDescIdDesc(chave)
                    .orElseThrow(() -> new EntityNotFoundException("Credencial não encontrada"));
        }

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

    /**
     * Consulta pública por CPF (apenas dados públicos do agente)
     */
    public ConsultaPublicaDTO consultarPorCpf(String cpf) {
        if (cpf == null) throw new EntityNotFoundException("CPF inválido");
        String digits = cpf.replaceAll("\\D", "");
        return agenteVoluntarioRepository.findByCpf(digits)
                .map(agente -> {
                    String comarcasAtuacao = agente.getComarcas().stream()
                            .map(c -> c.getNomeComarca())
                            .collect(Collectors.joining(", "));
                    return new ConsultaPublicaDTO(
                            agente.getId(),
                            agente.getNomeCompleto(),
                            agente.getStatus().getDescricao(),
                            agente.getDataCadastro().format(DATE_FORMATTER),
                            comarcasAtuacao
                    );
                })
                .orElseThrow(() -> new EntityNotFoundException("Agente não encontrado para o CPF informado"));
    }
}
