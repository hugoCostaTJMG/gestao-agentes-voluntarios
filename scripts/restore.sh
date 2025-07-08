#!/bin/bash

# Script de Restore - Sistema de Agentes Voluntários v2.0
# Autor: Equipe de Desenvolvimento
# Data: 17/06/2025

set -e

# Verificar parâmetros
if [ $# -ne 1 ]; then
    echo "Uso: $0 <data_backup>"
    echo "Exemplo: $0 20250617_143000"
    echo ""
    echo "Backups disponíveis:"
    ls -la /opt/backups/agentes-voluntarios/ | grep -E "database_.*\.sql\.gz"
    exit 1
fi

BACKUP_DATE="$1"
BACKUP_DIR="/opt/backups/agentes-voluntarios"

# Variáveis do banco
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-agentes_voluntarios}"
DB_USER="${DB_USER:-agentes_user}"

echo "=== Iniciando Restore - $BACKUP_DATE ==="

# Verificar se os arquivos de backup existem
DATABASE_BACKUP="$BACKUP_DIR/database_$BACKUP_DATE.sql.gz"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_$BACKUP_DATE.tar.gz"
CONFIG_BACKUP="$BACKUP_DIR/config_$BACKUP_DATE.tar.gz"

if [ ! -f "$DATABASE_BACKUP" ]; then
    echo "Erro: Backup do banco não encontrado: $DATABASE_BACKUP"
    exit 1
fi

# Confirmação
echo "ATENÇÃO: Esta operação irá substituir os dados atuais!"
echo "Backup do banco: $DATABASE_BACKUP"
echo "Backup dos uploads: $UPLOADS_BACKUP"
echo "Backup das configurações: $CONFIG_BACKUP"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

# 1. Parar aplicação
echo "Parando aplicação..."
if command -v docker-compose &> /dev/null; then
    cd /opt/agentes-voluntarios
    docker-compose down
fi

# 2. Backup de segurança dos dados atuais
echo "Criando backup de segurança dos dados atuais..."
SAFETY_BACKUP="/tmp/agentes_safety_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$SAFETY_BACKUP"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-password > "$SAFETY_BACKUP/database_current.sql" || true

if [ -d "/opt/agentes-voluntarios/uploads" ]; then
    cp -r "/opt/agentes-voluntarios/uploads" "$SAFETY_BACKUP/" || true
fi

echo "Backup de segurança criado em: $SAFETY_BACKUP"

# 3. Restore do banco de dados
echo "Restaurando banco de dados..."

# Descomprimir backup
gunzip -c "$DATABASE_BACKUP" > "/tmp/restore_$BACKUP_DATE.sql"

# Dropar conexões ativas
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';" || true

# Restaurar banco
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    < "/tmp/restore_$BACKUP_DATE.sql"

# Limpar arquivo temporário
rm "/tmp/restore_$BACKUP_DATE.sql"

echo "Banco de dados restaurado com sucesso!"

# 4. Restore dos uploads
if [ -f "$UPLOADS_BACKUP" ]; then
    echo "Restaurando arquivos de upload..."
    
    # Backup dos uploads atuais
    if [ -d "/opt/agentes-voluntarios/uploads" ]; then
        mv "/opt/agentes-voluntarios/uploads" "$SAFETY_BACKUP/uploads_current" || true
    fi
    
    # Restaurar uploads
    cd "/opt/agentes-voluntarios"
    tar -xzf "$UPLOADS_BACKUP"
    
    echo "Arquivos de upload restaurados!"
else
    echo "Backup de uploads não encontrado, pulando..."
fi

# 5. Restore das configurações
if [ -f "$CONFIG_BACKUP" ]; then
    echo "Restaurando configurações..."
    
    # Backup das configurações atuais
    cp .env "$SAFETY_BACKUP/.env_current" 2>/dev/null || true
    cp docker-compose.yml "$SAFETY_BACKUP/docker-compose_current.yml" 2>/dev/null || true
    
    # Restaurar configurações (com cuidado)
    tar -xzf "$CONFIG_BACKUP" --exclude=".env" --exclude="docker-compose.yml"
    
    echo "Configurações restauradas (exceto .env e docker-compose.yml)!"
    echo "Verifique manualmente se as configurações precisam ser atualizadas."
else
    echo "Backup de configurações não encontrado, pulando..."
fi

# 6. Ajustar permissões
echo "Ajustando permissões..."
if [ -d "/opt/agentes-voluntarios/uploads" ]; then
    chown -R 1000:1000 "/opt/agentes-voluntarios/uploads"
    chmod -R 755 "/opt/agentes-voluntarios/uploads"
fi

# 7. Reiniciar aplicação
echo "Reiniciando aplicação..."
if command -v docker-compose &> /dev/null; then
    cd /opt/agentes-voluntarios
    docker-compose up -d
    
    # Aguardar inicialização
    echo "Aguardando inicialização da aplicação..."
    sleep 30
    
    # Verificar saúde da aplicação
    if curl -f -s http://localhost:8080/health > /dev/null; then
        echo "✓ Aplicação iniciada com sucesso!"
    else
        echo "⚠ Aplicação pode não ter iniciado corretamente. Verifique os logs."
    fi
fi

# 8. Verificação final
echo "Executando verificações finais..."

# Verificar conectividade com banco
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null; then
    echo "✓ Conexão com banco de dados OK"
else
    echo "✗ Problema na conexão com banco de dados"
fi

# Verificar arquivos de upload
if [ -d "/opt/agentes-voluntarios/uploads" ]; then
    UPLOAD_COUNT=$(find "/opt/agentes-voluntarios/uploads" -type f | wc -l)
    echo "✓ Arquivos de upload: $UPLOAD_COUNT arquivos"
fi

echo "=== Restore Concluído - $BACKUP_DATE ==="
echo ""
echo "IMPORTANTE:"
echo "- Backup de segurança dos dados atuais: $SAFETY_BACKUP"
echo "- Verifique se a aplicação está funcionando corretamente"
echo "- Teste as funcionalidades principais"
echo "- Em caso de problemas, use o backup de segurança para reverter"
echo ""
echo "Para reverter este restore:"
echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $SAFETY_BACKUP/database_current.sql"

