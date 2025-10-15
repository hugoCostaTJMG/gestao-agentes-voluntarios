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
  ensure_fk_idx('AGENTE_COMARCA', 'I_FK_AGC_AGV01', 'AGENTE_ID');
  ensure_fk_idx('AGENTE_COMARCA', 'I_FK_AGC_COM01', 'COMARCA_ID');

  -- AGENTE_AREA_ATUACAO
  ensure_fk_idx('AGENTE_AREA_ATUACAO', 'I_FK_AAA_AGV01', 'ID_AGENTE');
  ensure_fk_idx('AGENTE_AREA_ATUACAO', 'I_FK_AAA_AAT01', 'ID_AREA_ATUACAO');

  -- CREDENCIAL
  ensure_fk_idx('CREDENCIAL', 'I_FK_CRE_AGV01', 'ID_AGENTE');

  -- AUTO_INFRACAO
  ensure_fk_idx('AUTO_INFRACAO', 'I_FK_AIN_EST01', 'ID_ESTABELECIMENTO');
  ensure_fk_idx('AUTO_INFRACAO', 'I_FK_AIN_RES01', 'ID_RESPONSAVEL');

  -- MENOR_ENVOLVIDO
  ensure_fk_idx('MENOR_ENVOLVIDO', 'I_FK_MEN_AIN01', 'AUTO_INFRACAO_ID');

  -- AUTO_INFRACAO_TESTEMUNHA
  ensure_fk_idx('AUTO_INFRACAO_TESTEMUNHA', 'I_FK_AIT_AIN01', 'AUTO_ID');
  ensure_fk_idx('AUTO_INFRACAO_TESTEMUNHA', 'I_FK_AIT_TES01', 'TESTEMUNHA_ID');

  -- ANEXO_AUTO_INFRACAO
  ensure_fk_idx('ANEXO_AUTO_INFRACAO', 'I_FK_ANX_AIN01', 'AUTO_INFRACAO_ID');

  -- LOG_AUDITORIA_AUTO_INFRACAO
  ensure_fk_idx('LOG_AUDITORIA_AUTO_INFRACAO', 'I_FK_LAI_AIN01', 'AUTO_INFRACAO_ID');
END;
/

