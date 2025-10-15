-- V20251016_8__promote_numeric_pk_and_cleanup_string_fks.sql
-- Promove PK numérica (ID) nas tabelas grandes e remove FKs antigas baseadas em colunas string,
-- mantendo *_ID_STR como UNIQUE. Idempotente e cuidadoso: só troca PK se não houver FKs referenciando a PK antiga.

-- =============================
-- Drop FKs antigas (string) após criarem-se as FKs numéricas paralelas (V20251016_7)
-- =============================

-- Helper: drop FK by child table + column
DECLARE
  PROCEDURE drop_fk_on_column(p_table IN VARCHAR2, p_column IN VARCHAR2) IS
  BEGIN
    FOR c IN (
      SELECT uc.constraint_name
      FROM user_constraints uc
      JOIN user_cons_columns ucc ON uc.constraint_name=ucc.constraint_name
      WHERE uc.constraint_type='R'
        AND ucc.table_name=UPPER(p_table)
        AND ucc.column_name=UPPER(p_column)
    ) LOOP
      BEGIN EXECUTE IMMEDIATE 'ALTER TABLE '||p_table||' DROP CONSTRAINT '||c.constraint_name; EXCEPTION WHEN OTHERS THEN NULL; END;
    END LOOP;
  END;
BEGIN
  -- AUTO_INFRACAO: antigas FKs por strings (se existirem)
  drop_fk_on_column('AUTO_INFRACAO','ID_ESTABELECIMENTO');
  drop_fk_on_column('AUTO_INFRACAO','ID_RESPONSAVEL');
  -- MENOR_ENVOLVIDO
  drop_fk_on_column('MENOR_ENVOLVIDO','ID_AUTO_INFRACAO');
  -- AUTO_INFRACAO_TESTEMUNHA
  drop_fk_on_column('AUTO_INFRACAO_TESTEMUNHA','ID_AUTO_INFRACAO');
  drop_fk_on_column('AUTO_INFRACAO_TESTEMUNHA','ID_TESTEMUNHA');
  -- ANEXO_AUTO_INFRACAO
  drop_fk_on_column('ANEXO_AUTO_INFRACAO','ID_AUTO_INFRACAO');
  -- LOG_AUDITORIA_AUTO_INFRACAO
  drop_fk_on_column('LOG_AUDITORIA_AUTO_INFRACAO','ID_AUTO_INFRACAO');
END;
/

-- =============================
-- Promover PK(ID) nas tabelas alvo, se possível (sem FKs pendentes)
-- =============================

DECLARE
  PROCEDURE promote_pk_to_id(p_table IN VARCHAR2, p_business_col IN VARCHAR2, p_uk_name IN VARCHAR2) IS
    v_pk_name   VARCHAR2(128);
    v_pk_col    VARCHAR2(128);
    v_fk_ref    NUMBER;
    v_has_id    NUMBER;
  BEGIN
    -- Se não existir ID, aborta
    SELECT COUNT(*) INTO v_has_id FROM USER_TAB_COLS WHERE TABLE_NAME=UPPER(p_table) AND COLUMN_NAME='ID';
    IF v_has_id=0 THEN RETURN; END IF;

    -- Descobre PK atual e primeira coluna da PK
    SELECT uc.constraint_name INTO v_pk_name
    FROM user_constraints uc
    WHERE uc.table_name=UPPER(p_table) AND uc.constraint_type='P';

    SELECT column_name INTO v_pk_col FROM user_cons_columns WHERE constraint_name=v_pk_name AND table_name=UPPER(p_table) AND position=1;

    -- Se já é ID, nada a fazer
    IF UPPER(v_pk_col)='ID' THEN RETURN; END IF;

    -- Garante UNIQUE na business key
    BEGIN EXECUTE IMMEDIATE 'ALTER TABLE '||p_table||' ADD CONSTRAINT '||p_uk_name||' UNIQUE ('||p_business_col||')'; EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Verifica FKs que referenciam a PK antiga
    SELECT COUNT(*) INTO v_fk_ref FROM user_constraints WHERE constraint_type='R' AND r_constraint_name = v_pk_name;

    IF v_fk_ref=0 THEN
      -- Tenta tornar ID NOT NULL
      BEGIN EXECUTE IMMEDIATE 'ALTER TABLE '||p_table||' MODIFY (ID NOT NULL)'; EXCEPTION WHEN OTHERS THEN NULL; END;
      -- Troca PK
      BEGIN EXECUTE IMMEDIATE 'ALTER TABLE '||p_table||' DROP CONSTRAINT '||v_pk_name; EXCEPTION WHEN OTHERS THEN NULL; END;
      EXECUTE IMMEDIATE 'ALTER TABLE '||p_table||' ADD CONSTRAINT PK_'||SUBSTR(p_table,1,26)||' PRIMARY KEY (ID)';
    END IF;
  EXCEPTION WHEN NO_DATA_FOUND THEN NULL; WHEN OTHERS THEN NULL; END;
BEGIN
  promote_pk_to_id('ESTABELECIMENTO','ID_ESTABELECIMENTO_STR','UK_ESTAB_IDSTR');
  promote_pk_to_id('RESPONSAVEL','ID_RESPONSAVEL_STR','UK_RESP_IDSTR');
  promote_pk_to_id('TESTEMUNHA','ID_TESTEMUNHA_STR','UK_TEST_IDSTR');
  promote_pk_to_id('AUTO_INFRACAO','ID_AUTO_INFRACAO_STR','UK_AUTO_IDSTR');
  promote_pk_to_id('MENOR_ENVOLVIDO','ID_MENOR_STR','UK_MENOR_IDSTR');
END;
/

