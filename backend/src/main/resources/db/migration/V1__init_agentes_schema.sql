-- Schema initialization aligned with numeric technical identifiers

-- =============================
-- Sequences
-- =============================
CREATE SEQUENCE S_AGENTE_VOLUNTARIO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_COMARCA START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_AREA_ATUACAO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_CREDENCIAL START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_LOG_AUDITORIA START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_LOG_AUTO_AUDITORIA START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_AUTO_INFRACAO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_ANEXO_AUTO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_ESTABELECIMENTO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_RESPONSAVEL START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_MENOR_ENVOLVIDO START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE S_TESTEMUNHA START WITH 1 INCREMENT BY 1;

-- =============================
-- Core reference tables
-- =============================
CREATE TABLE agente_voluntario (
    id                     BIGINT        PRIMARY KEY,
    id_agente_negocio      VARCHAR(36)   UNIQUE,
    nome_completo          VARCHAR(255)  NOT NULL,
    cpf                    VARCHAR(11)   NOT NULL UNIQUE,
    telefone               VARCHAR(20)   NOT NULL,
    email                  VARCHAR(255)  NOT NULL,
    foto                   BLOB,
    numero_carteira_identidade VARCHAR(20),
    data_expedicao_ci      DATE,
    nacionalidade          VARCHAR(50),
    naturalidade           VARCHAR(100),
    uf                     CHAR(2),
    data_nascimento        DATE,
    filiacao_pai           VARCHAR(255),
    filiacao_mae           VARCHAR(255),
    data_cadastro          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cadastro       VARCHAR(100)  NOT NULL,
    status                 VARCHAR(20)   NOT NULL,
    disponibilidade        VARCHAR(500)
);

CREATE TABLE comarca (
    id           BIGINT       PRIMARY KEY,
    nome_comarca VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE area_atuacao (
    id                  BIGINT       PRIMARY KEY,
    nome_area_atuacao   VARCHAR(255) NOT NULL UNIQUE
);

-- =============================
-- Business reference tables
-- =============================
CREATE TABLE estabelecimento (
    id                          BIGINT       PRIMARY KEY,
    id_estabelecimento_str      VARCHAR(255) NOT NULL UNIQUE,
    cnpj                        VARCHAR(18)  UNIQUE,
    nome_estabelecimento        VARCHAR(255) NOT NULL,
    endereco_estabelecimento    VARCHAR(500),
    complemento_estabelecimento VARCHAR(255),
    bairro_estabelecimento      VARCHAR(255),
    cidade_estabelecimento      VARCHAR(255)
);

CREATE TABLE responsavel (
    id                   BIGINT       PRIMARY KEY,
    id_responsavel_str   VARCHAR(255) NOT NULL UNIQUE,
    nome_responsavel     VARCHAR(255) NOT NULL,
    rg_responsavel       VARCHAR(20),
    cpf_responsavel      VARCHAR(14)  UNIQUE,
    condicao_responsavel VARCHAR(255),
    endereco_responsavel VARCHAR(500),
    complemento_responsavel VARCHAR(255),
    bairro_responsavel   VARCHAR(255),
    cidade_responsavel   VARCHAR(255)
);

-- =============================
-- Main transactional tables
-- =============================
CREATE TABLE auto_infracao (
    id                         BIGINT        PRIMARY KEY,
    id_auto_infracao_str       VARCHAR(255)  NOT NULL UNIQUE,
    numero_auto                VARCHAR(255)  UNIQUE,
    agente_id                  BIGINT        NOT NULL,
    nome_autuado               VARCHAR(200)  NOT NULL,
    cpf_cnpj_autuado           VARCHAR(18)   NOT NULL,
    endereco_autuado           VARCHAR(500)  NOT NULL,
    contato_autuado            VARCHAR(100)  NOT NULL,
    nome_agente                VARCHAR(200)  NOT NULL,
    matricula_agente           VARCHAR(50)   NOT NULL,
    comarca_id                 BIGINT        NOT NULL,
    base_legal                 VARCHAR(1000) NOT NULL,
    fundamento_legal           VARCHAR(500),
    artigo_eca                 VARCHAR(255),
    portaria_n                 VARCHAR(255),
    data_infracao              DATE          NOT NULL,
    hora_infracao              TIME          NOT NULL,
    horario_infracao           TIMESTAMP,
    local_infracao             VARCHAR(500)  NOT NULL,
    descricao_conduta          VARCHAR(2000) NOT NULL,
    iniciais_crianca           VARCHAR(10),
    idade_crianca              INTEGER,
    sexo_crianca               CHAR(1),
    numero_criancas            INTEGER,
    numero_adolescentes        INTEGER,
    nome_testemunha            VARCHAR(200),
    cpf_testemunha             VARCHAR(14),
    assinatura_autuado         BOOLEAN,
    nome_comissario_autuante   VARCHAR(255),
    matricula_autuante         VARCHAR(255),
    observacoes                CLOB,
    data_intimacao             DATE,
    prazo_defesa               DATE,
    status                     VARCHAR(20)   NOT NULL,
    data_cadastro              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao           TIMESTAMP,
    usuario_cadastro           VARCHAR(100)  NOT NULL,
    usuario_atualizacao        VARCHAR(100),
    data_cancelamento          TIMESTAMP,
    usuario_cancelamento       VARCHAR(100),
    justificativa_cancelamento VARCHAR(500),
    estabelecimento_id         BIGINT,
    responsavel_id             BIGINT,
    CONSTRAINT fk_auto_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id),
    CONSTRAINT fk_auto_comarca FOREIGN KEY (comarca_id) REFERENCES comarca(id),
    CONSTRAINT fk_auto_estab FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimento(id),
    CONSTRAINT fk_auto_resp FOREIGN KEY (responsavel_id) REFERENCES responsavel(id)
);

CREATE INDEX i_auto_agente ON auto_infracao (agente_id);
CREATE INDEX i_auto_comarca ON auto_infracao (comarca_id);
CREATE INDEX i_auto_status ON auto_infracao (status);
CREATE INDEX i_auto_data ON auto_infracao (data_infracao);
CREATE INDEX i_auto_autuado ON auto_infracao (nome_autuado);

CREATE TABLE credencial (
    id               BIGINT       PRIMARY KEY,
    agente_id        BIGINT       NOT NULL,
    data_emissao     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    qr_code_url      VARCHAR(500) NOT NULL,
    usuario_emissao  VARCHAR(100) NOT NULL,
    CONSTRAINT fk_credencial_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id)
);

CREATE TABLE anexo_auto_infracao (
    id               BIGINT        PRIMARY KEY,
    auto_infracao_id BIGINT        NOT NULL,
    nome_arquivo     VARCHAR(255)  NOT NULL,
    nome_original    VARCHAR(255)  NOT NULL,
    tipo_arquivo     VARCHAR(100)  NOT NULL,
    tamanho_arquivo  BIGINT        NOT NULL,
    caminho_arquivo  VARCHAR(500)  NOT NULL,
    descricao        VARCHAR(500),
    data_upload      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_upload   VARCHAR(100)  NOT NULL,
    CONSTRAINT fk_anexo_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id)
);

CREATE INDEX i_anexo_auto ON anexo_auto_infracao (auto_infracao_id);

-- =============================
-- Audit tables
-- =============================
CREATE TABLE log_auditoria (
    id            BIGINT       PRIMARY KEY,
    data_hora     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario       VARCHAR(100) NOT NULL,
    tipo_operacao VARCHAR(50)  NOT NULL,
    detalhes      CLOB,
    ip_origem     VARCHAR(45)
);

CREATE TABLE log_auditoria_auto_infracao (
    id               BIGINT       PRIMARY KEY,
    auto_infracao_id BIGINT       NOT NULL,
    tipo_operacao    VARCHAR(50)  NOT NULL,
    usuario          VARCHAR(100) NOT NULL,
    perfil_usuario   VARCHAR(50),
    data_operacao    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    endereco_ip      VARCHAR(100),
    detalhes         CLOB,
    justificativa    VARCHAR(500),
    sucesso          BOOLEAN      DEFAULT TRUE NOT NULL,
    mensagem_erro    VARCHAR(500),
    CONSTRAINT fk_log_auto_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id)
);

CREATE INDEX i_log_auto ON log_auditoria_auto_infracao (auto_infracao_id);

-- =============================
-- Relationship tables
-- =============================
CREATE TABLE agente_comarca (
    agente_id  BIGINT NOT NULL,
    comarca_id BIGINT NOT NULL,
    CONSTRAINT pk_agente_comarca PRIMARY KEY (agente_id, comarca_id),
    CONSTRAINT fk_ac_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id),
    CONSTRAINT fk_ac_comarca FOREIGN KEY (comarca_id) REFERENCES comarca(id)
);

CREATE TABLE agente_area_atuacao (
    agente_id       BIGINT NOT NULL,
    area_atuacao_id BIGINT NOT NULL,
    CONSTRAINT pk_agente_area PRIMARY KEY (agente_id, area_atuacao_id),
    CONSTRAINT fk_aa_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id),
    CONSTRAINT fk_aa_area FOREIGN KEY (area_atuacao_id) REFERENCES area_atuacao(id)
);

CREATE TABLE menor_envolvido (
    id                  BIGINT       PRIMARY KEY,
    id_menor_str        VARCHAR(255) NOT NULL UNIQUE,
    nome_menor          VARCHAR(255) NOT NULL,
    data_nascimento_menor DATE,
    documento_menor     VARCHAR(255),
    filiacao_menor      VARCHAR(500),
    residencia_menor    VARCHAR(500),
    auto_infracao_id    BIGINT       NOT NULL,
    CONSTRAINT fk_menor_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id)
);

CREATE INDEX i_menor_auto ON menor_envolvido (auto_infracao_id);

CREATE TABLE testemunha (
    id                 BIGINT       PRIMARY KEY,
    id_testemunha_str  VARCHAR(255) NOT NULL UNIQUE,
    nome_testemunha    VARCHAR(255) NOT NULL,
    residencia_testemunha VARCHAR(500),
    documento_testemunha  VARCHAR(255)
);

CREATE TABLE auto_infracao_testemunha (
    auto_id       BIGINT NOT NULL,
    testemunha_id BIGINT NOT NULL,
    CONSTRAINT pk_auto_testemunha PRIMARY KEY (auto_id, testemunha_id),
    CONSTRAINT fk_ait_auto FOREIGN KEY (auto_id) REFERENCES auto_infracao(id),
    CONSTRAINT fk_ait_test FOREIGN KEY (testemunha_id) REFERENCES testemunha(id)
);

CREATE INDEX i_ait_auto ON auto_infracao_testemunha (auto_id);
CREATE INDEX i_ait_test ON auto_infracao_testemunha (testemunha_id);
