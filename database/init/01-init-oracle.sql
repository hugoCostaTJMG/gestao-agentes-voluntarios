-- Script de inicialização do Oracle Database
-- Sistema de Gestão de Agentes Voluntários v2.0
-- Compatível com Oracle Cloud Infrastructure (OCI)

-- Garantir que os objetos sejam criados no PDB XEPDB1
ALTER SESSION SET CONTAINER = XEPDB1;
SET PAGESIZE 0;
SET FEEDBACK OFF;
SET ECHO ON;

-- Tablespaces exigidas pelo padrão TJMG
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLESPACE AGD01 DATAFILE ''AGD01.dbf'' SIZE 256M AUTOEXTEND ON NEXT 64M MAXSIZE UNLIMITED';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE <> -959 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLESPACE AGI01 DATAFILE ''AGI01.dbf'' SIZE 256M AUTOEXTEND ON NEXT 64M MAXSIZE UNLIMITED';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE <> -959 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLESPACE AGL01 DATAFILE ''AGL01.dbf'' SIZE 256M AUTOEXTEND ON NEXT 64M MAXSIZE UNLIMITED';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE <> -959 THEN
            RAISE;
        END IF;
END;
/

-- Usuário da aplicação
BEGIN
    EXECUTE IMMEDIATE 'CREATE USER agentes_user IDENTIFIED BY agentes_pass DEFAULT TABLESPACE AGD01 TEMPORARY TABLESPACE TEMP QUOTA UNLIMITED ON AGD01';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE <> -1920 THEN
            RAISE;
        END IF;
END;
/

ALTER USER agentes_user DEFAULT TABLESPACE AGD01;
ALTER USER agentes_user TEMPORARY TABLESPACE TEMP;
ALTER USER agentes_user QUOTA UNLIMITED ON AGD01;
ALTER USER agentes_user QUOTA UNLIMITED ON AGI01;
ALTER USER agentes_user QUOTA UNLIMITED ON AGL01;
GRANT CONNECT, RESOURCE, CREATE SESSION, CREATE TABLE, CREATE VIEW,
      CREATE PROCEDURE, CREATE TRIGGER, CREATE SYNONYM TO agentes_user;
GRANT CREATE JOB TO agentes_user;
GRANT MANAGE SCHEDULER TO agentes_user;

ALTER SESSION SET CURRENT_SCHEMA = agentes_user;
-- CONNECT agentes_user/agentes_pass@agentes-db_high;

-- Sequences (uma por tabela com PK técnica numérica)
CREATE SEQUENCE s_comarca START WITH 1 NOCACHE NOCYCLE;
CREATE SEQUENCE s_area_atuacao START WITH 1 NOCACHE NOCYCLE;
CREATE SEQUENCE s_agente_voluntario START WITH 1 NOCACHE NOCYCLE;
CREATE SEQUENCE s_credencial START WITH 1 NOCACHE NOCYCLE;
CREATE SEQUENCE s_auto_infracao START WITH 1 NOCACHE NOCYCLE;
CREATE SEQUENCE s_anexo_auto START WITH 1 NOCACHE NOCYCLE;
CREATE SEQUENCE s_log_auditoria START WITH 1 NOCACHE NOCYCLE;
CREATE SEQUENCE s_log_auto_auditoria START WITH 1 NOCACHE NOCYCLE;

-- Tabelas com chaves técnicas padronizadas
CREATE TABLE comarca
(
    id             NUMBER         NOT NULL,
    nome_comarca   VARCHAR2(255)  NOT NULL,
    CONSTRAINT pk_comarca PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT uk_comarca_nome UNIQUE (nome_comarca)
        USING INDEX TABLESPACE AGI01
) TABLESPACE AGD01;

CREATE TABLE area_atuacao
(
    id                NUMBER         NOT NULL,
    nome_area_atuacao VARCHAR2(255)  NOT NULL,
    CONSTRAINT pk_area_atuacao PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT uk_area_atuacao_nome UNIQUE (nome_area_atuacao)
        USING INDEX TABLESPACE AGI01
) TABLESPACE AGD01;

CREATE TABLE agente_voluntario
(
    id                          NUMBER        NOT NULL,
    id_agente_negocio           VARCHAR2(36),
    nome_completo               VARCHAR2(255) NOT NULL,
    cpf                         VARCHAR2(11)  NOT NULL,
    telefone                    VARCHAR2(20)  NOT NULL,
    email                       VARCHAR2(255) NOT NULL,
    foto                        BLOB,
    numero_carteira_identidade  VARCHAR2(20),
    data_expedicao_ci           DATE,
    nacionalidade               VARCHAR2(50),
    naturalidade                VARCHAR2(100),
    uf                          VARCHAR2(2),
    data_nascimento             DATE,
    filiacao_pai                VARCHAR2(255),
    filiacao_mae                VARCHAR2(255),
    data_cadastro               TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cadastro            VARCHAR2(100) NOT NULL,
    status                      VARCHAR2(20) DEFAULT 'EM_ANALISE' NOT NULL,
    disponibilidade             VARCHAR2(500),
    CONSTRAINT pk_agente_voluntario PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT uk_agente_voluntario_negocio UNIQUE (id_agente_negocio)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT uk_agente_voluntario_cpf UNIQUE (cpf)
        USING INDEX TABLESPACE AGI01
) TABLESPACE AGD01
  LOB (foto) STORE AS (
        TABLESPACE AGL01
        DISABLE STORAGE IN ROW
        NOCACHE
        LOGGING
        INDEX (TABLESPACE AGL01)
    );

CREATE TABLE credencial
(
    id               NUMBER        NOT NULL,
    agente_id        NUMBER        NOT NULL,
    data_emissao     TIMESTAMP     NOT NULL,
    qr_code_url      VARCHAR2(500) NOT NULL,
    usuario_emissao  VARCHAR2(100) NOT NULL,
    CONSTRAINT pk_credencial PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT fk_credencial_agente01 FOREIGN KEY (agente_id)
        REFERENCES agente_voluntario (id)
) TABLESPACE AGD01;
CREATE INDEX i_fk_credencial_agente01 ON credencial (agente_id)
    TABLESPACE AGI01;

CREATE TABLE auto_infracao
(
    id                         NUMBER        NOT NULL,
    id_auto_infracao_str       VARCHAR2(36)  NOT NULL,
    agente_id                  NUMBER        NOT NULL,
    nome_autuado               VARCHAR2(200) NOT NULL,
    cpf_cnpj_autuado           VARCHAR2(18)  NOT NULL,
    endereco_autuado           VARCHAR2(500) NOT NULL,
    contato_autuado            VARCHAR2(100) NOT NULL,
    nome_agente                VARCHAR2(200) NOT NULL,
    matricula_agente           VARCHAR2(50)  NOT NULL,
    comarca_id                 NUMBER        NOT NULL,
    base_legal                 VARCHAR2(1000) NOT NULL,
    data_infracao              DATE          NOT NULL,
    hora_infracao              TIMESTAMP     NOT NULL,
    local_infracao             VARCHAR2(500) NOT NULL,
    descricao_conduta          VARCHAR2(2000) NOT NULL,
    iniciais_crianca           VARCHAR2(10),
    idade_crianca              NUMBER(3),
    sexo_crianca               VARCHAR2(1),
    nome_testemunha            VARCHAR2(200),
    cpf_testemunha             VARCHAR2(14),
    assinatura_autuado         NUMBER(1),
    status                     VARCHAR2(20) DEFAULT 'RASCUNHO' NOT NULL,
    data_cadastro              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao           TIMESTAMP,
    usuario_cadastro           VARCHAR2(100) NOT NULL,
    usuario_atualizacao        VARCHAR2(100),
    data_cancelamento          TIMESTAMP,
    usuario_cancelamento       VARCHAR2(100),
    justificativa_cancelamento VARCHAR2(500),
    CONSTRAINT pk_auto_infracao PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT uk_auto_infracao_idstr UNIQUE (id_auto_infracao_str)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT fk_auto_infracao_agente01 FOREIGN KEY (agente_id)
        REFERENCES agente_voluntario (id),
    CONSTRAINT fk_auto_infracao_comarca01 FOREIGN KEY (comarca_id)
        REFERENCES comarca (id)
) TABLESPACE AGD01;
CREATE INDEX i_fk_auto_infracao_agente01 ON auto_infracao (agente_id)
    TABLESPACE AGI01;
CREATE INDEX i_fk_auto_infracao_comarca01 ON auto_infracao (comarca_id)
    TABLESPACE AGI01;
CREATE INDEX i_auto_infracao_status ON auto_infracao (status)
    TABLESPACE AGI01;
CREATE INDEX i_auto_infracao_data ON auto_infracao (data_infracao)
    TABLESPACE AGI01;
CREATE INDEX i_auto_infracao_autuado ON auto_infracao (nome_autuado)
    TABLESPACE AGI01;
CREATE INDEX i_auto_infracao_cpf_cnpj ON auto_infracao (cpf_cnpj_autuado)
    TABLESPACE AGI01;

CREATE TABLE anexo_auto_infracao
(
    id               NUMBER        NOT NULL,
    auto_infracao_id NUMBER        NOT NULL,
    nome_arquivo     VARCHAR2(255) NOT NULL,
    nome_original    VARCHAR2(255) NOT NULL,
    tipo_arquivo     VARCHAR2(100) NOT NULL,
    tamanho_arquivo  NUMBER(19)    NOT NULL,
    caminho_arquivo  VARCHAR2(500) NOT NULL,
    descricao        VARCHAR2(500),
    data_upload      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_upload   VARCHAR2(100) NOT NULL,
    CONSTRAINT pk_anexo_auto_infracao PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT fk_anexo_auto_infracao01 FOREIGN KEY (auto_infracao_id)
        REFERENCES auto_infracao (id)
) TABLESPACE AGD01;
CREATE INDEX i_fk_anexo_auto_infracao01 ON anexo_auto_infracao (auto_infracao_id)
    TABLESPACE AGI01;
CREATE INDEX i_anexo_auto_infracao_data ON anexo_auto_infracao (data_upload)
    TABLESPACE AGI01;

CREATE TABLE log_auditoria
(
    id             NUMBER        NOT NULL,
    data_hora      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario        VARCHAR2(100) NOT NULL,
    tipo_operacao  VARCHAR2(50)  NOT NULL,
    detalhes       CLOB,
    ip_origem      VARCHAR2(45),
    CONSTRAINT pk_log_auditoria PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01
) TABLESPACE AGD01
  LOB (detalhes) STORE AS (
        TABLESPACE AGL01
        DISABLE STORAGE IN ROW
        NOCACHE
        LOGGING
        INDEX (TABLESPACE AGL01)
    );
CREATE INDEX i_log_auditoria_usuario ON log_auditoria (usuario)
    TABLESPACE AGI01;
CREATE INDEX i_log_auditoria_data ON log_auditoria (data_hora)
    TABLESPACE AGI01;

CREATE TABLE log_auditoria_auto_infracao
(
    id                NUMBER        NOT NULL,
    auto_infracao_id  NUMBER        NOT NULL,
    tipo_operacao     VARCHAR2(50)  NOT NULL,
    usuario           VARCHAR2(100) NOT NULL,
    perfil_usuario    VARCHAR2(50),
    data_operacao     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    endereco_ip       VARCHAR2(100),
    detalhes          CLOB,
    justificativa     VARCHAR2(500),
    sucesso           NUMBER(1) DEFAULT 1,
    mensagem_erro     VARCHAR2(500),
    CONSTRAINT pk_log_auto_infracao PRIMARY KEY (id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT fk_log_auto_infracao01 FOREIGN KEY (auto_infracao_id)
        REFERENCES auto_infracao (id)
) TABLESPACE AGD01
  LOB (detalhes) STORE AS (
        TABLESPACE AGL01
        DISABLE STORAGE IN ROW
        NOCACHE
        LOGGING
        INDEX (TABLESPACE AGL01)
    );
CREATE INDEX i_fk_log_auto_infracao01 ON log_auditoria_auto_infracao (auto_infracao_id)
    TABLESPACE AGI01;
CREATE INDEX i_log_auto_infracao_usuario ON log_auditoria_auto_infracao (usuario)
    TABLESPACE AGI01;
CREATE INDEX i_log_auto_infracao_data ON log_auditoria_auto_infracao (data_operacao)
    TABLESPACE AGI01;

CREATE TABLE agente_comarca
(
    agente_id  NUMBER NOT NULL,
    comarca_id NUMBER NOT NULL,
    CONSTRAINT pk_agente_comarca PRIMARY KEY (agente_id, comarca_id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT fk_agente_comarca_agente01 FOREIGN KEY (agente_id)
        REFERENCES agente_voluntario (id),
    CONSTRAINT fk_agente_comarca_comarca01 FOREIGN KEY (comarca_id)
        REFERENCES comarca (id)
) TABLESPACE AGD01;
CREATE INDEX i_fk_agente_comarca_agente01 ON agente_comarca (agente_id)
    TABLESPACE AGI01;
CREATE INDEX i_fk_agente_comarca_comarca01 ON agente_comarca (comarca_id)
    TABLESPACE AGI01;

CREATE TABLE agente_area_atuacao
(
    agente_id       NUMBER NOT NULL,
    area_atuacao_id NUMBER NOT NULL,
    CONSTRAINT pk_agente_area_atuacao PRIMARY KEY (agente_id, area_atuacao_id)
        USING INDEX TABLESPACE AGI01,
    CONSTRAINT fk_agente_area_agente01 FOREIGN KEY (agente_id)
        REFERENCES agente_voluntario (id),
    CONSTRAINT fk_agente_area_area01 FOREIGN KEY (area_atuacao_id)
        REFERENCES area_atuacao (id)
) TABLESPACE AGD01;
CREATE INDEX i_fk_agente_area_agente01 ON agente_area_atuacao (agente_id)
    TABLESPACE AGI01;
CREATE INDEX i_fk_agente_area_area01 ON agente_area_atuacao (area_atuacao_id)
    TABLESPACE AGI01;

CREATE INDEX i_agente_voluntario_email ON agente_voluntario (email)
    TABLESPACE AGI01;
CREATE INDEX i_agente_voluntario_status ON agente_voluntario (status)
    TABLESPACE AGI01;
CREATE INDEX i_agente_voluntario_data_cadastro ON agente_voluntario (data_cadastro)
    TABLESPACE AGI01;

-- Dados iniciais
INSERT INTO comarca (id, nome_comarca) VALUES (s_comarca.NEXTVAL, 'Abaeté');
INSERT INTO comarca (id, nome_comarca) VALUES (s_comarca.NEXTVAL, 'Abre-Campo');

INSERT INTO area_atuacao (id, nome_area_atuacao)
  VALUES (s_area_atuacao.NEXTVAL, 'Proteção à Criança e Adolescente');
INSERT INTO area_atuacao (id, nome_area_atuacao)
  VALUES (s_area_atuacao.NEXTVAL, 'Educação e Ensino');

-- Triggers para preencher chaves técnicas
CREATE OR REPLACE TRIGGER tr_comarca_bi
BEFORE INSERT ON comarca
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_comarca.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER tr_area_atuacao_bi
BEFORE INSERT ON area_atuacao
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_area_atuacao.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER tr_agente_voluntario_bi
BEFORE INSERT ON agente_voluntario
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_agente_voluntario.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER tr_credencial_bi
BEFORE INSERT ON credencial
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_credencial.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER tr_auto_infracao_bi
BEFORE INSERT ON auto_infracao
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_auto_infracao.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER tr_anexo_auto_infracao_bi
BEFORE INSERT ON anexo_auto_infracao
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_anexo_auto.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER tr_log_auditoria_bi
BEFORE INSERT ON log_auditoria
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_log_auditoria.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER tr_log_auto_auditoria_bi
BEFORE INSERT ON log_auditoria_auto_infracao
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := s_log_auto_auditoria.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_agente_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON agente_voluntario
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO log_auditoria (id, usuario, tipo_operacao, detalhes)
        VALUES (s_log_auditoria.NEXTVAL, USER, 'INSERT',
                'Novo agente cadastrado: ' || :NEW.nome_completo);
    ELSIF UPDATING THEN
        INSERT INTO log_auditoria (id, usuario, tipo_operacao, detalhes)
        VALUES (s_log_auditoria.NEXTVAL, USER, 'UPDATE',
                'Agente atualizado: ' || :NEW.nome_completo);
    ELSIF DELETING THEN
        INSERT INTO log_auditoria (id, usuario, tipo_operacao, detalhes)
        VALUES (s_log_auditoria.NEXTVAL, USER, 'DELETE',
                'Agente removido: ' || :OLD.nome_completo);
    END IF;
END;
/
