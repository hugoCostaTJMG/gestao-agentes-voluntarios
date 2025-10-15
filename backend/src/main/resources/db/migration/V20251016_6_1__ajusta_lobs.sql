-- V20251016_6__ajusta_lobs.sql
-- Ajusta LOBs para DISABLE STORAGE IN ROW e nomes padronizados de índice de LOB (sem trocar tablespace)

-- helper: move LOB se estiver IN ROW e/ou sem nomes padronizados
DECLARE
  PROCEDURE move_lob(p_table IN VARCHAR2, p_col IN VARCHAR2, p_lobseg IN VARCHAR2, p_lobidx IN VARCHAR2) IS
    v_inrow  VARCHAR2(3);
    v_exists NUMBER;
    v_sql    VARCHAR2(4000);
  BEGIN
    -- checa se LOB existe
    SELECT COUNT(*) INTO v_exists
    FROM user_lobs
    WHERE table_name = p_table AND column_name = p_col;

    IF v_exists = 0 THEN
      RETURN;
    END IF;

    -- checa se está in-row
    SELECT IN_ROW INTO v_inrow
    FROM user_lobs
    WHERE table_name = p_table AND column_name = p_col;

    -- executa MOVE LOB para forçar DISABLE STORAGE IN ROW e index nomeado
    v_sql :=
      'ALTER TABLE '||p_table||' MOVE LOB ('||p_col||') STORE AS '||p_lobseg||' ('||
      ' DISABLE STORAGE IN ROW '||
      ' NOCACHE LOGGING '||
      ' INDEX '||p_lobidx||
      ' )';
    EXECUTE IMMEDIATE v_sql;
  EXCEPTION
    WHEN OTHERS THEN
      -- se já estiver com a configuração desejada, ignore; caso contrário, propague
      IF SQLCODE NOT IN (-14551, -1691) THEN
        NULL; -- tolerante para ambientes com storage já ajustado
      END IF;
  END;
BEGIN
  -- FOTO em AGENTE_VOLUNTARIO
  move_lob('AGENTE_VOLUNTARIO','FOTO','LOB_AGV_FOTO','LOB_AGV_FOTO_IDX');

  -- DETALHES em LOG_AUDITORIA
  move_lob('LOG_AUDITORIA','DETALHES','LOB_LOG_DETALHES','LOB_LOG_DETALHES_IDX');

  -- OBSERVACOES em AUTO_INFRACAO
  move_lob('AUTO_INFRACAO','OBSERVACOES','LOB_AIN_OBS','LOB_AIN_OBS_IDX');

  -- DETALHES em LOG_AUDITORIA_AUTO_INFRACAO
  move_lob('LOG_AUDITORIA_AUTO_INFRACAO','DETALHES','LOB_LAI_DETALHES','LOB_LAI_DETALHES_IDX');
END;
/

