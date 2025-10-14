# Migração DER Auto de Infração – 2025-10-14

Este documento resume as alterações aplicadas ao domínio de Autos de Infração, novas entidades e endpoints, além de instruções para validação em ambiente local.

## Resumo das mudanças

- Migration Flyway `V20251014__der_auto_infracao.sql`:
  - AUTO_INFRACAO: adicionados campos `ID_AUTO_INFRACAO` (string, único), `HORARIO_INFRACAO`, `COMARCA`, `NUMERO_CRIANCAS`, `NUMERO_ADOLESCENTES`, `FUNDAMENTO_LEGAL`, `ARTIGO_ECA`, `PORTARIA_N`, `NOME_COMISSARIO_AUTUANTE`, `MATRICULA_AUTUANTE`, `OBSERVACOES` (CLOB), `DATA_INTIMACAO`, `PRAZO_DEFESA`, `ID_ESTABELECIMENTO`, `ID_RESPONSAVEL` + índices e FKs.
  - ESTABELECIMENTO: ampliada estrutura para `NOME_ESTABELECIMENTO`, endereço completo; `CNPJ` com UNIQUE; `ID_ESTABELECIMENTO` convertido para VARCHAR2(255) quando aplicável.
  - RESPONSAVEL: novos campos conforme DER; `CPF_RESPONSAVEL` com UNIQUE; `ID_RESPONSAVEL` para VARCHAR2(255).
  - TESTEMUNHA: campos `NOME_TESTEMUNHA`, `RESIDENCIA_TESTEMUNHA`, `DOCUMENTO_TESTEMUNHA`; `ID_TESTEMUNHA` VARCHAR2(255).
  - MENOR_ENVOLVIDO: nova estrutura (inclui `ID_MENOR` VARCHAR2, `NOME_MENOR`, `DATA_NASCIMENTO_MENOR`, etc.) e coluna `ID_AUTO_INFRACAO` (string) + índice.
  - AUTO_INFRACAO_TESTEMUNHA: adicionadas colunas `ID_AUTO_INFRACAO` e `ID_TESTEMUNHA` (strings) + FKs.

- Entidades JPA:
  - Atualização de `AutoInfracao` para incluir os novos campos e relacionamentos:
    - `@ManyToOne` opcional para `Estabelecimento` e `Responsavel` via colunas `ID_ESTABELECIMENTO` e `ID_RESPONSAVEL`.
    - `@OneToMany` de `MenorEnvolvido` (mapeado por `ID_AUTO_INFRACAO`).
    - `@ManyToMany` com `Testemunha` via `AUTO_INFRACAO_TESTEMUNHA` (chaves string).
    - Campo `idAutoInfracao` (string, único) adicionado sem substituir o `id` numérico, mantendo compatibilidade.
  - Novas entidades: `Estabelecimento`, `Responsavel`, `MenorEnvolvido`, `Testemunha` (IDs String/UUID tratadas na camada de serviço).

- Repositórios: adicionados para as novas entidades e método `findByIdAutoInfracao` no `AutoInfracaoRepository`.

- Serviços:
  - Novos serviços CRUD para `Estabelecimento`, `Responsavel`, `Testemunha` com validação de unicidade (409/IllegalStateException).
  - `AutoInfracaoService` ajustado para:
    - Gerar `idAutoInfracao` (UUID) na criação.
    - Preencher `nomeComissarioAutuante`/`matriculaAutuante` a partir dos dados do agente.
    - Criar placeholders de `Estabelecimento`/`Responsavel` quando ausentes (compatibilidade com endpoint atual).
    - Métodos para incluir/remover `MenorEnvolvido` e associar/desassociar `Testemunha`.

- Controllers e DTOs:
  - Novos controllers: `/api/estabelecimentos`, `/api/responsaveis`, `/api/testemunhas` com DTOs de request/response.
  - `AutoInfracaoController` ganhou endpoints:
    - `POST /api/autos/{id}/menores` e `DELETE /api/autos/{id}/menores/{idMenor}`.
    - `POST /api/autos/{id}/testemunhas/{idTestemunha}` e `DELETE /api/autos/{id}/testemunhas/{idTestemunha}`.

- Testes:
  - `@DataJpaTest` simples para UNIQUE de CNPJ em `Estabelecimento`.
  - `@WebMvcTest` para validação 400 em `EstabelecimentoController` com payload inválido.

## Compatibilidade

- Não removemos colunas existentes nem alteramos o `id` numérico de `AUTO_INFRACAO`. Em vez disso, adicionamos `ID_AUTO_INFRACAO` (string, único) para novas FKs.
- Placeholders automáticos de `Estabelecimento` e `Responsavel` preservam o fluxo atual de criação de autos que não enviam esses dados.
- Futuro backfill: recomenda-se preencher `ID_ESTABELECIMENTO` e `ID_RESPONSAVEL` em `AUTO_INFRACAO` a partir de regras de negócio (quando disponíveis) e consolidar dados antigos de autuado.

## Como rodar a migration localmente

1. Suba Oracle XE via Docker (exemplo):
   - `docker run -d --name oraclexe -p 1521:1521 -e ORACLE_PWD=agentes_pass gvenzl/oracle-xe:21-slim`
2. Configure `.env` ou variáveis:
   - `ORACLE_DB_HOST=localhost`, `ORACLE_DB_PORT=1521`, `ORACLE_DB_SERVICE=XE`, `ORACLE_DB_USER=AGENTES`, `ORACLE_DB_PASSWORD=agentes_pass`, `ORACLE_DB_SCHEMA=AGENTES`.
3. Execute o backend; o Flyway aplicará `V20251014__der_auto_infracao.sql` automaticamente (baseline-on-migrate habilitado).

## Como executar testes

- `./mvnw -f backend/pom.xml test`
- Os testes usam H2; validações principais de JPA/Bean Validation rodam sem Oracle.

## Checklist de verificação

- [ ] Migration criada e aplicada com sucesso (`flyway_schema_history` atualizado)
- [ ] Entidades JPA mapeadas e validadas (campos refletindo o DER)
- [ ] Repositórios com queries úteis (CNPJ/CPF e ID string)
- [ ] Services com regras e transações (UUIDs + unicidade)
- [ ] Controllers com endpoints e validação (400/409)
- [ ] Testes passando (unitários e slices)
- [ ] README de migração atualizado (este documento)

