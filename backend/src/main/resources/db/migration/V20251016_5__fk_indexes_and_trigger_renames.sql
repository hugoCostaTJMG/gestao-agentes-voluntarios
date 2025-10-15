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
  BEGIN
    v_equiv := has_index_on(p_table, p_cols);
    IF v_equiv = 0 THEN
      SELECT COUNT(*) INTO v_name FROM user_indexes WHERE index_name = UPPER(p_idx);
      IF v_name = 0 THEN
        v_sql := 'CREATE INDEX '||UPPER(p_idx)||' ON '||UPPER(p_table)||'('||p_cols||')';
        EXECUTE IMMEDIATE v_sql;
      END IF;
    END IF;
  END;
BEGIN
  -- AGENTE_COMARCA (AGENTE_ID, COMARCA_ID)
  ensure_idx('AGENTE_COMARCA','I_FK_AGC_AGV01','AGENTE_ID');
  ensure_idx('AGENTE_COMARCA','I_FK_AGC_COM01','COMARCA_ID');

  -- AGENTE_AREA_ATUACAO (ID_AGENTE, ID_AREA_ATUACAO)
  ensure_idx('AGENTE_AREA_ATUACAO','I_FK_AAA_AGV01','ID_AGENTE');
  ensure_idx('AGENTE_AREA_ATUACAO','I_FK_AAA_AAT01','ID_AREA_ATUACAO');

  -- CREDENCIAL (ID_AGENTE)
  ensure_idx('CREDENCIAL','I_FK_CRE_AGV01','ID_AGENTE');

  -- AUTO_INFRACAO (ID_ESTABELECIMENTO, ID_RESPONSAVEL)
  ensure_idx('AUTO_INFRACAO','I_FK_AIN_EST01','ID_ESTABELECIMENTO');
  ensure_idx('AUTO_INFRACAO','I_FK_AIN_RES01','ID_RESPONSAVEL');

  -- MENOR_ENVOLVIDO -> AUTO_INFRACAO (campo numérico AUTO_INFRACAO_ID, mesmo sem FK formal)
  ensure_idx('MENOR_ENVOLVIDO','I_FK_MEN_AIN01','AUTO_INFRACAO_ID');

  -- AUTO_INFRACAO_TESTEMUNHA (AUTO_ID, TESTEMUNHA_ID)
  ensure_idx('AUTO_INFRACAO_TESTEMUNHA','I_FK_AIT_AIN01','AUTO_ID');
  ensure_idx('AUTO_INFRACAO_TESTEMUNHA','I_FK_AIT_TES01','TESTEMUNHA_ID');

  -- ANEXO_AUTO_INFRACAO (AUTO_INFRACAO_ID)
  ensure_idx('ANEXO_AUTO_INFRACAO','I_FK_ANX_AIN01','AUTO_INFRACAO_ID');

  -- LOG_AUDITORIA_AUTO_INFRACAO (AUTO_INFRACAO_ID)
  ensure_idx('LOG_AUDITORIA_AUTO_INFRACAO','I_FK_LAI_AIN01','AUTO_INFRACAO_ID');
END;
/

-- (Opcional e seguro) Desabilitar triggers antigas de geração de ID, se existirem, 
-- para evitar duplicidade funcional quando você migrar as "tabelas grandes" no futuro.
-- Atualmente, só padronizamos nas tabelas N:N no arquivo anterior.
