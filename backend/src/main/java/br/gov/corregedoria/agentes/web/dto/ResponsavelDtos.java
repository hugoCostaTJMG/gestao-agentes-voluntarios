package br.gov.corregedoria.agentes.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResponsavelDtos {
    public record ResponsavelRequest(
            @NotBlank @Size(max = 255) String nomeResponsavel,
            @Size(max = 20) String rgResponsavel,
            @Size(max = 14) String cpfResponsavel,
            @Size(max = 255) String condicaoResponsavel,
            @Size(max = 500) String enderecoResponsavel,
            @Size(max = 255) String complementoResponsavel,
            @Size(max = 255) String bairroResponsavel,
            @Size(max = 255) String cidadeResponsavel
    ) {}

    public record ResponsavelResponse(
            Long id,
            String nomeResponsavel,
            String rgResponsavel,
            String cpfResponsavel,
            String condicaoResponsavel,
            String enderecoResponsavel,
            String complementoResponsavel,
            String bairroResponsavel,
            String cidadeResponsavel
    ) {}
}
