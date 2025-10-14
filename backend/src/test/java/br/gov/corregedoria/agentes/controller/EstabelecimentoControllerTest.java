package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.service.EstabelecimentoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = EstabelecimentoController.class)
class EstabelecimentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EstabelecimentoService service;

    @Test
    @WithMockUser(roles = {"CORREGEDORIA"})
    void shouldReturn400WhenNomeMissing() throws Exception {
        Map<String, Object> payload = Map.of(
                "cnpj", "12345678901234"
        );
        Mockito.when(service.criar(Mockito.any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(post("/api/estabelecimentos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());
    }
}

