package br.gov.corregedoria.agentes.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EstabelecimentoDtos {
    public record EstabelecimentoRequest(
            @NotBlank @Size(max = 255) String nomeEstabelecimento,
            @Size(max = 18) String cnpj,
            @Size(max = 500) String enderecoEstabelecimento,
            @Size(max = 255) String complementoEstabelecimento,
            @Size(max = 255) String bairroEstabelecimento,
            @Size(max = 255) String cidadeEstabelecimento
    ) {}

    public record EstabelecimentoResponse(
            Long id,
            String nomeEstabelecimento,
            String cnpj,
            String enderecoEstabelecimento,
            String complementoEstabelecimento,
            String bairroEstabelecimento,
            String cidadeEstabelecimento
    ) {}
}
