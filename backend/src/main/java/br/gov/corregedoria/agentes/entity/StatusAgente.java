package br.gov.corregedoria.agentes.entity;

public enum StatusAgente {
    EM_ANALISE("Em Análise"),
    ATIVO("Ativo"),
    INATIVO("Inativo"),
    QUADRO_RESERVA("Quadro de Reserva");

    private final String descricao;

    StatusAgente(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    @Override
    public String toString() {
        return descricao;
    }
}

