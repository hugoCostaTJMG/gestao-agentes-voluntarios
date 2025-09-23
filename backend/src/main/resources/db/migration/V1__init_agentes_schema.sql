-- Schema: AGENTES (uses current session schema)

-- =============================
-- Sequences
-- =============================
CREATE SEQUENCE S_AGENTE_VOLUNTARIO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_COMARCA START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_AREA_ATUACAO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_CREDENCIAL START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_LOG_AUDITORIA START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_LOG_AUDITORIA_AUTO_INFRACAO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_AUTO_INFRACAO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_ANEXO_AUTO_INFRACAO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_ESTABELECIMENTO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_RESPONSAVEL START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_MENOR_ENVOLVIDO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE S_TESTEMUNHA START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- =============================
-- Core tables
-- =============================
CREATE TABLE agente_voluntario (
  id_agente              NUMBER(19)    PRIMARY KEY,
  nome_completo          VARCHAR2(255) NOT NULL,
  cpf                    VARCHAR2(11)  NOT NULL UNIQUE,
  telefone               VARCHAR2(20)  NOT NULL,
  email                  VARCHAR2(255) NOT NULL,
  foto                   BLOB,
  numero_carteira_identidade VARCHAR2(20),
  data_expedicao_ci      DATE,
  nacionalidade          VARCHAR2(50),
  naturalidade           VARCHAR2(100),
  uf                     CHAR(2),
  data_nascimento        DATE,
  filiacao_pai           VARCHAR2(255),
  filiacao_mae           VARCHAR2(255),
  data_cadastro          TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  usuario_cadastro       VARCHAR2(100) NOT NULL,
  status                 VARCHAR2(20)  NOT NULL,
  disponibilidade        VARCHAR2(500)
);

CREATE TABLE comarca (
  id_comarca   NUMBER(19)    PRIMARY KEY,
  nome_comarca VARCHAR2(255) NOT NULL UNIQUE
);

CREATE TABLE area_atuacao (
  id_area_atuacao   NUMBER(19)    PRIMARY KEY,
  nome_area_atuacao VARCHAR2(255) NOT NULL UNIQUE
);

CREATE TABLE agente_comarca (
  id_agente  NUMBER(19) NOT NULL,
  id_comarca NUMBER(19) NOT NULL,
  CONSTRAINT pk_agente_comarca PRIMARY KEY (id_agente, id_comarca),
  CONSTRAINT fk_ac_agente FOREIGN KEY (id_agente) REFERENCES agente_voluntario(id_agente),
  CONSTRAINT fk_ac_comarca FOREIGN KEY (id_comarca) REFERENCES comarca(id_comarca)
);

CREATE TABLE agente_area_atuacao (
  id_agente        NUMBER(19) NOT NULL,
  id_area_atuacao  NUMBER(19) NOT NULL,
  CONSTRAINT pk_agente_area PRIMARY KEY (id_agente, id_area_atuacao),
  CONSTRAINT fk_aa_agente FOREIGN KEY (id_agente) REFERENCES agente_voluntario(id_agente),
  CONSTRAINT fk_aa_area FOREIGN KEY (id_area_atuacao) REFERENCES area_atuacao(id_area_atuacao)
);

CREATE TABLE credencial (
  id_credencial   NUMBER(19)    PRIMARY KEY,
  id_agente       NUMBER(19)    NOT NULL,
  data_emissao    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  qr_code_url     VARCHAR2(500) NOT NULL,
  usuario_emissao VARCHAR2(100) NOT NULL,
  CONSTRAINT fk_cred_agente FOREIGN KEY (id_agente) REFERENCES agente_voluntario(id_agente)
);

CREATE TABLE log_auditoria (
  id_log        NUMBER(19)    PRIMARY KEY,
  data_hora     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  usuario       VARCHAR2(100) NOT NULL,
  tipo_operacao VARCHAR2(50)  NOT NULL,
  detalhes      CLOB,
  ip_origem     VARCHAR2(45)
);

CREATE TABLE log_auditoria_auto_infracao (
  id               NUMBER(19)    PRIMARY KEY,
  auto_infracao_id NUMBER(19)    NOT NULL,
  tipo_operacao    VARCHAR2(50)  NOT NULL,
  usuario          VARCHAR2(100) NOT NULL,
  perfil_usuario   VARCHAR2(50),
  data_operacao    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  endereco_ip      VARCHAR2(100),
  detalhes         CLOB,
  justificativa    VARCHAR2(500),
  sucesso          NUMBER(1)     DEFAULT 1 NOT NULL,
  mensagem_erro    VARCHAR2(500)
);

CREATE TABLE auto_infracao (
  id                      NUMBER(19)    PRIMARY KEY,
  numero_auto             VARCHAR2(30)  UNIQUE,
  nome_autuado            VARCHAR2(200) NOT NULL,
  cpf_cnpj_autuado        VARCHAR2(18)  NOT NULL,
  endereco_autuado        VARCHAR2(500) NOT NULL,
  contato_autuado         VARCHAR2(100) NOT NULL,
  agente_id               NUMBER(19)    NOT NULL,
  nome_agente             VARCHAR2(200) NOT NULL,
  matricula_agente        VARCHAR2(50)  NOT NULL,
  comarca_id              NUMBER(19)    NOT NULL,
  base_legal              VARCHAR2(1000) NOT NULL,
  data_infracao           DATE          NOT NULL,
  hora_infracao           TIMESTAMP     NOT NULL,
  local_infracao          VARCHAR2(500) NOT NULL,
  descricao_conduta       VARCHAR2(2000) NOT NULL,
  iniciais_crianca        VARCHAR2(10),
  idade_crianca           NUMBER(3),
  sexo_crianca            CHAR(1),
  nome_testemunha         VARCHAR2(200),
  cpf_testemunha          VARCHAR2(14),
  assinatura_autuado      NUMBER(1),
  status                  VARCHAR2(20)  NOT NULL,
  data_cadastro           TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  data_atualizacao        TIMESTAMP,
  usuario_cadastro        VARCHAR2(100) NOT NULL,
  usuario_atualizacao     VARCHAR2(100),
  data_cancelamento       TIMESTAMP,
  usuario_cancelamento    VARCHAR2(100),
  justificativa_cancelamento VARCHAR2(500),
  CONSTRAINT fk_auto_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id_agente),
  CONSTRAINT fk_auto_comarca FOREIGN KEY (comarca_id) REFERENCES comarca(id_comarca)
);

CREATE INDEX idx_auto_agente ON auto_infracao (agente_id);
CREATE INDEX idx_auto_comarca ON auto_infracao (comarca_id);
CREATE INDEX idx_auto_data ON auto_infracao (data_infracao);

CREATE TABLE anexo_auto_infracao (
  id                NUMBER(19)    PRIMARY KEY,
  auto_infracao_id  NUMBER(19)    NOT NULL,
  nome_arquivo      VARCHAR2(255) NOT NULL,
  nome_original     VARCHAR2(255) NOT NULL,
  tipo_arquivo      VARCHAR2(100) NOT NULL,
  tamanho_arquivo   NUMBER(19)    NOT NULL,
  caminho_arquivo   VARCHAR2(500) NOT NULL,
  descricao         VARCHAR2(500),
  data_upload       TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  usuario_upload    VARCHAR2(100) NOT NULL,
  CONSTRAINT fk_anexo_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id)
);

CREATE INDEX idx_anexo_auto ON anexo_auto_infracao (auto_infracao_id);

-- =============================
-- DER (DER/DDL complementar do DER do DER)
-- =============================
CREATE TABLE estabelecimento (
  id_estabelecimento NUMBER(19)    PRIMARY KEY,
  nome               VARCHAR2(255) NOT NULL,
  cnpj               VARCHAR2(14),
  endereco           VARCHAR2(500)
);

CREATE UNIQUE INDEX ux_estab_cnpj ON estabelecimento (cnpj) WHERE cnpj IS NOT NULL;

CREATE TABLE responsavel (
  id_responsavel NUMBER(19)    PRIMARY KEY,
  nome           VARCHAR2(255) NOT NULL,
  cpf            VARCHAR2(11),
  telefone       VARCHAR2(20),
  email          VARCHAR2(255)
);

CREATE UNIQUE INDEX ux_resp_cpf ON responsavel (cpf) WHERE cpf IS NOT NULL;

CREATE TABLE menor_envolvido (
  id                NUMBER(19)    PRIMARY KEY,
  auto_infracao_id  NUMBER(19)    NOT NULL,
  iniciais          VARCHAR2(10),
  idade             NUMBER(3),
  sexo              CHAR(1),
  CONSTRAINT fk_menor_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id)
);

CREATE INDEX idx_menor_auto ON menor_envolvido (auto_infracao_id);

CREATE TABLE testemunha (
  id_testemunha NUMBER(19)    PRIMARY KEY,
  nome          VARCHAR2(255) NOT NULL,
  cpf           VARCHAR2(11)
);

CREATE UNIQUE INDEX ux_testemunha_cpf ON testemunha (cpf) WHERE cpf IS NOT NULL;

CREATE TABLE auto_infracao_testemunha (
  auto_infracao_id NUMBER(19) NOT NULL,
  testemunha_id    NUMBER(19) NOT NULL,
  CONSTRAINT pk_auto_testemunha PRIMARY KEY (auto_infracao_id, testemunha_id),
  CONSTRAINT fk_ait_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id),
  CONSTRAINT fk_ait_test FOREIGN KEY (testemunha_id) REFERENCES testemunha(id_testemunha)
);

-- =============================
-- Triggers for sequences (optional, only if id is null)
-- =============================
CREATE OR REPLACE TRIGGER TR_BI_AGENTE_VOLUNTARIO
BEFORE INSERT ON agente_voluntario FOR EACH ROW
WHEN (NEW.id_agente IS NULL)
BEGIN
  :NEW.id_agente := S_AGENTE_VOLUNTARIO.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_COMARCA
BEFORE INSERT ON comarca FOR EACH ROW
WHEN (NEW.id_comarca IS NULL)
BEGIN
  :NEW.id_comarca := S_COMARCA.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_AREA_ATUACAO
BEFORE INSERT ON area_atuacao FOR EACH ROW
WHEN (NEW.id_area_atuacao IS NULL)
BEGIN
  :NEW.id_area_atuacao := S_AREA_ATUACAO.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_CREDENCIAL
BEFORE INSERT ON credencial FOR EACH ROW
WHEN (NEW.id_credencial IS NULL)
BEGIN
  :NEW.id_credencial := S_CREDENCIAL.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_LOG_AUDITORIA
BEFORE INSERT ON log_auditoria FOR EACH ROW
WHEN (NEW.id_log IS NULL)
BEGIN
  :NEW.id_log := S_LOG_AUDITORIA.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_LOG_AUDITORIA_AUTO
BEFORE INSERT ON log_auditoria_auto_infracao FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
  :NEW.id := S_LOG_AUDITORIA_AUTO_INFRACAO.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_AUTO_INFRACAO
BEFORE INSERT ON auto_infracao FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
  :NEW.id := S_AUTO_INFRACAO.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_ANEXO_AUTO
BEFORE INSERT ON anexo_auto_infracao FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
  :NEW.id := S_ANEXO_AUTO_INFRACAO.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_ESTABELECIMENTO
BEFORE INSERT ON estabelecimento FOR EACH ROW
WHEN (NEW.id_estabelecimento IS NULL)
BEGIN
  :NEW.id_estabelecimento := S_ESTABELECIMENTO.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_RESPONSAVEL
BEFORE INSERT ON responsavel FOR EACH ROW
WHEN (NEW.id_responsavel IS NULL)
BEGIN
  :NEW.id_responsavel := S_RESPONSAVEL.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_MENOR
BEFORE INSERT ON menor_envolvido FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
  :NEW.id := S_MENOR_ENVOLVIDO.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER TR_BI_TESTEMUNHA
BEFORE INSERT ON testemunha FOR EACH ROW
WHEN (NEW.id_testemunha IS NULL)
BEGIN
  :NEW.id_testemunha := S_TESTEMUNHA.NEXTVAL;
END;
/

