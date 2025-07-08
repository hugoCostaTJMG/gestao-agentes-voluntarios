#!/bin/bash

# Script de Backup - Sistema de Agentes Voluntários v2.0
# Autor: Equipe de Desenvolvimento
# Data: 17/06/2025

set -e

# Configurações
BACKUP_DIR="/opt/backups/agentes-voluntarios"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Variáveis do banco
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-agentes_voluntarios}"
DB_USER="${DB_USER:-agentes_user}"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

echo "=== Iniciando Backup - $DATE ==="

# 1. Backup do Banco de Dados
echo "Fazendo backup do banco de dados..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-password --verbose --clean --if-exists \
    > "$BACKUP_DIR/database_$DATE.sql"

# Comprimir backup do banco
gzip "$BACKUP_DIR/database_$DATE.sql"
echo "Backup do banco concluído: database_$DATE.sql.gz"

# 2. Backup dos Arquivos de Upload
echo "Fazendo backup dos arquivos de upload..."
if [ -d "/opt/agentes-voluntarios/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" \
        -C "/opt/agentes-voluntarios" uploads/
    echo "Backup dos uploads concluído: uploads_$DATE.tar.gz"
fi

# 3. Backup das Configurações
echo "Fazendo backup das configurações..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    -C "/opt/agentes-voluntarios" \
    .env docker-compose.yml \
    --exclude="*.log" --exclude="node_modules" \
    --exclude="target" --exclude="dist" 2>/dev/null || true
echo "Backup das configurações concluído: config_$DATE.tar.gz"

# 4. Backup dos Logs (últimos 7 dias)
echo "Fazendo backup dos logs..."
if [ -d "/var/log/agentes" ]; then
    find /var/log/agentes -name "*.log" -mtime -7 -exec \
        tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" {} + 2>/dev/null || true
    echo "Backup dos logs concluído: logs_$DATE.tar.gz"
fi

# 5. Limpeza de backups antigos
echo "Removendo backups antigos (>$RETENTION_DAYS dias)..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete

# 6. Relatório do backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "=== Backup Concluído - $DATE ==="
echo "Tamanho total dos backups: $BACKUP_SIZE"
echo "Localização: $BACKUP_DIR"

# 7. Verificação de integridade
echo "Verificando integridade dos backups..."
for file in "$BACKUP_DIR"/*_$DATE.*; do
    if [ -f "$file" ]; then
        if [[ "$file" == *.gz ]]; then
            if gzip -t "$file"; then
                echo "✓ $file - OK"
            else
                echo "✗ $file - CORROMPIDO"
                exit 1
            fi
        fi
    fi
done

# 8. Log do backup
echo "$DATE - Backup concluído com sucesso" >> "$BACKUP_DIR/backup.log"

echo "=== Backup finalizado com sucesso! ==="

