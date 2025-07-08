package br.gov.corregedoria.agentes.entity;

/**
 * Enum que representa os possíveis status de um Auto de Infração
 * 
 * RN011 - Edição de Rascunhos: Autos com status "Rascunho" podem ser editados por qualquer Agente
 * RN010 - Imutabilidade do Auto Registrado: Autos "Registrados" não podem ser excluídos
 * RN012 - Edição de Autos Registrados/Concluídos: Apenas Supervisor pode editar campos específicos
 * RN014 - Status de Cancelamento: Status "Cancelado" é irreversível
 */
public enum StatusAutoInfracao {
    
    /**
     * Auto de infração em elaboração, pode ser editado pelo agente criador
     */
    RASCUNHO("Rascunho"),
    
    /**
     * Auto de infração finalizado e registrado no sistema
     * Não pode ser excluído, apenas editado por Supervisor em campos específicos
     */
    REGISTRADO("Registrado"),
    
    /**
     * Auto de infração concluído
     * Apenas editável por Supervisor em campos específicos
     */
    CONCLUIDO("Concluído"),
    
    /**
     * Auto de infração cancelado
     * Status irreversível, apenas consulta permitida
     */
    CANCELADO("Cancelado");
    
    private final String descricao;
    
    StatusAutoInfracao(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    /**
     * Verifica se o status permite edição por agente comum
     */
    public boolean permiteEdicaoAgente() {
        return this == RASCUNHO;
    }
    
    /**
     * Verifica se o status permite edição por supervisor
     */
    public boolean permiteEdicaoSupervisor() {
        return this == RASCUNHO || this == REGISTRADO || this == CONCLUIDO;
    }
    
    /**
     * Verifica se o status permite cancelamento
     */
    public boolean permiteCancelamento() {
        return this == REGISTRADO || this == CONCLUIDO;
    }
    
    /**
     * Verifica se o auto pode ser excluído
     */
    public boolean permiteExclusao() {
        return this == RASCUNHO;
    }
}

