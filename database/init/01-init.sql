-- Script de inicialização simplificado
-- Sistema de Gestão de Agentes Voluntários

CREATE USER agentes_user IDENTIFIED BY agentes_pass;
GRANT CONNECT, RESOURCE, CREATE SESSION, CREATE TABLE, CREATE VIEW,
      CREATE PROCEDURE, CREATE TRIGGER TO agentes_user;
ALTER USER agentes_user QUOTA UNLIMITED ON USERS;

CONNECT agentes_user/agentes_pass;

-- Índices para performance
CREATE INDEX idx_agente_cpf ON agente_voluntario(cpf);
CREATE INDEX idx_agente_status ON agente_voluntario(status);
CREATE INDEX idx_credencial_agente ON credencial(id_agente);
CREATE INDEX idx_log_usuario ON log_auditoria(usuario);
CREATE INDEX idx_log_data ON log_auditoria(data_hora);

-- Trigger de auditoria de agentes
CREATE OR REPLACE TRIGGER trg_agente_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON agente_voluntario
    FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO log_auditoria (id_log, usuario, tipo_operacao, detalhes)
        VALUES (SYS_GUID(), USER, 'INSERT',
                'Novo agente cadastrado: ' || :NEW.nome_completo);
    ELSIF UPDATING THEN
        INSERT INTO log_auditoria (id_log, usuario, tipo_operacao, detalhes)
        VALUES (SYS_GUID(), USER, 'UPDATE',
                'Agente atualizado: ' || :NEW.nome_completo);
    ELSIF DELETING THEN
        INSERT INTO log_auditoria (id_log, usuario, tipo_operacao, detalhes)
        VALUES (SYS_GUID(), USER, 'DELETE',
                'Agente removido: ' || :OLD.nome_completo);
    END IF;
END;
/

-- Views
CREATE OR REPLACE VIEW vw_agentes_por_comarca AS
SELECT
    c.nome_comarca,
    COUNT(ac.id_agente) AS total_agentes,
    SUM(CASE WHEN av.status = 'ATIVO' THEN 1 ELSE 0 END) AS agentes_ativos,
    SUM(CASE WHEN av.status = 'INATIVO' THEN 1 ELSE 0 END) AS agentes_inativos,
    SUM(CASE WHEN av.status = 'EM_ANALISE' THEN 1 ELSE 0 END) AS agentes_em_analise
FROM comarca c
LEFT JOIN agente_comarca ac ON c.id_comarca = ac.id_comarca
LEFT JOIN agente_voluntario av ON ac.id_agente = av.id_agente
GROUP BY c.nome_comarca
ORDER BY total_agentes DESC;

CREATE OR REPLACE VIEW vw_estatisticas_credenciais AS
SELECT
    COUNT(*) AS total_credenciais,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) AS credenciais_ano_atual,
    COUNT(CASE WHEN EXTRACT(MONTH FROM data_emissao) = EXTRACT(MONTH FROM SYSDATE)
               AND EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM SYSDATE) THEN 1 END) AS credenciais_mes_atual
FROM credencial;

COMMIT;
