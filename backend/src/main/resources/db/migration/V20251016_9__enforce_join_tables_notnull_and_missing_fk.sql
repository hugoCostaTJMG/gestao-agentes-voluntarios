-- V20251016_9__enforce_join_tables_notnull_and_missing_fk.sql
-- Purpose: Move adjustments that were previously embedded in V20251016_4
--          to a separate, idempotent hardening step:
--          - Ensure ID columns are NOT NULL on join tables
--          - Add missing FK AUTO_INFRACAO_TESTEMUNHA.AUTO_ID -> AUTO_INFRACAO(ID) if absent

-- =============================
-- Ensure NOT NULL on ID (join tables)
-- =============================
BEGIN
  FOR t IN (
    SELECT 'AGENTE_COMARCA' AS tn FROM dual
    UNION ALL SELECT 'AGENTE_AREA_ATUACAO' FROM dual
    UNION ALL SELECT 'AUTO_INFRACAO_TESTEMUNHA' FROM dual
  ) LOOP
    BEGIN
      EXECUTE IMMEDIATE 'ALTER TABLE '||t.tn||' MODIFY (ID NOT NULL)';
    EXCEPTION WHEN OTHERS THEN
      -- ORA-01442: column to be modified to NOT NULL is already NOT NULL
      IF SQLCODE != -1442 THEN RAISE; END IF;
    END;
  END LOOP;
END;
/

-- =============================
-- Add missing FK AIT.AUTO_ID -> AUTO_INFRACAO(ID) if none exists
-- (checks by relationship, not only by name)
-- =============================
DECLARE
  v_cnt NUMBER := 0;
  v_ref_type VARCHAR2(30);
  v_col_type VARCHAR2(30);
BEGIN
  -- Only create FK if both columns are NUMBER-typed and no existing equivalent FK
  SELECT data_type INTO v_ref_type
    FROM user_tab_cols
   WHERE table_name = 'AUTO_INFRACAO' AND column_name = 'ID';
  SELECT data_type INTO v_col_type
    FROM user_tab_cols
   WHERE table_name = 'AUTO_INFRACAO_TESTEMUNHA' AND column_name = 'AUTO_ID';

  IF v_ref_type = 'NUMBER' AND v_col_type = 'NUMBER' THEN
    SELECT COUNT(*) INTO v_cnt
    FROM user_constraints uc
    JOIN user_cons_columns ucc
      ON ucc.constraint_name = uc.constraint_name
     AND ucc.table_name      = uc.table_name
    JOIN user_constraints rc
      ON rc.constraint_name  = uc.r_constraint_name
    WHERE uc.table_name      = 'AUTO_INFRACAO_TESTEMUNHA'
      AND uc.constraint_type = 'R'
      AND ucc.column_name    = 'AUTO_ID'
      AND rc.table_name      = 'AUTO_INFRACAO'
      AND rc.constraint_type IN ('P','U');

    IF v_cnt = 0 THEN
      EXECUTE IMMEDIATE 'ALTER TABLE AUTO_INFRACAO_TESTEMUNHA
                         ADD CONSTRAINT FK_AIT_AIN01
                         FOREIGN KEY (AUTO_ID) REFERENCES AUTO_INFRACAO(ID)';
    END IF;
  END IF;
END;
/
