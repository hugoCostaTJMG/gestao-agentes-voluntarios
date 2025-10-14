package br.gov.corregedoria.agentes.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TestemunhaDtos {
    public record TestemunhaRequest(
            @NotBlank @Size(max = 255) String nomeTestemunha,
            @Size(max = 500) String residenciaTestemunha,
            @Size(max = 255) String documentoTestemunha
    ) {}

    public record TestemunhaResponse(
            Long id,
            String idTestemunhaStr,
            String nomeTestemunha,
            String residenciaTestemunha,
            String documentoTestemunha
    ) {}
}

