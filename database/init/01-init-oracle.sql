ALTER SESSION SET CONTAINER = XEPDB1;

SET ECHO ON
SET FEEDBACK ON
SET PAGESIZE 0
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- ===============================================================
-- 1) Usuário e permissões
--    (CREATE USER protegido para não falhar se já existir)
-- ===============================================================
DECLARE
  v_cnt NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_cnt FROM dba_users WHERE username = 'AGENTES_USER';
  IF v_cnt = 0 THEN
    EXECUTE IMMEDIATE 'CREATE USER agentes_user IDENTIFIED BY agentes_pass';
  END IF;
END;
/

-- Permissões básicas de objeto/sessão (necessárias para o Flyway criar o schema)
GRANT CREATE SESSION,
      CREATE TABLE, CREATE VIEW, CREATE SEQUENCE,
      CREATE PROCEDURE, CREATE TRIGGER, CREATE SYNONYM
TO agentes_user;

-- Scheduler (se necessário)
GRANT CREATE JOB, MANAGE SCHEDULER TO agentes_user;

-- Tablespace padrão e temporário
ALTER USER agentes_user DEFAULT TABLESPACE USERS;
ALTER USER agentes_user TEMPORARY TABLESPACE TEMP;

-- Quota no USERS (resolve ORA-01950)
ALTER USER agentes_user QUOTA UNLIMITED ON USERS;

-- Também concede privilégio global para evitar erros de quota (dev/contêiner)
GRANT UNLIMITED TABLESPACE TO agentes_user;

-- Garantir usuário desbloqueado
ALTER USER agentes_user ACCOUNT UNLOCK;

-- Importante: deixe a criação de objetos (tabelas, índices, gatilhos, seeds)
-- a cargo das migrações Flyway no backend (V1__init_agentes_schema.sql e afins).

COMMIT;
