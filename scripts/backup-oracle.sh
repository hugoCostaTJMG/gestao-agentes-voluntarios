#!/bin/bash

# Script de Backup para Oracle Database - Sistema de Agentes Voluntários v2.0
# Compatível com Oracle Cloud Infrastructure (OCI)
# Autor: Equipe de Desenvolvimento TJMG
# Data: 17/06/2025

set -e

# Configurações
BACKUP_DIR="/opt/backups/agentes-voluntarios"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Variáveis do Oracle Database
ORACLE_HOME="${ORACLE_HOME:-/opt/oracle/product/19c/dbhome_1}"
ORACLE_SID="${ORACLE_SID:-ORCL}"
ORACLE_DB_HOST="${ORACLE_DB_HOST:-localhost}"
ORACLE_DB_PORT="${ORACLE_DB_PORT:-1521}"
ORACLE_DB_SERVICE="${ORACLE_DB_SERVICE:-ORCL}"
ORACLE_DB_USER="${ORACLE_DB_USER:-agentes_user}"
ORACLE_DB_PASSWORD="${ORACLE_DB_PASSWORD:-agentes_pass}"

# Configurações OCI (se disponível)
OCI_BUCKET_NAME="${OCI_BUCKET_NAME:-agentes-backups}"
OCI_REGION="${OCI_REGION:-sa-saopaulo-1}"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

echo "=== Iniciando Backup Oracle Database - $DATE ==="

# Função para executar SQL no Oracle
execute_sql() {
    local sql="$1"
    sqlplus -s "${ORACLE_DB_USER}/${ORACLE_DB_PASSWORD}@${ORACLE_DB_HOST}:${ORACLE_DB_PORT}/${ORACLE_DB_SERVICE}" <<EOF
SET PAGESIZE 0
SET FEEDBACK OFF
SET HEADING OFF
SET ECHO OFF
$sql
EXIT;
EOF
}

# Função para backup usando Data Pump
backup_with_datapump() {
    echo "Fazendo backup com Oracle Data Pump..."
    
    local dump_file="agentes_backup_${DATE}.dmp"
    local log_file="agentes_backup_${DATE}.log"
    local par_file="agentes_backup_${DATE}.par"
    
    # Criar arquivo de parâmetros para Data Pump
    cat > "$BACKUP_DIR/$par_file" <<EOF
USERID=${ORACLE_DB_USER}/${ORACLE_DB_PASSWORD}@${ORACLE_DB_HOST}:${ORACLE_DB_PORT}/${ORACLE_DB_SERVICE}
DIRECTORY=DATA_PUMP_DIR
DUMPFILE=${dump_file}
LOGFILE=${log_file}
SCHEMAS=${ORACLE_DB_USER}
COMPRESSION=ALL
PARALLEL=2
EOF

    # Executar Data Pump Export
    expdp parfile="$BACKUP_DIR/$par_file"
    
    # Mover arquivos para diretório de backup
    if [ -f "${ORACLE_HOME}/admin/${ORACLE_SID}/dpdump/${dump_file}" ]; then
        mv "${ORACLE_HOME}/admin/${ORACLE_SID}/dpdump/${dump_file}" "$BACKUP_DIR/"
        mv "${ORACLE_HOME}/admin/${ORACLE_SID}/dpdump/${log_file}" "$BACKUP_DIR/"
    fi
    
    # Comprimir dump
    gzip "$BACKUP_DIR/$dump_file"
    
    echo "Backup Data Pump concluído: ${dump_file}.gz"
}

# Função para backup usando SQL tradicional
backup_with_sql() {
    echo "Fazendo backup com SQL tradicional..."
    
    local sql_file="agentes_backup_${DATE}.sql"
    
    # Script SQL para backup
    cat > "$BACKUP_DIR/$sql_file" <<EOF
-- Backup do Sistema de Agentes Voluntários
-- Data: $DATE
-- Usuário: $ORACLE_DB_USER

SET PAGESIZE 0
SET LINESIZE 1000
SET FEEDBACK OFF
SET HEADING OFF
SET ECHO OFF
SET TRIMSPOOL ON

SPOOL $BACKUP_DIR/agentes_data_${DATE}.sql

-- Backup das tabelas principais
SELECT 'INSERT INTO agente_voluntario VALUES (' ||
       '''' || id || ''',' ||
       '''' || nome_completo || ''',' ||
       '''' || cpf || ''',' ||
       CASE WHEN rg IS NULL THEN 'NULL' ELSE '''' || rg || '''' END || ',' ||
       '''' || email || ''',' ||
       '''' || telefone || ''',' ||
       '''' || endereco || ''',' ||
       'TO_DATE(''' || TO_CHAR(data_nascimento, 'YYYY-MM-DD') || ''', ''YYYY-MM-DD''),' ||
       '''' || nacionalidade || ''',' ||
       '''' || naturalidade || ''',' ||
       '''' || uf || ''',' ||
       '''' || numero_ci || ''',' ||
       'TO_DATE(''' || TO_CHAR(data_expedicao_ci, 'YYYY-MM-DD') || ''', ''YYYY-MM-DD''),' ||
       CASE WHEN filiacao_pai IS NULL THEN 'NULL' ELSE '''' || filiacao_pai || '''' END || ',' ||
       CASE WHEN filiacao_mae IS NULL THEN 'NULL' ELSE '''' || filiacao_mae || '''' END || ',' ||
       CASE WHEN foto_path IS NULL THEN 'NULL' ELSE '''' || foto_path || '''' END || ',' ||
       '''' || status || ''',' ||
       'TO_TIMESTAMP(''' || TO_CHAR(data_cadastro, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS''),' ||
       CASE WHEN data_atualizacao IS NULL THEN 'NULL' ELSE 'TO_TIMESTAMP(''' || TO_CHAR(data_atualizacao, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS'')' END || ',' ||
       '''' || usuario_cadastro || ''',' ||
       CASE WHEN usuario_atualizacao IS NULL THEN 'NULL' ELSE '''' || usuario_atualizacao || '''' END ||
       ');'
FROM agente_voluntario;

-- Backup de autos de infração
SELECT 'INSERT INTO auto_infracao VALUES (' ||
       '''' || id || ''',' ||
       '''' || agente_id || ''',' ||
       comarca_id || ',' ||
       '''' || nome_autuado || ''',' ||
       '''' || cpf_cnpj_autuado || ''',' ||
       '''' || endereco_autuado || ''',' ||
       '''' || contato_autuado || ''',' ||
       '''' || nome_agente || ''',' ||
       '''' || matricula_agente || ''',' ||
       '''' || base_legal || ''',' ||
       'TO_DATE(''' || TO_CHAR(data_infracao, 'YYYY-MM-DD') || ''', ''YYYY-MM-DD''),' ||
       '''' || TO_CHAR(hora_infracao, 'HH24:MI:SS') || ''',' ||
       '''' || local_infracao || ''',' ||
       '''' || REPLACE(descricao_conduta, '''', '''''') || ''',' ||
       CASE WHEN iniciais_crianca IS NULL THEN 'NULL' ELSE '''' || iniciais_crianca || '''' END || ',' ||
       CASE WHEN idade_crianca IS NULL THEN 'NULL' ELSE idade_crianca END || ',' ||
       CASE WHEN sexo_crianca IS NULL THEN 'NULL' ELSE '''' || sexo_crianca || '''' END || ',' ||
       CASE WHEN nome_testemunha IS NULL THEN 'NULL' ELSE '''' || nome_testemunha || '''' END || ',' ||
       CASE WHEN cpf_testemunha IS NULL THEN 'NULL' ELSE '''' || cpf_testemunha || '''' END || ',' ||
       CASE WHEN assinatura_autuado IS NULL THEN 'NULL' ELSE CASE WHEN assinatura_autuado = 1 THEN '1' ELSE '0' END END || ',' ||
       '''' || status || ''',' ||
       'TO_TIMESTAMP(''' || TO_CHAR(data_cadastro, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS''),' ||
       CASE WHEN data_atualizacao IS NULL THEN 'NULL' ELSE 'TO_TIMESTAMP(''' || TO_CHAR(data_atualizacao, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS'')' END || ',' ||
       '''' || usuario_cadastro || ''',' ||
       CASE WHEN usuario_atualizacao IS NULL THEN 'NULL' ELSE '''' || usuario_atualizacao || '''' END || ',' ||
       CASE WHEN data_cancelamento IS NULL THEN 'NULL' ELSE 'TO_TIMESTAMP(''' || TO_CHAR(data_cancelamento, 'YYYY-MM-DD HH24:MI:SS') || ''', ''YYYY-MM-DD HH24:MI:SS'')' END || ',' ||
       CASE WHEN usuario_cancelamento IS NULL THEN 'NULL' ELSE '''' || usuario_cancelamento || '''' END || ',' ||
       CASE WHEN justificativa_cancelamento IS NULL THEN 'NULL' ELSE '''' || REPLACE(justificativa_cancelamento, '''', '''''') || '''' END ||
       ');'
FROM auto_infracao;

SPOOL OFF

EXIT;
EOF

    # Executar backup SQL
    sqlplus -s "${ORACLE_DB_USER}/${ORACLE_DB_PASSWORD}@${ORACLE_DB_HOST}:${ORACLE_DB_PORT}/${ORACLE_DB_SERVICE}" @"$BACKUP_DIR/$sql_file"
    
    # Comprimir arquivo SQL
    gzip "$BACKUP_DIR/agentes_data_${DATE}.sql"
    
    echo "Backup SQL concluído: agentes_data_${DATE}.sql.gz"
}

# Backup dos arquivos de upload
backup_uploads() {
    echo "Fazendo backup dos arquivos de upload..."
    
    local uploads_dir="/opt/agentes-voluntarios/uploads"
    
    if [ -d "$uploads_dir" ]; then
        tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" \
            -C "$(dirname $uploads_dir)" "$(basename $uploads_dir)"
        echo "Backup dos uploads concluído: uploads_$DATE.tar.gz"
    else
        echo "Diretório de uploads não encontrado: $uploads_dir"
    fi
}

# Backup das configurações
backup_configs() {
    echo "Fazendo backup das configurações..."
    
    local config_files=(
        "/opt/agentes-voluntarios/.env"
        "/opt/agentes-voluntarios/k8s"
        "/etc/oracle/tnsnames.ora"
    )
    
    tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
        --ignore-failed-read \
        "${config_files[@]}" 2>/dev/null || true
    
    echo "Backup das configurações concluído: config_$DATE.tar.gz"
}

# Upload para OCI Object Storage (se configurado)
upload_to_oci() {
    if command -v oci &> /dev/null && [ -n "$OCI_BUCKET_NAME" ]; then
        echo "Enviando backups para OCI Object Storage..."
        
        for file in "$BACKUP_DIR"/*_$DATE.*; do
            if [ -f "$file" ]; then
                local filename=$(basename "$file")
                oci os object put \
                    --bucket-name "$OCI_BUCKET_NAME" \
                    --file "$file" \
                    --name "agentes-voluntarios/$filename" \
                    --region "$OCI_REGION" || true
            fi
        done
        
        echo "Upload para OCI concluído!"
    else
        echo "OCI CLI não configurado ou bucket não especificado, pulando upload..."
    fi
}

# Limpeza de backups antigos
cleanup_old_backups() {
    echo "Removendo backups antigos (>$RETENTION_DAYS dias)..."
    
    find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.dmp" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.log" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.par" -mtime +$RETENTION_DAYS -delete
    
    echo "Limpeza concluída!"
}

# Verificação de integridade
verify_backups() {
    echo "Verificando integridade dos backups..."
    
    for file in "$BACKUP_DIR"/*_$DATE.*.gz; do
        if [ -f "$file" ]; then
            if gzip -t "$file"; then
                echo "✓ $file - OK"
            else
                echo "✗ $file - CORROMPIDO"
                exit 1
            fi
        fi
    done
    
    echo "Verificação de integridade concluída!"
}

# Relatório do backup
generate_report() {
    local backup_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    local backup_count=$(find "$BACKUP_DIR" -name "*_$DATE.*" | wc -l)
    
    echo "=== Relatório do Backup - $DATE ==="
    echo "Tamanho total dos backups: $backup_size"
    echo "Arquivos criados: $backup_count"
    echo "Localização: $BACKUP_DIR"
    echo "Retenção: $RETENTION_DAYS dias"
    
    # Log do backup
    echo "$DATE - Backup concluído com sucesso ($backup_count arquivos, $backup_size)" >> "$BACKUP_DIR/backup.log"
}

# Função principal
main() {
    # Verificar se Oracle está disponível
    if ! command -v sqlplus &> /dev/null; then
        echo "ERRO: Oracle SQL*Plus não encontrado. Verifique ORACLE_HOME."
        exit 1
    fi
    
    # Tentar Data Pump primeiro, fallback para SQL
    if command -v expdp &> /dev/null; then
        backup_with_datapump
    else
        echo "Data Pump não disponível, usando backup SQL..."
        backup_with_sql
    fi
    
    backup_uploads
    backup_configs
    upload_to_oci
    cleanup_old_backups
    verify_backups
    generate_report
    
    echo "=== Backup finalizado com sucesso! ==="
}

# Executar função principal
main "$@"

