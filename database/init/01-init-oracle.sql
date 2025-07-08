-- Script de inicialização do Oracle Database
-- Sistema de Gestão de Agentes Voluntários v2.0
-- Compatível com Oracle Cloud Infrastructure (OCI)

-- =====================================================
-- CONFIGURAÇÃO INICIAL
-- =====================================================

-- Conectar como ADMIN (Autonomous Database) ou SYS (Database Cloud Service)
-- sqlplus admin/AdminPassword@agentes-db_high

-- Configurar sessão
ALTER SESSION SET CONTAINER = CDB$ROOT;
SET PAGESIZE 0;
SET FEEDBACK OFF;
SET ECHO ON;

-- =====================================================
-- CRIAÇÃO DO USUÁRIO DA APLICAÇÃO
-- =====================================================

-- Criar usuário da aplicação
CREATE USER agentes_user IDENTIFIED BY "SecurePassword123!";

-- Conceder privilégios básicos
GRANT CONNECT TO agentes_user;
GRANT RESOURCE TO agentes_user;
GRANT CREATE SESSION TO agentes_user;
GRANT CREATE TABLE TO agentes_user;
GRANT CREATE SEQUENCE TO agentes_user;
GRANT CREATE VIEW TO agentes_user;
GRANT CREATE PROCEDURE TO agentes_user;
GRANT CREATE TRIGGER TO agentes_user;
GRANT CREATE SYNONYM TO agentes_user;

-- Conceder quota no tablespace (Autonomous Database)
ALTER USER agentes_user QUOTA UNLIMITED ON DATA;

-- Para Database Cloud Service, usar:
-- ALTER USER agentes_user QUOTA UNLIMITED ON USERS;

-- Privilégios adicionais para OCI
GRANT CREATE JOB TO agentes_user;
GRANT MANAGE SCHEDULER TO agentes_user;

-- =====================================================
-- CONECTAR COMO USUÁRIO DA APLICAÇÃO
-- =====================================================

-- Conectar como usuário da aplicação
-- CONNECT agentes_user/"SecurePassword123!"@agentes-db_high;

-- =====================================================
-- CRIAÇÃO DE SEQUÊNCIAS
-- =====================================================

CREATE SEQUENCE seq_agente_voluntario START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_comarca START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_area_atuacao START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_credencial START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_log_auditoria START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_auto_infracao START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_anexo_auto_infracao START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE seq_log_auditoria_auto START WITH 1 INCREMENT BY 1 NOCACHE;

-- =====================================================
-- CRIAÇÃO DAS TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de comarcas
CREATE TABLE comarca (
    id NUMBER(10) PRIMARY KEY,
    codigo_comarca NUMBER(10) NOT NULL UNIQUE,
    nome_comarca VARCHAR2(100) NOT NULL,
    ativo NUMBER(1) DEFAULT 1 CHECK (ativo IN (0,1)),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_comarca_codigo UNIQUE (codigo_comarca)
);

-- Tabela de áreas de atuação
CREATE TABLE area_atuacao (
    id NUMBER(10) PRIMARY KEY,
    nome_area_atuacao VARCHAR2(100) NOT NULL,
    descricao VARCHAR2(500),
    ativo NUMBER(1) DEFAULT 1 CHECK (ativo IN (0,1)),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de agentes voluntários
CREATE TABLE agente_voluntario (
    id VARCHAR2(36) PRIMARY KEY,
    nome_completo VARCHAR2(200) NOT NULL,
    cpf VARCHAR2(14) NOT NULL UNIQUE,
    rg VARCHAR2(20),
    email VARCHAR2(100) NOT NULL UNIQUE,
    telefone VARCHAR2(20) NOT NULL,
    endereco VARCHAR2(500) NOT NULL,
    data_nascimento DATE NOT NULL,
    nacionalidade VARCHAR2(50) NOT NULL,
    naturalidade VARCHAR2(100) NOT NULL,
    uf VARCHAR2(2) NOT NULL,
    numero_ci VARCHAR2(20) NOT NULL,
    data_expedicao_ci DATE NOT NULL,
    filiacao_pai VARCHAR2(200),
    filiacao_mae VARCHAR2(200),
    foto_path VARCHAR2(500),
    status VARCHAR2(20) DEFAULT 'EM_ANALISE' CHECK (status IN ('ATIVO', 'INATIVO', 'EM_ANALISE', 'REVOGADO')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao TIMESTAMP,
    usuario_cadastro VARCHAR2(100) NOT NULL,
    usuario_atualizacao VARCHAR2(100),
    CONSTRAINT chk_agente_status CHECK (status IN ('ATIVO', 'INATIVO', 'EM_ANALISE', 'REVOGADO'))
);

-- Tabela de credenciais
CREATE TABLE credencial (
    id VARCHAR2(36) PRIMARY KEY,
    agente_id VARCHAR2(36) NOT NULL,
    numero_credencial VARCHAR2(50) NOT NULL UNIQUE,
    data_emissao DATE NOT NULL,
    data_validade DATE NOT NULL,
    qr_code_data CLOB NOT NULL,
    status VARCHAR2(20) DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'INATIVA', 'VENCIDA')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_emissao VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_credencial_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id)
);

-- Tabela de autos de infração (v2.0)
CREATE TABLE auto_infracao (
    id VARCHAR2(36) PRIMARY KEY,
    agente_id VARCHAR2(36) NOT NULL,
    comarca_id NUMBER(10) NOT NULL,
    nome_autuado VARCHAR2(200) NOT NULL,
    cpf_cnpj_autuado VARCHAR2(18) NOT NULL,
    endereco_autuado VARCHAR2(500) NOT NULL,
    contato_autuado VARCHAR2(100) NOT NULL,
    nome_agente VARCHAR2(200) NOT NULL,
    matricula_agente VARCHAR2(50) NOT NULL,
    base_legal VARCHAR2(1000) NOT NULL,
    data_infracao DATE NOT NULL,
    hora_infracao VARCHAR2(8) NOT NULL,
    local_infracao VARCHAR2(500) NOT NULL,
    descricao_conduta CLOB NOT NULL,
    iniciais_crianca VARCHAR2(10),
    idade_crianca NUMBER(3),
    sexo_crianca VARCHAR2(1) CHECK (sexo_crianca IN ('M', 'F')),
    nome_testemunha VARCHAR2(200),
    cpf_testemunha VARCHAR2(14),
    assinatura_autuado NUMBER(1) CHECK (assinatura_autuado IN (0,1)),
    status VARCHAR2(20) DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'REGISTRADO', 'CONCLUIDO', 'CANCELADO')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_atualizacao TIMESTAMP,
    usuario_cadastro VARCHAR2(100) NOT NULL,
    usuario_atualizacao VARCHAR2(100),
    data_cancelamento TIMESTAMP,
    usuario_cancelamento VARCHAR2(100),
    justificativa_cancelamento VARCHAR2(500),
    CONSTRAINT fk_auto_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id),
    CONSTRAINT fk_auto_comarca FOREIGN KEY (comarca_id) REFERENCES comarca(id)
);

-- Tabela de anexos dos autos de infração
CREATE TABLE anexo_auto_infracao (
    id NUMBER(19) PRIMARY KEY,
    auto_infracao_id VARCHAR2(36) NOT NULL,
    nome_arquivo VARCHAR2(255) NOT NULL,
    nome_original VARCHAR2(255) NOT NULL,
    tipo_arquivo VARCHAR2(100) NOT NULL,
    tamanho_arquivo NUMBER(19) NOT NULL,
    caminho_arquivo VARCHAR2(500) NOT NULL,
    descricao VARCHAR2(500),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_upload VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_anexo_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id)
);

-- Tabela de log de auditoria geral
CREATE TABLE log_auditoria (
    id NUMBER(19) PRIMARY KEY,
    usuario VARCHAR2(100) NOT NULL,
    operacao VARCHAR2(50) NOT NULL,
    descricao CLOB,
    data_operacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    endereco_ip VARCHAR2(45),
    user_agent VARCHAR2(500)
);

-- Tabela de log de auditoria específica para autos de infração
CREATE TABLE log_auditoria_auto_infracao (
    id NUMBER(19) PRIMARY KEY,
    auto_infracao_id VARCHAR2(36) NOT NULL,
    tipo_operacao VARCHAR2(50) NOT NULL,
    usuario VARCHAR2(100) NOT NULL,
    perfil_usuario VARCHAR2(50),
    data_operacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    endereco_ip VARCHAR2(100),
    detalhes CLOB,
    justificativa VARCHAR2(500),
    sucesso NUMBER(1) DEFAULT 1 CHECK (sucesso IN (0,1)),
    mensagem_erro VARCHAR2(500),
    CONSTRAINT fk_log_auto FOREIGN KEY (auto_infracao_id) REFERENCES auto_infracao(id)
);

-- Tabelas de relacionamento N:N
CREATE TABLE agente_comarca (
    agente_id VARCHAR2(36) NOT NULL,
    comarca_id NUMBER(10) NOT NULL,
    data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ativo NUMBER(1) DEFAULT 1 CHECK (ativo IN (0,1)),
    PRIMARY KEY (agente_id, comarca_id),
    CONSTRAINT fk_agente_comarca_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id),
    CONSTRAINT fk_agente_comarca_comarca FOREIGN KEY (comarca_id) REFERENCES comarca(id)
);

CREATE TABLE agente_area_atuacao (
    agente_id VARCHAR2(36) NOT NULL,
    area_atuacao_id NUMBER(10) NOT NULL,
    data_vinculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ativo NUMBER(1) DEFAULT 1 CHECK (ativo IN (0,1)),
    PRIMARY KEY (agente_id, area_atuacao_id),
    CONSTRAINT fk_agente_area_agente FOREIGN KEY (agente_id) REFERENCES agente_voluntario(id),
    CONSTRAINT fk_agente_area_area FOREIGN KEY (area_atuacao_id) REFERENCES area_atuacao(id)
);

-- =====================================================
-- CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para agente_voluntario
CREATE INDEX idx_agente_cpf ON agente_voluntario(cpf);
CREATE INDEX idx_agente_email ON agente_voluntario(email);
CREATE INDEX idx_agente_status ON agente_voluntario(status);
CREATE INDEX idx_agente_data_cadastro ON agente_voluntario(data_cadastro);

-- Índices para credencial
CREATE INDEX idx_credencial_agente ON credencial(agente_id);
CREATE INDEX idx_credencial_numero ON credencial(numero_credencial);
CREATE INDEX idx_credencial_status ON credencial(status);

-- Índices para auto_infracao
CREATE INDEX idx_auto_agente ON auto_infracao(agente_id);
CREATE INDEX idx_auto_comarca ON auto_infracao(comarca_id);
CREATE INDEX idx_auto_status ON auto_infracao(status);
CREATE INDEX idx_auto_data_infracao ON auto_infracao(data_infracao);
CREATE INDEX idx_auto_autuado ON auto_infracao(nome_autuado);
CREATE INDEX idx_auto_cpf_cnpj ON auto_infracao(cpf_cnpj_autuado);

-- Índices para anexos
CREATE INDEX idx_anexo_auto ON anexo_auto_infracao(auto_infracao_id);
CREATE INDEX idx_anexo_data_upload ON anexo_auto_infracao(data_upload);

-- Índices para logs
CREATE INDEX idx_log_usuario ON log_auditoria(usuario);
CREATE INDEX idx_log_data ON log_auditoria(data_operacao);
CREATE INDEX idx_log_auto_id ON log_auditoria_auto_infracao(auto_infracao_id);
CREATE INDEX idx_log_auto_usuario ON log_auditoria_auto_infracao(usuario);
CREATE INDEX idx_log_auto_data ON log_auditoria_auto_infracao(data_operacao);

-- =====================================================
-- INSERÇÃO DE DADOS INICIAIS
-- =====================================================

-- Inserir comarcas de Minas Gerais (298 comarcas)
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 2, 'Abaeté');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 3, 'Abre-Campo');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 5, 'Açucena');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 9, 'Águas Formosas');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 10, 'Aimorés');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 11, 'Aiuruoca');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 12, 'Alagoa');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 13, 'Albertina');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 14, 'Além Paraíba');
INSERT INTO comarca (id, codigo_comarca, nome_comarca) VALUES (seq_comarca.NEXTVAL, 15, 'Alfenas');
-- ... (continuar com todas as 298 comarcas)

-- Inserir áreas de atuação
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Proteção à Criança e Adolescente', 'Proteção integral de crianças e adolescentes');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Educação e Ensino', 'Promoção da educação e ensino de qualidade');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Saúde Mental Infantil', 'Cuidados com a saúde mental de crianças e adolescentes');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Assistência Social', 'Assistência social e proteção social básica');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Esporte e Lazer', 'Promoção de atividades esportivas e de lazer');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Cultura e Arte', 'Desenvolvimento cultural e artístico');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Meio Ambiente', 'Educação e proteção ambiental');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Direitos Humanos', 'Promoção e defesa dos direitos humanos');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Inclusão Digital', 'Inclusão digital e tecnológica');
INSERT INTO area_atuacao (id, nome_area_atuacao, descricao) VALUES (seq_area_atuacao.NEXTVAL, 'Prevenção ao Uso de Drogas', 'Prevenção ao uso de drogas e substâncias');

-- =====================================================
-- CRIAÇÃO DE TRIGGERS PARA AUDITORIA
-- =====================================================

-- Trigger para auditoria automática de agentes
CREATE OR REPLACE TRIGGER trg_agente_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON agente_voluntario
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO log_auditoria (id, usuario, operacao, descricao, data_operacao)
        VALUES (seq_log_auditoria.NEXTVAL, USER, 'INSERT', 'Novo agente cadastrado: ' || :NEW.nome_completo, SYSTIMESTAMP);
    ELSIF UPDATING THEN
        INSERT INTO log_auditoria (id, usuario, operacao, descricao, data_operacao)
        VALUES (seq_log_auditoria.NEXTVAL, USER, 'UPDATE', 'Agente atualizado: ' || :NEW.nome_completo, SYSTIMESTAMP);
    ELSIF DELETING THEN
        INSERT INTO log_auditoria (id, usuario, operacao, descricao, data_operacao)
        VALUES (seq_log_auditoria.NEXTVAL, USER, 'DELETE', 'Agente removido: ' || :OLD.nome_completo, SYSTIMESTAMP);
    END IF;
END;
/

-- Trigger para auditoria de autos de infração
CREATE OR REPLACE TRIGGER trg_auto_infracao_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON auto_infracao
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO log_auditoria_auto_infracao (id, auto_infracao_id, tipo_operacao, usuario, data_operacao, detalhes)
        VALUES (seq_log_auditoria_auto.NEXTVAL, :NEW.id, 'CREATE', USER, SYSTIMESTAMP, 'Auto de infração criado');
    ELSIF UPDATING THEN
        INSERT INTO log_auditoria_auto_infracao (id, auto_infracao_id, tipo_operacao, usuario, data_operacao, detalhes)
        VALUES (seq_log_auditoria_auto.NEXTVAL, :NEW.id, 'UPDATE', USER, SYSTIMESTAMP, 'Auto de infração atualizado');
    ELSIF DELETING THEN
        INSERT INTO log_auditoria_auto_infracao (id, auto_infracao_id, tipo_operacao, usuario, data_operacao, detalhes)
        VALUES (seq_log_auditoria_auto.NEXTVAL, :OLD.id, 'DELETE', USER, SYSTIMESTAMP, 'Auto de infração removido');
    END IF;
END;
/

-- =====================================================
-- CRIAÇÃO DE VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para estatísticas de agentes por comarca
CREATE OR REPLACE VIEW vw_agentes_por_comarca AS
SELECT 
    c.nome_comarca,
    COUNT(ac.agente_id) as total_agentes,
    SUM(CASE WHEN av.status = 'ATIVO' THEN 1 ELSE 0 END) as agentes_ativos,
    SUM(CASE WHEN av.status = 'INATIVO' THEN 1 ELSE 0 END) as agentes_inativos,
    SUM(CASE WHEN av.status = 'EM_ANALISE' THEN 1 ELSE 0 END) as agentes_em_analise,
    SUM(CASE WHEN av.status = 'REVOGADO' THEN 1 ELSE 0 END) as agentes_revogados
FROM comarca c
LEFT JOIN agente_comarca ac ON c.id = ac.comarca_id AND ac.ativo = 1
LEFT JOIN agente_voluntario av ON ac.agente_id = av.id
GROUP BY c.nome_comarca
ORDER BY total_agentes DESC;

-- View para estatísticas de credenciais
CREATE OR REPLACE VIEW vw_estatisticas_credenciais AS
SELECT 
    COUNT(*) as total_credenciais,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) as credenciais_ano_atual,
    COUNT(CASE WHEN EXTRACT(MONTH FROM data_emissao) = EXTRACT(MONTH FROM SYSDATE) 
               AND EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) as credenciais_mes_atual,
    COUNT(CASE WHEN status = 'ATIVA' THEN 1 END) as credenciais_ativas,
    COUNT(CASE WHEN status = 'VENCIDA' THEN 1 END) as credenciais_vencidas
FROM credencial;

-- View para estatísticas de autos de infração
CREATE OR REPLACE VIEW vw_autos_por_status AS
SELECT 
    status,
    COUNT(*) as total_autos,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_cadastro) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) as autos_ano_atual,
    COUNT(CASE WHEN EXTRACT(MONTH FROM data_cadastro) = EXTRACT(MONTH FROM SYSDATE) 
               AND EXTRACT(YEAR FROM data_cadastro) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) as autos_mes_atual
FROM auto_infracao
GROUP BY status
ORDER BY total_autos DESC;

-- View para dashboard
CREATE OR REPLACE VIEW vw_dashboard_agentes AS
SELECT 
    (SELECT COUNT(*) FROM agente_voluntario WHERE status = 'ATIVO') as agentes_ativos,
    (SELECT COUNT(*) FROM agente_voluntario WHERE status = 'INATIVO') as agentes_inativos,
    (SELECT COUNT(*) FROM agente_voluntario WHERE status = 'EM_ANALISE') as agentes_em_analise,
    (SELECT COUNT(*) FROM credencial WHERE status = 'ATIVA') as credenciais_ativas,
    (SELECT COUNT(*) FROM auto_infracao WHERE status = 'REGISTRADO') as autos_registrados,
    (SELECT COUNT(*) FROM auto_infracao WHERE status = 'RASCUNHO') as autos_rascunho,
    (SELECT COUNT(*) FROM auto_infracao WHERE EXTRACT(MONTH FROM data_cadastro) = EXTRACT(MONTH FROM SYSDATE) 
             AND EXTRACT(YEAR FROM data_cadastro) = EXTRACT(YEAR FROM SYSDATE)) as autos_mes_atual
FROM DUAL;

-- =====================================================
-- CONFIGURAÇÕES DE SEGURANÇA
-- =====================================================

-- Criar perfil de segurança
CREATE PROFILE agentes_profile LIMIT
    SESSIONS_PER_USER 10
    CPU_PER_SESSION UNLIMITED
    CPU_PER_CALL 3000
    CONNECT_TIME 480
    IDLE_TIME 30
    LOGICAL_READS_PER_SESSION UNLIMITED
    LOGICAL_READS_PER_CALL 1000
    PRIVATE_SGA UNLIMITED
    COMPOSITE_LIMIT UNLIMITED
    PASSWORD_LIFE_TIME 90
    PASSWORD_REUSE_TIME 365
    PASSWORD_REUSE_MAX 5
    PASSWORD_VERIFY_FUNCTION VERIFY_FUNCTION_11G
    FAILED_LOGIN_ATTEMPTS 5
    PASSWORD_LOCK_TIME 1;

-- Aplicar perfil ao usuário
ALTER USER agentes_user PROFILE agentes_profile;

-- =====================================================
-- COMMIT DAS ALTERAÇÕES
-- =====================================================

COMMIT;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar tabelas criadas
SELECT table_name FROM user_tables ORDER BY table_name;

-- Verificar sequências
SELECT sequence_name FROM user_sequences ORDER BY sequence_name;

-- Verificar índices
SELECT index_name, table_name FROM user_indexes ORDER BY table_name, index_name;

-- Verificar triggers
SELECT trigger_name, table_name FROM user_triggers ORDER BY table_name, trigger_name;

-- Verificar views
SELECT view_name FROM user_views ORDER BY view_name;

PROMPT 'Script de inicialização concluído com sucesso!';
PROMPT 'Sistema de Gestão de Agentes Voluntários v2.0 - Oracle Database';
PROMPT 'Compatível com Oracle Cloud Infrastructure (OCI)';

EXIT;

