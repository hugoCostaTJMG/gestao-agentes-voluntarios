package br.gov.corregedoria.agentes.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class MenorEnvolvidoDtos {
    public record MenorEnvolvidoRequest(
            @NotBlank @Size(max = 255) String nomeMenor,
            @Past LocalDate dataNascimentoMenor,
            @Size(max = 255) String documentoMenor,
            @Size(max = 500) String filiacaoMenor,
            @Size(max = 500) String residenciaMenor
    ) {}
}

