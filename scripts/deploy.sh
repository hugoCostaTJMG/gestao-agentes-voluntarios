#!/bin/bash

# Script de deploy para ambiente de produção
# Sistema de Gestão de Agentes Voluntários

set -e

echo "🚀 Iniciando deploy do Sistema de Agentes Voluntários..."

# Verificar se Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verificar variáveis de ambiente necessárias
if [ -z "$GOVBR_CLIENT_ID" ]; then
    echo "⚠️  GOVBR_CLIENT_ID não definido. Usando valor padrão para desenvolvimento."
    export GOVBR_CLIENT_ID="seu-client-id"
fi

if [ -z "$GOVBR_CLIENT_SECRET" ]; then
    echo "⚠️  GOVBR_CLIENT_SECRET não definido. Usando valor padrão para desenvolvimento."
    export GOVBR_CLIENT_SECRET="seu-client-secret"
fi

if [ -z "$GOVBR_REDIRECT_URI" ]; then
    echo "⚠️  GOVBR_REDIRECT_URI não definido. Usando valor padrão para desenvolvimento."
    export GOVBR_REDIRECT_URI="http://localhost:4200/auth/govbr/callback"
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover imagens antigas (opcional)
read -p "🗑️  Deseja remover imagens antigas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Removendo imagens antigas..."
    docker-compose down --rmi all
fi

# Build e start dos containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

# Verificar saúde dos serviços
echo "🏥 Verificando saúde dos serviços..."

# Backend
echo "🔍 Verificando backend..."
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend está funcionando"
else
    echo "❌ Backend não está respondendo"
fi

# Frontend
echo "🔍 Verificando frontend..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend está funcionando"
else
    echo "❌ Frontend não está respondendo"
fi


echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📋 URLs dos serviços:"
echo "   Frontend:    http://localhost:80"
echo "   Backend:     http://localhost:8080"
echo ""
echo "🔑 Credenciais padrão:"
echo "   Grafana Admin:  admin / admin123"
echo "   Oracle DB:      system / OraclePassword123"
echo ""
echo "📚 Para mais informações, consulte a documentação em docs/"

