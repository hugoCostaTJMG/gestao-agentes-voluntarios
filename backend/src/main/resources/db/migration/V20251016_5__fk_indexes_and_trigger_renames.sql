-- V20251016_5__fk_indexes_and_trigger_renames.sql
-- Cria índices explícitos para FKs e prepara terreno para padronização de triggers
-- Observação: criamos somente para FKs existentes (ou recém-criadas no passo 4)

-- Helper idempotente: só cria se não existir índice equivalente (mesma lista de colunas, mesma ordem)
DECLARE
  FUNCTION has_index_on(p_table IN VARCHAR2, p_cols IN VARCHAR2) RETURN NUMBER IS
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT UPPER(uic.table_name) AS table_name,
               LISTAGG(UPPER(uic.column_name), ',') WITHIN GROUP (ORDER BY uic.column_position) AS cols
          FROM user_ind_columns uic
         GROUP BY uic.table_name, uic.index_name
      )
     WHERE table_name = UPPER(p_table)
       AND REPLACE(cols,' ') = REPLACE(UPPER(p_cols),' ');
    RETURN CASE WHEN v_count > 0 THEN 1 ELSE 0 END;
  END;

  PROCEDURE ensure_idx(p_table IN VARCHAR2, p_idx IN VARCHAR2, p_cols IN VARCHAR2) IS
    v_equiv NUMBER;
    v_name  NUMBER;
    v_sql   VARCHAR2(4000);
    v_tbl   NUMBER;
    v_col   NUMBER;
    v_cols_to_use VARCHAR2(400);
  BEGIN
    -- Guard: if table doesn't exist, skip to avoid ORA-00942
    SELECT COUNT(*) INTO v_tbl FROM user_tables WHERE table_name = UPPER(p_table);
    IF v_tbl = 0 THEN RETURN; END IF;

    -- Choose the actual column(s) present. Handles known renames.
    v_cols_to_use := UPPER(TRIM(p_cols));
    SELECT COUNT(*) INTO v_col FROM user_tab_cols WHERE table_name = UPPER(p_table) AND column_name = v_cols_to_use;
    IF v_col = 0 THEN
      -- Known alternates
      IF UPPER(p_table) = 'AUTO_INFRACAO_TESTEMUNHA' AND v_cols_to_use = 'AUTO_INFRACAO_ID' THEN
        SELECT COUNT(*) INTO v_col FROM user_tab_cols WHERE table_name = 'AUTO_INFRACAO_TESTEMUNHA' AND column_name = 'AUTO_ID';
        IF v_col > 0 THEN v_cols_to_use := 'AUTO_ID'; ELSE RETURN; END IF;
      ELSIF UPPER(p_table) = 'CREDENCIAL' AND v_cols_to_use = 'AGENTE_ID' THEN
        SELECT COUNT(*) INTO v_col FROM user_tab_cols WHERE table_name = 'CREDENCIAL' AND column_name = 'ID_AGENTE';
        IF v_col > 0 THEN v_cols_to_use := 'ID_AGENTE'; ELSE RETURN; END IF;
      ELSE
        RETURN; -- Column(s) not found; skip
      END IF;
    END IF;

    v_equiv := has_index_on(p_table, v_cols_to_use);
    IF v_equiv = 0 THEN
      SELECT COUNT(*) INTO v_name FROM user_indexes WHERE index_name = UPPER(p_idx);
      IF v_name = 0 THEN
        v_sql := 'CREATE INDEX '||UPPER(p_idx)||' ON '||UPPER(p_table)||'('||v_cols_to_use||')';
        EXECUTE IMMEDIATE v_sql;
      END IF;
    END IF;
  END;
BEGIN
  -- AGENTE_COMARCA (AGENTE_ID, COMARCA_ID)
  ensure_idx('AGENTE_COMARCA','I_FK_AGCO_AGVO01','AGENTE_ID');
  ensure_idx('AGENTE_COMARCA','I_FK_AGCO_COMA01','COMARCA_ID');

  -- AGENTE_AREA_ATUACAO (AGENTE_ID, AREA_ATUACAO_ID)
  ensure_idx('AGENTE_AREA_ATUACAO','I_FK_AGAA_AGVO01','AGENTE_ID');
  ensure_idx('AGENTE_AREA_ATUACAO','I_FK_AGAA_ARAT01','AREA_ATUACAO_ID');

  -- CREDENCIAL (AGENTE_ID)
  ensure_idx('CREDENCIAL','I_FK_CRED_AGVO01','AGENTE_ID');

  -- AUTO_INFRACAO (ESTABELECIMENTO_ID, RESPONSAVEL_ID)
  ensure_idx('AUTO_INFRACAO','I_FK_AIN_EST01','ESTABELECIMENTO_ID');
  ensure_idx('AUTO_INFRACAO','I_FK_AIN_RES01','RESPONSAVEL_ID');

  -- MENOR_ENVOLVIDO -> AUTO_INFRACAO (campo numérico AUTO_INFRACAO_ID, mesmo sem FK formal)
  ensure_idx('MENOR_ENVOLVIDO','I_FK_MEN_AIN01','AUTO_INFRACAO_ID');

  -- AUTO_INFRACAO_TESTEMUNHA (AUTO_INFRACAO_ID, TESTEMUNHA_ID)
  ensure_idx('AUTO_INFRACAO_TESTEMUNHA','I_FK_AIT_AUTO01','AUTO_INFRACAO_ID');
  ensure_idx('AUTO_INFRACAO_TESTEMUNHA','I_FK_AIT_TEST01','TESTEMUNHA_ID');

  -- ANEXO_AUTO_INFRACAO (AUTO_INFRACAO_ID)
  ensure_idx('ANEXO_AUTO_INFRACAO','I_FK_ANX_AIN01','AUTO_INFRACAO_ID');

  -- LOG_AUDITORIA_AUTO_INFRACAO (AUTO_INFRACAO_ID)
  ensure_idx('LOG_AUDITORIA_AUTO_INFRACAO','I_FK_LAI_AIN01','AUTO_INFRACAO_ID');
END;
/

-- (Opcional e seguro) Desabilitar triggers antigas de geração de ID, se existirem, 
-- para evitar duplicidade funcional quando você migrar as "tabelas grandes" no futuro.
-- Atualmente, só padronizamos nas tabelas N:N no arquivo anterior.
