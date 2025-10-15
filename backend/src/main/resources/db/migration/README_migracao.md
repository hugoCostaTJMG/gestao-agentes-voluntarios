# Migração Oracle + Flyway – Padronização TJMG (sem downtime)

Este pacote adiciona migrações Flyway idempotentes para alinhar o schema às diretrizes do TJMG, evitando downtime e sem ações destrutivas de dados.

## Escopo (tabelas)
- AGENTE_VOLUNTARIO, AREA_ATUACAO, AGENTE_AREA_ATUACAO, AGENTE_COMARCA, COMARCA, CREDENCIAL, AUTO_INFRACAO, ANEXO_AUTO_INFRACAO, LOG_AUDITORIA, LOG_AUDITORIA_AUTO_INFRACAO, MENOR_ENVOLVIDO, RESPONSAVEL, TESTEMUNHA, AUTO_INFRACAO_TESTEMUNHA.

## Estratégia aplicada
1) Surrogate key em tabelas com PK composta (apenas tabelas de junção): adição de `ID NUMBER(19)` + `S_<TABELA>` + trigger `TR_BIR_<ALIAS>01`, backfill de IDs e promoção de `ID` como PK, preservando unicidade de pares de negócio via `UNIQUE`.
2) Índices para FKs nomeados como `I_FK_<ALIAS>_<REF>nn`.
3) Triggers padronizadas foram criadas somente nas tabelas de junção. Não mexemos nas tabelas “grandes” que ainda usam PK `VARCHAR2`, para evitar colisão com o modelo atual.
4) LOBs: `DISABLE STORAGE IN ROW` (via MOVE LOB) e nomes padronizados de índice de LOB. Não alteramos tablespace.

Observação: não há remoção de colunas nem perda de dados. Trocas de PK ocorrem apenas nas tabelas de junção e não possuem FKs dependentes, minimizando risco. Não há definição de tablespace.

## Ordem de execução
1. `V20251016_4__add_id_number_and_sequences_join_tables.sql`
   - Adiciona `ID` + `SEQUENCE` + triggers e promove `ID` a PK em:
     - `AGENTE_COMARCA` (UNIQUE em `AGENTE_ID, COMARCA_ID`)
     - `AGENTE_AREA_ATUACAO` (UNIQUE em `ID_AGENTE, ID_AREA_ATUACAO`)
     - `AUTO_INFRACAO_TESTEMUNHA` (UNIQUE em `AUTO_ID, TESTEMUNHA_ID`)
   - Índices básicos de FK (serão reforçados no passo 2).

2. `V20251016_5__fk_indexes_and_trigger_renames.sql`
   - Cria índices de FK explícitos seguindo `I_FK_<ALIAS>_<REF>nn` em FKs principais.
   - Não altera triggers das tabelas grandes; padronização de triggers ficou restrita às join tables no passo 1.

3. `V20251016_6__fk_indexes_and_trigger_renames_fix.sql`
   - Correção idempotente dos índices de FK para evitar ORA-01408/ORA-00955.

4. `V20251016_6_1__ajusta_lobs.sql`
   - Ajusta LOBs via `ALTER TABLE ... MOVE LOB ... (DISABLE STORAGE IN ROW INDEX <nome>)`, nomeando os segmentos/índices de LOB (sem trocar tablespace).

5. `V20251016_7__add_numeric_id_big_tables_and_parallel_fks.sql`
   - Adiciona `ID NUMBER(19)` + `SEQUENCE` + triggers `TR_BIR_*` nas tabelas grandes que ainda possam estar com PK `VARCHAR2(36)` (ESTABELECIMENTO, RESPONSAVEL, TESTEMUNHA, AUTO_INFRACAO, MENOR_ENVOLVIDO).
   - Garante colunas de negócio `*_ID_STR` e `UNIQUE` correspondentes.
   - Cria colunas numéricas e FKs paralelas nas tabelas filhas (AUTO_INFRACAO, MENOR_ENVOLVIDO, AUTO_INFRACAO_TESTEMUNHA, ANEXO_AUTO_INFRACAO, LOG_AUDITORIA_AUTO_INFRACAO), com backfill a partir das chaves string quando existirem.

6. `V20251016_8__promote_numeric_pk_and_cleanup_string_fks.sql`
7. `V20251016_9__enforce_join_tables_notnull_and_missing_fk.sql`
   - Garante `ID NOT NULL` nas tabelas de junção e cria, se ausente, a FK `AUTO_INFRACAO_TESTEMUNHA.AUTO_ID -> AUTO_INFRACAO(ID)` (nome `FK_AIT_AIN01`).
   - Remove FKs antigas baseadas em colunas string (se existirem) após a criação das FKs numéricas.
   - Promove `ID` a `PRIMARY KEY` nas tabelas grandes quando não houver mais FKs referenciando a PK antiga, mantendo `*_ID_STR` como `UNIQUE`.

## Breaking changes
Vazio (sem perda de dados). As mudanças de PK ocorrem apenas nas tabelas de junção e preservam unicidade pela `UNIQUE` equivalente. Não há impacto em FKs (não existem FKs apontando para estas tabelas).

## Verificação pós-deploy (consultas)

Execute no schema alvo (ajuste OWNER conforme necessário):

-- PKs (join tables devem ter PK=ID)  
SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type='P' AND table_name IN (
  'AGENTE_COMARCA','AGENTE_AREA_ATUACAO','AUTO_INFRACAO_TESTEMUNHA'
);

-- Unicidade por pares de negócio (join tables)
SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type='U' AND table_name IN (
  'AGENTE_COMARCA','AGENTE_AREA_ATUACAO','AUTO_INFRACAO_TESTEMUNHA'
);

-- Coluna ID presente e não nula nas join tables
SELECT table_name, column_name, nullable FROM user_tab_cols WHERE table_name IN (
  'AGENTE_COMARCA','AGENTE_AREA_ATUACAO','AUTO_INFRACAO_TESTEMUNHA'
) AND column_name='ID';

-- Sequências criadas
SELECT sequence_name FROM user_sequences WHERE sequence_name IN (
  'S_AGENTE_COMARCA','S_AGENTE_AREA_ATUACAO','S_AUTO_INFRACAO_TESTEMUNHA'
);

-- Triggers padronizadas TR_BIR_<ALIAS>01
SELECT trigger_name, table_name FROM user_triggers WHERE trigger_name IN (
  'TR_BIR_AGV01','TR_BIR_COM01','TR_BIR_AAT01','TR_BIR_CRE01','TR_BIR_LOG01',
  'TR_BIR_AIN01','TR_BIR_ANX01','TR_BIR_EST01','TR_BIR_RES01','TR_BIR_MEN01',
  'TR_BIR_TES01','TR_BIR_LAI01','TR_BIR_AGC01','TR_BIR_AAA01','TR_BIR_AIT01'
);

-- Índices de FK
SELECT index_name, table_name FROM user_indexes WHERE index_name IN (
  'I_FK_AGC_AGV01','I_FK_AGC_COM01','I_FK_AAA_AGV01','I_FK_AAA_AAT01',
  'I_FK_CRE_AGV01','I_FK_AIN_EST01','I_FK_AIN_RES01','I_FK_MEN_AIN01',
  'I_FK_AIT_AIN01','I_FK_AIT_TES01','I_FK_ANX_AIN01','I_FK_LAI_AIN01'
);

-- LOBs com DISABLE STORAGE IN ROW
SELECT table_name, column_name, in_row FROM user_lobs WHERE (table_name, column_name) IN (
  ('AGENTE_VOLUNTARIO','FOTO'),
  ('LOG_AUDITORIA','DETALHES'),
  ('AUTO_INFRACAO','OBSERVACOES'),
  ('LOG_AUDITORIA_AUTO_INFRACAO','DETALHES')
);

-- Índices de LOB renomeados
SELECT table_name, column_name, index_name FROM user_lobs WHERE (table_name, column_name) IN (
  ('AGENTE_VOLUNTARIO','FOTO'),
  ('LOG_AUDITORIA','DETALHES'),
  ('AUTO_INFRACAO','OBSERVACOES'),
  ('LOG_AUDITORIA_AUTO_INFRACAO','DETALHES')
);

## Notas de segurança
- Scripts são idempotentes: usam checagens em `USER_*` vistas e blocos PL/SQL protegidos.
- Não alteram tablespace nem criam `flyway_schema_history` manualmente.
- Em ambientes com validação de schema pelo Hibernate, não há impacto em entidades mapeadas diretamente (as alterações de PK são restritas às tabelas de junção, tipicamente não mapeadas como entidades independentes em JPA).

## Como usar
- Salve os arquivos exatamente com esses nomes na pasta do Flyway (`src/main/resources/db/migration/`).
- Faça um build e suba a aplicação; o Flyway aplicará as migrações pendentes na ordem.
- Rode as consultas de verificação acima para confirmar PK/FK/UK/índices/LOBs.
