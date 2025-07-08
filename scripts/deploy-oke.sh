#!/bin/bash

# Script de Deploy para Oracle Kubernetes Engine (OKE)
# Sistema de Gestão de Agentes Voluntários v2.0
# Compatível com Oracle Cloud Infrastructure (OCI)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl não encontrado. Instale o kubectl primeiro."
    fi
    
    # Verificar oci-cli
    if ! command -v oci &> /dev/null; then
        error "OCI CLI não encontrado. Instale o OCI CLI primeiro."
    fi
    
    # Verificar docker
    if ! command -v docker &> /dev/null; then
        error "Docker não encontrado. Instale o Docker primeiro."
    fi
    
    # Verificar conexão com cluster OKE
    if ! kubectl cluster-info &> /dev/null; then
        error "Não foi possível conectar ao cluster OKE. Verifique o kubeconfig."
    fi
    
    log "Pré-requisitos verificados com sucesso!"
}

# Configurar variáveis de ambiente
setup_environment() {
    log "Configurando variáveis de ambiente..."
    
    # Variáveis OCI
    export OCI_REGION=${OCI_REGION:-"sa-saopaulo-1"}
    export OCI_COMPARTMENT_ID=${OCI_COMPARTMENT_ID:-""}
    export OCI_TENANCY_ID=${OCI_TENANCY_ID:-""}
    
    # Variáveis do projeto
    export PROJECT_NAME="agentes-voluntarios"
    export NAMESPACE="agentes-voluntarios"
    export VERSION=${VERSION:-"2.0"}
    
    # Registry OCI
    export OCI_REGISTRY="${OCI_REGION}.ocir.io"
    export OCI_REGISTRY_NAMESPACE=${OCI_REGISTRY_NAMESPACE:-""}
    export IMAGE_BACKEND="${OCI_REGISTRY}/${OCI_REGISTRY_NAMESPACE}/${PROJECT_NAME}/backend:${VERSION}"
    export IMAGE_FRONTEND="${OCI_REGISTRY}/${OCI_REGISTRY_NAMESPACE}/${PROJECT_NAME}/frontend:${VERSION}"
    
    # Verificar variáveis obrigatórias
    if [[ -z "$OCI_COMPARTMENT_ID" ]]; then
        error "OCI_COMPARTMENT_ID não definido"
    fi
    
    if [[ -z "$OCI_REGISTRY_NAMESPACE" ]]; then
        error "OCI_REGISTRY_NAMESPACE não definido"
    fi
    
    log "Variáveis de ambiente configuradas!"
}

# Build das imagens Docker
build_images() {
    log "Construindo imagens Docker..."
    
    # Build do backend
    log "Construindo imagem do backend..."
    cd backend
    docker build -t $IMAGE_BACKEND .
    cd ..
    
    # Build do frontend
    log "Construindo imagem do frontend..."
    cd frontend/agentes-frontend
    docker build -t $IMAGE_FRONTEND .
    cd ../..
    
    log "Imagens construídas com sucesso!"
}

# Push das imagens para OCI Registry
push_images() {
    log "Fazendo push das imagens para OCI Registry..."
    
    # Login no OCI Registry
    log "Fazendo login no OCI Registry..."
    docker login $OCI_REGISTRY -u "${OCI_REGISTRY_NAMESPACE}/oracleidentitycloudservice/${OCI_USERNAME}" -p "${OCI_AUTH_TOKEN}"
    
    # Push das imagens
    log "Enviando imagem do backend..."
    docker push $IMAGE_BACKEND
    
    log "Enviando imagem do frontend..."
    docker push $IMAGE_FRONTEND
    
    log "Imagens enviadas com sucesso!"
}

# Criar namespace se não existir
create_namespace() {
    log "Criando namespace se necessário..."
    
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        kubectl create namespace $NAMESPACE
        log "Namespace $NAMESPACE criado!"
    else
        log "Namespace $NAMESPACE já existe!"
    fi
}

# Criar secrets
create_secrets() {
    log "Criando secrets..."
    
    # Secret para credenciais do banco
    kubectl create secret generic agentes-secrets \
        --namespace=$NAMESPACE \
        --from-literal=ORACLE_DB_USER="${ORACLE_DB_USER}" \
        --from-literal=ORACLE_DB_PASSWORD="${ORACLE_DB_PASSWORD}" \
        --from-literal=GOVBR_CLIENT_ID="${GOVBR_CLIENT_ID}" \
        --from-literal=GOVBR_CLIENT_SECRET="${GOVBR_CLIENT_SECRET}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Secret para configuração OCI
    if [[ -f "$HOME/.oci/config" ]]; then
        kubectl create secret generic oci-config-secret \
            --namespace=$NAMESPACE \
            --from-file=config="$HOME/.oci/config" \
            --from-file=key="$HOME/.oci/oci_api_key.pem" \
            --dry-run=client -o yaml | kubectl apply -f -
    fi
    
    log "Secrets criados!"
}

# Deploy da aplicação
deploy_application() {
    log "Fazendo deploy da aplicação..."
    
    # Substituir variáveis no arquivo de deployment
    envsubst < k8s/oke-deployment.yaml > k8s/oke-deployment-processed.yaml
    
    # Aplicar configurações
    kubectl apply -f k8s/oke-deployment-processed.yaml
    
    # Aguardar deployment
    log "Aguardando deployment do backend..."
    kubectl rollout status deployment/agentes-backend -n $NAMESPACE --timeout=600s
    
    log "Aguardando deployment do frontend..."
    kubectl rollout status deployment/agentes-frontend -n $NAMESPACE --timeout=300s
    
    log "Deploy concluído com sucesso!"
}

# Verificar saúde da aplicação
check_health() {
    log "Verificando saúde da aplicação..."
    
    # Aguardar pods ficarem prontos
    kubectl wait --for=condition=ready pod -l app=agentes-backend -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=agentes-frontend -n $NAMESPACE --timeout=300s
    
    # Verificar endpoints
    BACKEND_POD=$(kubectl get pods -n $NAMESPACE -l app=agentes-backend -o jsonpath='{.items[0].metadata.name}')
    
    if kubectl exec -n $NAMESPACE $BACKEND_POD -- curl -f http://localhost:8080/actuator/health &> /dev/null; then
        log "✅ Backend está saudável!"
    else
        warn "⚠️ Backend pode não estar respondendo corretamente"
    fi
    
    # Mostrar status dos pods
    log "Status dos pods:"
    kubectl get pods -n $NAMESPACE
    
    # Mostrar serviços
    log "Serviços:"
    kubectl get services -n $NAMESPACE
    
    # Mostrar ingress
    log "Ingress:"
    kubectl get ingress -n $NAMESPACE
}

# Configurar monitoramento
setup_monitoring() {
    log "Configurando monitoramento..."
    
    # ServiceMonitor para Prometheus (se disponível)
    cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: agentes-backend-monitor
  namespace: $NAMESPACE
  labels:
    app: agentes-backend
spec:
  selector:
    matchLabels:
      app: agentes-backend
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 30s
EOF
    
    log "Monitoramento configurado!"
}

# Função principal
main() {
    log "🚀 Iniciando deploy no Oracle Kubernetes Engine (OKE)"
    log "Projeto: $PROJECT_NAME v$VERSION"
    log "Namespace: $NAMESPACE"
    log "Região OCI: $OCI_REGION"
    
    check_prerequisites
    setup_environment
    
    # Perguntar se deve fazer build das imagens
    read -p "Fazer build e push das imagens? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_images
        push_images
    fi
    
    create_namespace
    create_secrets
    deploy_application
    check_health
    setup_monitoring
    
    log "🎉 Deploy concluído com sucesso!"
    log ""
    log "📋 Próximos passos:"
    log "1. Verificar se o DNS está apontando para o Load Balancer"
    log "2. Configurar certificados SSL se necessário"
    log "3. Testar a aplicação em https://agentes.tjmg.jus.br"
    log "4. Configurar backup do banco de dados Oracle"
    log "5. Configurar alertas de monitoramento"
    log ""
    log "📊 Para monitorar a aplicação:"
    log "kubectl get pods -n $NAMESPACE"
    log "kubectl logs -f deployment/agentes-backend -n $NAMESPACE"
    log "kubectl logs -f deployment/agentes-frontend -n $NAMESPACE"
}

# Verificar se está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

