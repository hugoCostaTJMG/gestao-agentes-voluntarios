-- V20251016_5__fk_indexes_and_trigger_renames.sql
-- Cria índices explícitos para FKs e prepara terreno para padronização de triggers
-- Observação: criamos somente para FKs existentes (ou recém-criadas no passo 4)

-- helper: cria índice se não existir
DECLARE
  PROCEDURE ensure_idx(p_idx IN VARCHAR2, p_sql IN VARCHAR2) IS
    v_cnt NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_cnt FROM user_indexes WHERE index_name = p_idx;
    IF v_cnt = 0 THEN
      EXECUTE IMMEDIATE p_sql;
    END IF;
  END;
BEGIN
  -- AGENTE_COMARCA (AGENTE_ID, COMARCA_ID)
  ensure_idx('I_FK_AGC_AGV01', 'CREATE INDEX I_FK_AGC_AGV01 ON AGENTE_COMARCA(AGENTE_ID)');
  ensure_idx('I_FK_AGC_COM01', 'CREATE INDEX I_FK_AGC_COM01 ON AGENTE_COMARCA(COMARCA_ID)');

  -- AGENTE_AREA_ATUACAO (ID_AGENTE, ID_AREA_ATUACAO)
  ensure_idx('I_FK_AAA_AGV01', 'CREATE INDEX I_FK_AAA_AGV01 ON AGENTE_AREA_ATUACAO(ID_AGENTE)');
  ensure_idx('I_FK_AAA_AAT01', 'CREATE INDEX I_FK_AAA_AAT01 ON AGENTE_AREA_ATUACAO(ID_AREA_ATUACAO)');

  -- CREDENCIAL (ID_AGENTE)
  ensure_idx('I_FK_CRE_AGV01', 'CREATE INDEX I_FK_CRE_AGV01 ON CREDENCIAL(ID_AGENTE)');

  -- AUTO_INFRACAO (ID_ESTABELECIMENTO, ID_RESPONSAVEL)
  ensure_idx('I_FK_AIN_EST01', 'CREATE INDEX I_FK_AIN_EST01 ON AUTO_INFRACAO(ID_ESTABELECIMENTO)');
  ensure_idx('I_FK_AIN_RES01', 'CREATE INDEX I_FK_AIN_RES01 ON AUTO_INFRACAO(ID_RESPONSAVEL)');

  -- MENOR_ENVOLVIDO -> AUTO_INFRACAO (campo numérico AUTO_INFRACAO_ID, mesmo sem FK formal)
  ensure_idx('I_FK_MEN_AIN01', 'CREATE INDEX I_FK_MEN_AIN01 ON MENOR_ENVOLVIDO(AUTO_INFRACAO_ID)');

  -- AUTO_INFRACAO_TESTEMUNHA (AUTO_ID, TESTEMUNHA_ID)
  ensure_idx('I_FK_AIT_AIN01', 'CREATE INDEX I_FK_AIT_AIN01 ON AUTO_INFRACAO_TESTEMUNHA(AUTO_ID)');
  ensure_idx('I_FK_AIT_TES01', 'CREATE INDEX I_FK_AIT_TES01 ON AUTO_INFRACAO_TESTEMUNHA(TESTEMUNHA_ID)');

  -- ANEXO_AUTO_INFRACAO (AUTO_INFRACAO_ID)
  ensure_idx('I_FK_ANX_AIN01', 'CREATE INDEX I_FK_ANX_AIN01 ON ANEXO_AUTO_INFRACAO(AUTO_INFRACAO_ID)');

  -- LOG_AUDITORIA_AUTO_INFRACAO (AUTO_INFRACAO_ID)
  ensure_idx('I_FK_LAI_AIN01', 'CREATE INDEX I_FK_LAI_AIN01 ON LOG_AUDITORIA_AUTO_INFRACAO(AUTO_INFRACAO_ID)');
END;
/

-- (Opcional e seguro) Desabilitar triggers antigas de geração de ID, se existirem, 
-- para evitar duplicidade funcional quando você migrar as "tabelas grandes" no futuro.
-- Atualmente, só padronizamos nas tabelas N:N no arquivo anterior.

