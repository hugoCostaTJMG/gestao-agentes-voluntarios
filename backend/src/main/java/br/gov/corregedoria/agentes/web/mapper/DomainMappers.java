package br.gov.corregedoria.agentes.web.mapper;

import br.gov.corregedoria.agentes.entity.*;
import br.gov.corregedoria.agentes.web.dto.*;

public class DomainMappers {

    public static Estabelecimento toEntity(EstabelecimentoDtos.EstabelecimentoRequest dto) {
        Estabelecimento e = new Estabelecimento();
        e.setNomeEstabelecimento(dto.nomeEstabelecimento());
        e.setCnpj(dto.cnpj());
        e.setEnderecoEstabelecimento(dto.enderecoEstabelecimento());
        e.setComplementoEstabelecimento(dto.complementoEstabelecimento());
        e.setBairroEstabelecimento(dto.bairroEstabelecimento());
        e.setCidadeEstabelecimento(dto.cidadeEstabelecimento());
        return e;
    }

    public static EstabelecimentoDtos.EstabelecimentoResponse toDto(Estabelecimento e) {
        return new EstabelecimentoDtos.EstabelecimentoResponse(
                e.getId(),
                e.getNomeEstabelecimento(),
                e.getCnpj(),
                e.getEnderecoEstabelecimento(),
                e.getComplementoEstabelecimento(),
                e.getBairroEstabelecimento(),
                e.getCidadeEstabelecimento()
        );
    }

    public static Responsavel toEntity(ResponsavelDtos.ResponsavelRequest dto) {
        Responsavel r = new Responsavel();
        r.setNomeResponsavel(dto.nomeResponsavel());
        r.setRgResponsavel(dto.rgResponsavel());
        r.setCpfResponsavel(dto.cpfResponsavel());
        r.setCondicaoResponsavel(dto.condicaoResponsavel());
        r.setEnderecoResponsavel(dto.enderecoResponsavel());
        r.setComplementoResponsavel(dto.complementoResponsavel());
        r.setBairroResponsavel(dto.bairroResponsavel());
        r.setCidadeResponsavel(dto.cidadeResponsavel());
        return r;
    }

    public static ResponsavelDtos.ResponsavelResponse toDto(Responsavel r) {
        return new ResponsavelDtos.ResponsavelResponse(
                r.getId(),
                r.getNomeResponsavel(),
                r.getRgResponsavel(),
                r.getCpfResponsavel(),
                r.getCondicaoResponsavel(),
                r.getEnderecoResponsavel(),
                r.getComplementoResponsavel(),
                r.getBairroResponsavel(),
                r.getCidadeResponsavel()
        );
    }

    public static Testemunha toEntity(TestemunhaDtos.TestemunhaRequest dto) {
        Testemunha t = new Testemunha();
        t.setNomeTestemunha(dto.nomeTestemunha());
        t.setResidenciaTestemunha(dto.residenciaTestemunha());
        t.setDocumentoTestemunha(dto.documentoTestemunha());
        return t;
    }

    public static TestemunhaDtos.TestemunhaResponse toDto(Testemunha t) {
        return new TestemunhaDtos.TestemunhaResponse(
                t.getId(),
                t.getNomeTestemunha(),
                t.getResidenciaTestemunha(),
                t.getDocumentoTestemunha()
        );
    }

    public static MenorEnvolvido toEntity(MenorEnvolvidoDtos.MenorEnvolvidoRequest dto) {
        MenorEnvolvido m = new MenorEnvolvido();
        m.setNomeMenor(dto.nomeMenor());
        m.setDataNascimentoMenor(dto.dataNascimentoMenor());
        m.setDocumentoMenor(dto.documentoMenor());
        m.setFiliacaoMenor(dto.filiacaoMenor());
        m.setResidenciaMenor(dto.residenciaMenor());
        return m;
    }
}
