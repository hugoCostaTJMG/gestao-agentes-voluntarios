-- Script de inicialização do banco de dados Oracle
-- Sistema de Gestão de Agentes Voluntários

-- Criar usuário da aplicação
CREATE USER agentes_user IDENTIFIED BY agentes_pass;

-- Conceder privilégios necessários
GRANT CONNECT, RESOURCE TO agentes_user;
GRANT CREATE SESSION TO agentes_user;
GRANT CREATE TABLE TO agentes_user;
GRANT CREATE SEQUENCE TO agentes_user;
GRANT CREATE VIEW TO agentes_user;
GRANT CREATE PROCEDURE TO agentes_user;
GRANT CREATE TRIGGER TO agentes_user;

-- Conceder quota no tablespace
ALTER USER agentes_user QUOTA UNLIMITED ON USERS;

-- Conectar como usuário da aplicação
CONNECT agentes_user/agentes_pass;

-- Criar sequências
CREATE SEQUENCE seq_agente_voluntario START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_comarca START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_area_atuacao START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_credencial START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_log_auditoria START WITH 1 INCREMENT BY 1;

-- Inserir dados iniciais de comarcas
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de São Paulo');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca do Rio de Janeiro');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Belo Horizonte');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Salvador');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Brasília');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Fortaleza');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Recife');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Porto Alegre');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Curitiba');
INSERT INTO comarca (id, nome_comarca) VALUES (sys_guid(), 'Comarca de Manaus');

-- Inserir dados iniciais de áreas de atuação
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Proteção à Criança e Adolescente');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Educação e Ensino');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Saúde Mental Infantil');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Assistência Social');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Esporte e Lazer');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Cultura e Arte');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Meio Ambiente');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Direitos Humanos');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Inclusão Digital');
INSERT INTO area_atuacao (id, nome_area_atuacao) VALUES (sys_guid(), 'Prevenção ao Uso de Drogas');

-- Commit das inserções
COMMIT;

-- Criar índices para performance
CREATE INDEX idx_agente_cpf ON agente_voluntario(cpf);
CREATE INDEX idx_agente_status ON agente_voluntario(status);
CREATE INDEX idx_credencial_agente ON credencial(agente_id);
CREATE INDEX idx_log_usuario ON log_auditoria(usuario);
CREATE INDEX idx_log_data ON log_auditoria(data_operacao);

-- Criar trigger para auditoria automática
CREATE OR REPLACE TRIGGER trg_agente_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON agente_voluntario
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO log_auditoria (id, usuario, operacao, descricao, data_operacao)
        VALUES (sys_guid(), USER, 'INSERT', 'Novo agente cadastrado: ' || :NEW.nome_completo, SYSTIMESTAMP);
    ELSIF UPDATING THEN
        INSERT INTO log_auditoria (id, usuario, operacao, descricao, data_operacao)
        VALUES (sys_guid(), USER, 'UPDATE', 'Agente atualizado: ' || :NEW.nome_completo, SYSTIMESTAMP);
    ELSIF DELETING THEN
        INSERT INTO log_auditoria (id, usuario, operacao, descricao, data_operacao)
        VALUES (sys_guid(), USER, 'DELETE', 'Agente removido: ' || :OLD.nome_completo, SYSTIMESTAMP);
    END IF;
END;
/

-- Criar view para relatórios
CREATE OR REPLACE VIEW vw_agentes_por_comarca AS
SELECT 
    c.nome_comarca,
    COUNT(ac.agente_id) as total_agentes,
    SUM(CASE WHEN av.status = 'ATIVO' THEN 1 ELSE 0 END) as agentes_ativos,
    SUM(CASE WHEN av.status = 'INATIVO' THEN 1 ELSE 0 END) as agentes_inativos,
    SUM(CASE WHEN av.status = 'EM_ANALISE' THEN 1 ELSE 0 END) as agentes_em_analise
FROM comarca c
LEFT JOIN agente_comarca ac ON c.id = ac.comarca_id
LEFT JOIN agente_voluntario av ON ac.agente_id = av.id
GROUP BY c.nome_comarca
ORDER BY total_agentes DESC;

-- Criar view para estatísticas de credenciais
CREATE OR REPLACE VIEW vw_estatisticas_credenciais AS
SELECT 
    COUNT(*) as total_credenciais,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) as credenciais_ano_atual,
    COUNT(CASE WHEN EXTRACT(MONTH FROM data_emissao) = EXTRACT(MONTH FROM SYSDATE) 
               AND EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) as credenciais_mes_atual
FROM credencial;

COMMIT;

