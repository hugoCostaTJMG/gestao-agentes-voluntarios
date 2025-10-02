package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.entity.AutoInfracao;
import br.gov.corregedoria.agentes.entity.StatusAutoInfracao;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.repository.AutoInfracaoRepository;
import br.gov.corregedoria.agentes.repository.LogAuditoriaAutoInfracaoRepository;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutoInfracaoServiceTest {

    @Mock
    AutoInfracaoRepository autoRepository;
    @Mock
    AgenteVoluntarioRepository agenteRepository;
    @Mock
    LogAuditoriaAutoInfracaoRepository logRepository;
    @Mock
    AuditoriaUtil auditoriaUtil;

    @InjectMocks
    AutoInfracaoService service;

    AutoInfracao rascunho;

    @BeforeEach
    void setup() {
        rascunho = new AutoInfracao();
        rascunho.setId(10L);
        rascunho.setStatus(StatusAutoInfracao.RASCUNHO);
        when(autoRepository.findById(10L)).thenReturn(Optional.of(rascunho));
        when(autoRepository.save(any(AutoInfracao.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void registrar_mudaStatusEGeraNumero() {
        AutoInfracao registrado = service.registrar(10L, "user", "AGENTE");
        assertEquals(StatusAutoInfracao.REGISTRADO, registrado.getStatus());
        assertNotNull(registrado.getNumeroAuto());
        assertTrue(registrado.getNumeroAuto().startsWith("AI-"));
        verify(autoRepository).save(any(AutoInfracao.class));
        verify(logRepository).save(any());
    }

    @Test
    void cancelar_validaJustificativa() {
        rascunho.setStatus(StatusAutoInfracao.REGISTRADO);
        AutoInfracao cancelado = service.cancelar(10L, "Justificativa válida com mais de 20 chars", "user", "CORREGEDORIA");
        assertEquals(StatusAutoInfracao.CANCELADO, cancelado.getStatus());
        assertNotNull(cancelado.getJustificativaCancelamento());
    }
}
