Guia de Nomenclatura e Padrões

Objetivo: padronizar nomes de variáveis, métodos, serviços e componentes para melhorar clareza e manutenção.

Java (Backend)
- Classes: PascalCase (AgenteVoluntarioService, CarteirinhaController)
- Métodos: camelCase com verbo claro (cadastrarAgente, buscarPorCpf, gerarPdf)
- Variáveis: camelCase descritivo (agente, credencial, templateContext)
- Constantes: UPPER_SNAKE_CASE (DATE_FORMATTER)
- Evite abreviações curtas (ag, cred, ctx). Prefira nomes completos: agente, credencial, templateContext.
- Utilitários de domínio: nomes objetivos (DocumentoUtil: cleanDigits, isValidCPF, isValidCNPJ)
- Exceções e mensagens: claras e direcionadas ao campo ("CPF inválido", "CNPJ do autuado inválido").

TypeScript/Angular (Frontend)
- Componentes/Serviços: PascalCase (CarteirinhaComponent, ApiService)
- Propriedades/Variáveis: camelCase descritivo (apiService, idUsuarioLogado, autoCriado)
- Métodos: camelCase com verbo (carregarDadosAgente, verificarStatus, salvar)
- Evite siglas não óbvias (cs, ag, a). Prefira (comarcas, agente, autoCriado).
- Form Controls: use nomes do domínio (cpfCnpjAutuado, dataInfracao)
- Mensagens de validação: curtas e específicas ("CPF/CNPJ inválido").

Diretrizes gerais
- Nomes explicam o propósito sem comentários supérfluos.
- Preferir Português consistente com o domínio do sistema.
- Evitar misturar idiomas no mesmo contexto.
- Funções utilitárias devem ter nomes autoexplicativos.

Exemplos aplicados neste repo
- service -> carteirinhaService
- v -> verificacao
- opt/credOpt -> agenteOptional/credencialOptional
- ctx -> templateContext
- padNumero -> formatarNumeroComQuatroDigitos
- formatCpf -> formatarCpf
- api -> apiService; a -> autoCriado; cs -> comarcas

