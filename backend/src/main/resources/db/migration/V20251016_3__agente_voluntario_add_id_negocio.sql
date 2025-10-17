-- Add optional business identifier column on AGENTE_VOLUNTARIO
-- Idempotent and guarded: only runs if table exists and column is missing
DECLARE
  v_tbl   INTEGER;
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_tbl FROM USER_TABLES WHERE TABLE_NAME = 'AGENTE_VOLUNTARIO';
  IF v_tbl > 0 THEN
    SELECT COUNT(*) INTO v_count FROM USER_TAB_COLS
     WHERE TABLE_NAME = 'AGENTE_VOLUNTARIO' AND COLUMN_NAME = 'ID_AGENTE_NEGOCIO';
    IF v_count = 0 THEN
      EXECUTE IMMEDIATE 'ALTER TABLE AGENTE_VOLUNTARIO ADD (ID_AGENTE_NEGOCIO VARCHAR2(255))';
    END IF;
  END IF;
END;
/
