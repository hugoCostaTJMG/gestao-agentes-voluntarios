-- V20251016_6__fk_indexes_and_trigger_renames_fix.sql
-- Correção de ORA-01408 criando índices de FK apenas quando não existe
-- índice equivalente (mesma lista de colunas, mesma ordem), e evitando colisão de nome.

DECLARE
  -- Retorna 1 se já existir índice (em qualquer nome) com a MESMA lista de colunas (ordem idêntica) na tabela.
  FUNCTION has_index_on(p_table IN VARCHAR2, p_cols IN VARCHAR2) RETURN NUMBER IS
    v_count NUMBER;
  BEGIN
    -- p_cols deve vir como 'COL_A,COL_B' sem espaços.
    SELECT COUNT(*)
      INTO v_count
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

  -- Garante índice para FK (single-column neste projeto): cria só se não houver equivalente; também evita nome duplicado.
  PROCEDURE ensure_fk_idx(p_table IN VARCHAR2, p_idx IN VARCHAR2, p_cols IN VARCHAR2) IS
    v_equiv_exists NUMBER;
    v_name_exists  NUMBER;
    v_sql          VARCHAR2(4000);
  BEGIN
    v_equiv_exists := has_index_on(p_table, p_cols);
    IF v_equiv_exists = 0 THEN
      SELECT COUNT(*) INTO v_name_exists FROM user_indexes WHERE index_name = UPPER(p_idx);
      IF v_name_exists = 0 THEN
        v_sql := 'CREATE INDEX '||UPPER(p_idx)||' ON '||UPPER(p_table)||'('||p_cols||')';
        EXECUTE IMMEDIATE v_sql;
      END IF;
    END IF;
  END;
BEGIN
  -- AGENTE_COMARCA
  ensure_fk_idx('AGENTE_COMARCA', 'I_FK_AGCO_AGVO01', 'AGENTE_ID');
  ensure_fk_idx('AGENTE_COMARCA', 'I_FK_AGCO_COMA01', 'COMARCA_ID');

  -- AGENTE_AREA_ATUACAO
  ensure_fk_idx('AGENTE_AREA_ATUACAO', 'I_FK_AGAA_AGVO01', 'AGENTE_ID');
  ensure_fk_idx('AGENTE_AREA_ATUACAO', 'I_FK_AGAA_ARAT01', 'AREA_ATUACAO_ID');

  -- CREDENCIAL
  ensure_fk_idx('CREDENCIAL', 'I_FK_CRED_AGVO01', 'AGENTE_ID');

  -- AUTO_INFRACAO
  ensure_fk_idx('AUTO_INFRACAO', 'I_FK_AIN_EST01', 'ESTABELECIMENTO_ID');
  ensure_fk_idx('AUTO_INFRACAO', 'I_FK_AIN_RES01', 'RESPONSAVEL_ID');

  -- MENOR_ENVOLVIDO
  ensure_fk_idx('MENOR_ENVOLVIDO', 'I_FK_MEN_AIN01', 'AUTO_INFRACAO_ID');

  -- AUTO_INFRACAO_TESTEMUNHA
  ensure_fk_idx('AUTO_INFRACAO_TESTEMUNHA', 'I_FK_AIT_AUTO01', 'AUTO_INFRACAO_ID');
  ensure_fk_idx('AUTO_INFRACAO_TESTEMUNHA', 'I_FK_AIT_TEST01', 'TESTEMUNHA_ID');

  -- ANEXO_AUTO_INFRACAO
  ensure_fk_idx('ANEXO_AUTO_INFRACAO', 'I_FK_ANX_AIN01', 'AUTO_INFRACAO_ID');

  -- LOG_AUDITORIA_AUTO_INFRACAO
  ensure_fk_idx('LOG_AUDITORIA_AUTO_INFRACAO', 'I_FK_LAI_AIN01', 'AUTO_INFRACAO_ID');
END;
/

DECLARE
  PROCEDURE recreate_bir_trigger(p_table IN VARCHAR2, p_sequence IN VARCHAR2, p_trigger IN VARCHAR2) IS
    v_cnt NUMBER;
    v_sql VARCHAR2(32767);
  BEGIN
    -- Se a tabela não possuir coluna ID, nada a fazer.
    SELECT COUNT(*) INTO v_cnt
      FROM user_tab_cols
     WHERE table_name = UPPER(p_table)
       AND column_name = 'ID';
    IF v_cnt = 0 THEN
      RETURN;
    END IF;

    -- Remove qualquer trigger BEFORE INSERT ROW existente para evitar colisões.
    FOR trg IN (
      SELECT trigger_name
        FROM user_triggers
       WHERE table_name = UPPER(p_table)
         AND trigger_type = 'BEFORE EACH ROW'
         AND triggering_event LIKE '%INSERT%'
    ) LOOP
      EXECUTE IMMEDIATE 'DROP TRIGGER '||trg.trigger_name;
    END LOOP;

    -- Só recria a trigger caso a sequence exista.
    SELECT COUNT(*) INTO v_cnt FROM user_sequences WHERE sequence_name = UPPER(p_sequence);
    IF v_cnt = 0 THEN
      RETURN;
    END IF;

    v_sql := 'CREATE OR REPLACE TRIGGER '||UPPER(p_trigger)||CHR(10)||
             'BEFORE INSERT ON '||UPPER(p_table)||CHR(10)||
             'FOR EACH ROW'||CHR(10)||
             'BEGIN'||CHR(10)||
             '  IF :NEW.ID IS NULL THEN'||CHR(10)||
             '    :NEW.ID := '||UPPER(p_sequence)||'.NEXTVAL;'||CHR(10)||
             '  END IF;'||CHR(10)||
             'END;';
    EXECUTE IMMEDIATE v_sql;
  END;
BEGIN
  recreate_bir_trigger('AGENTE_VOLUNTARIO','S_AGENTE_VOLUNTARIO','TR_BIR_AGV01');
  recreate_bir_trigger('COMARCA','S_COMARCA','TR_BIR_COM01');
  recreate_bir_trigger('AREA_ATUACAO','S_AREA_ATUACAO','TR_BIR_AAT01');
  recreate_bir_trigger('AGENTE_COMARCA','S_AGENTE_COMARCA','TR_BIR_AGC01');
  recreate_bir_trigger('AGENTE_AREA_ATUACAO','S_AGENTE_AREA_ATUACAO','TR_BIR_AAA01');
  recreate_bir_trigger('CREDENCIAL','S_CREDENCIAL','TR_BIR_CRE01');
  recreate_bir_trigger('LOG_AUDITORIA','S_LOG_AUDITORIA','TR_BIR_LOG01');
  recreate_bir_trigger('AUTO_INFRACAO','S_AUTO_INFRACAO','TR_BIR_AIN01');
  recreate_bir_trigger('ANEXO_AUTO_INFRACAO','S_ANEXO_AUTO','TR_BIR_ANX01');
  recreate_bir_trigger('ESTABELECIMENTO','S_ESTABELECIMENTO','TR_BIR_EST01');
  recreate_bir_trigger('RESPONSAVEL','S_RESPONSAVEL','TR_BIR_RES01');
  recreate_bir_trigger('MENOR_ENVOLVIDO','S_MENOR_ENVOLVIDO','TR_BIR_MEN01');
  recreate_bir_trigger('TESTEMUNHA','S_TESTEMUNHA','TR_BIR_TES01');
  recreate_bir_trigger('LOG_AUDITORIA_AUTO_INFRACAO','S_LOG_AUDITORIA_AUTO_INFRACAO','TR_BIR_LAI01');
  recreate_bir_trigger('AUTO_INFRACAO_TESTEMUNHA','S_AUTO_INFRACAO_TESTEMUNHA','TR_BIR_AIT01');
END;
/

