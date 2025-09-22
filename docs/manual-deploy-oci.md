# Manual de Deploy - Oracle Cloud Infrastructure (OCI)
## Sistema de Gestão de Agentes Voluntários v2.0

### 📋 Visão Geral

Este manual contém as instruções completas para deploy do Sistema de Gestão de Agentes Voluntários no Oracle Cloud Infrastructure (OCI), utilizando Oracle Kubernetes Engine (OKE) e Oracle Database, conforme RNF008.

## 🏗️ Arquitetura OCI

### Componentes Principais:
- **Compute:** Oracle Kubernetes Engine (OKE)
- **Database:** Oracle Autonomous Database ou Oracle Database Cloud Service
- **Storage:** OCI Object Storage para anexos
- **Security:** OCI Vault para secrets
- **Networking:** Load Balancer e VCN
- **Monitoring:** OCI Monitoring

## 📦 Pré-requisitos OCI

### 1. Recursos OCI Necessários:
```bash
# Compartment dedicado
oci iam compartment create --name "agentes-voluntarios" --description "Sistema Agentes Voluntários"

# VCN (Virtual Cloud Network)
oci network vcn create --compartment-id <compartment-id> --display-name "agentes-vcn" --cidr-block "10.0.0.0/16"

# Cluster OKE
oci ce cluster create --name "agentes-oke" --kubernetes-version "v1.28.2"

# Oracle Database (Autonomous ou Database Cloud Service)
oci db autonomous-database create --display-name "agentes-db" --db-name "AGENTESDB"
```

### 2. Ferramentas Necessárias:
```bash
# OCI CLI
curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh | bash

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Docker
sudo yum install docker-ce docker-ce-cli containerd.io

# Helm (opcional)
curl https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz | tar xz
```

### 3. Configuração OCI CLI:
```bash
# Configurar OCI CLI
oci setup config

# Testar configuração
oci iam region list
```

## 🚀 Deploy no Oracle Kubernetes Engine (OKE)

### 1. Preparação do Ambiente

```bash
# Clonar/extrair o projeto
cd /opt
unzip sistema-agentes-voluntarios-v2.0-oci.zip
cd sistema-agentes-voluntarios

# Configurar kubeconfig para OKE
oci ce cluster create-kubeconfig --cluster-id <cluster-id> --file ~/.kube/config --region sa-saopaulo-1

# Verificar conectividade
kubectl cluster-info
```

### 2. Configuração de Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.oci.example .env

# Editar configurações OCI
nano .env
```

**Configurações principais no .env:**
```env
# OCI Configuration
OCI_REGION=sa-saopaulo-1
OCI_COMPARTMENT_ID=ocid1.compartment.oc1..aaaa...
OCI_TENANCY_ID=ocid1.tenancy.oc1..aaaa...
OCI_USER_ID=ocid1.user.oc1..aaaa...
OCI_FINGERPRINT=aa:bb:cc:dd:ee:ff:gg:hh:ii:jj:kk:ll:mm:nn:oo:pp
OCI_PRIVATE_KEY_PATH=/home/user/.oci/oci_api_key.pem

# OCI Registry
OCI_REGISTRY_NAMESPACE=axhheqi2ofpb
OCI_USERNAME=oracleidentitycloudservice/user@domain.com
OCI_AUTH_TOKEN=your-auth-token

# Oracle Database
ORACLE_DB_HOST=agentes-db.sub12345678901.agentesvcn.oraclevcn.com
ORACLE_DB_PORT=1521
ORACLE_DB_SERVICE=AGENTESDB_HIGH
ORACLE_DB_USER=agentes_user
ORACLE_DB_PASSWORD=SecurePassword123!
ORACLE_DB_SCHEMA=agentes_user

# OCI Object Storage
OCI_BUCKET_NAME=agentes-anexos
OCI_NAMESPACE=axhheqi2ofpb

# OCI Vault Secrets
OCI_VAULT_DB_PASSWORD_SECRET_ID=ocid1.vaultsecret.oc1..aaaa...

# Application
APP_BASE_URL=https://agentes.tjmg.jus.br
KEYCLOAK_ISSUER_URI=https://sso.tjmg.jus.br/realms/agentes-voluntarios

```

### 3. Configuração do Oracle Database

```sql
-- Conectar como ADMIN no Autonomous Database
sqlplus admin/AdminPassword@agentes-db_high

-- Criar usuário da aplicação
CREATE USER agentes_user IDENTIFIED BY "SecurePassword123!";

-- Conceder privilégios
GRANT CONNECT, RESOURCE TO agentes_user;
GRANT CREATE SESSION TO agentes_user;
GRANT CREATE TABLE TO agentes_user;
GRANT CREATE SEQUENCE TO agentes_user;
GRANT CREATE VIEW TO agentes_user;
GRANT UNLIMITED TABLESPACE TO agentes_user;

-- Executar scripts de inicialização
@database/init/01-init-oracle.sql
```

### 4. Build e Push das Imagens

```bash
# Configurar variáveis
export OCI_REGION="sa-saopaulo-1"
export OCI_REGISTRY_NAMESPACE="axhheqi2ofpb"
export OCI_REGISTRY="${OCI_REGION}.ocir.io"

# Login no OCI Registry
docker login ${OCI_REGISTRY} -u "${OCI_REGISTRY_NAMESPACE}/oracleidentitycloudservice/${OCI_USERNAME}" -p "${OCI_AUTH_TOKEN}"

# Build e push
./scripts/deploy-oke.sh
```

### 5. Deploy da Aplicação

```bash
# Executar deploy automatizado
chmod +x scripts/deploy-oke.sh
./scripts/deploy-oke.sh

# Ou deploy manual
kubectl apply -f k8s/oke-deployment.yaml
```

### 6. Configuração do Load Balancer

```bash
# Verificar serviços
kubectl get services -n agentes-voluntarios

# Configurar DNS
# Apontar agentes.tjmg.jus.br para o IP do Load Balancer
```

## 🔐 Configuração de Segurança OCI

### 1. OCI Vault para Secrets

```bash
# Criar vault
oci kms management vault create --compartment-id <compartment-id> --display-name "agentes-vault" --vault-type DEFAULT

# Criar master key
oci kms management key create --compartment-id <compartment-id> --display-name "agentes-key" --key-shape '{"algorithm":"AES","length":256}' --vault-id <vault-id>

# Criar secrets
oci vault secret create-base64 --compartment-id <compartment-id> --secret-name "db-password" --vault-id <vault-id> --key-id <key-id> --secret-content-content "U2VjdXJlUGFzc3dvcmQxMjMh"
```

### 2. Network Security Lists

```bash
# Regras de segurança para OKE
oci network security-list create \
  --compartment-id <compartment-id> \
  --vcn-id <vcn-id> \
  --display-name "agentes-security-list" \
  --egress-security-rules '[{"destination":"0.0.0.0/0","protocol":"all","isStateless":false}]' \
  --ingress-security-rules '[{"source":"10.0.0.0/16","protocol":"all","isStateless":false},{"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":443,"max":443}},"isStateless":false}]'
```

### 3. WAF (Web Application Firewall)

```bash
# Criar WAF policy
oci waas waas-policy create \
  --compartment-id <compartment-id> \
  --domain "agentes.tjmg.jus.br" \
  --display-name "agentes-waf"
```

## 📊 Monitoramento OCI

### 1. OCI Monitoring

```bash
# Criar alarm para CPU
oci monitoring alarm create \
  --compartment-id <compartment-id> \
  --display-name "agentes-cpu-alarm" \
  --metric-compartment-id <compartment-id> \
  --namespace "oci_computeagent" \
  --query "CpuUtilization[1m].mean() > 80"
```

### 2. Logging

```bash
# Configurar log group
oci logging log-group create \
  --compartment-id <compartment-id> \
  --display-name "agentes-logs"

# Configurar log
oci logging log create \
  --log-group-id <log-group-id> \
  --display-name "agentes-application-log" \
  --log-type SERVICE
```

## 🔄 Backup e Restore OCI

### 1. Backup Automático Oracle Database

```bash
# Configurar backup automático (Autonomous Database)
oci db autonomous-database update \
  --autonomous-database-id <db-id> \
  --backup-retention-period-in-days 30

# Backup manual
oci db autonomous-database create-backup \
  --autonomous-database-id <db-id> \
  --display-name "agentes-backup-$(date +%Y%m%d)"
```

### 2. Backup de Anexos (Object Storage)

```bash
# Configurar lifecycle policy
oci os object-lifecycle-policy put \
  --bucket-name agentes-anexos \
  --items '[{"name":"backup-retention","action":"DELETE","timeAmount":365,"timeUnit":"DAYS","isEnabled":true}]'
```

### 3. Script de Backup Completo

```bash
# Executar backup completo
./scripts/backup-oracle.sh

# Agendar backup diário
echo "0 2 * * * /opt/agentes-voluntarios/scripts/backup-oracle.sh" | crontab -
```

## 🚨 Troubleshooting OCI

### Problemas Comuns:

**1. Erro de Conexão Oracle Database:**
```bash
# Verificar conectividade
telnet agentes-db.sub12345678901.agentesvcn.oraclevcn.com 1521

# Verificar TNS
tnsping AGENTESDB_HIGH

# Verificar logs
kubectl logs -f deployment/agentes-backend -n agentes-voluntarios
```

**2. Erro de Autenticação OCI:**
```bash
# Verificar configuração OCI
oci iam user get --user-id <user-id>

# Testar auth token
docker login sa-saopaulo-1.ocir.io
```

**3. Erro de Recursos OKE:**
```bash
# Verificar limites de serviço
oci limits resource-availability get --compartment-id <compartment-id> --service-name compute

# Verificar nodes
kubectl get nodes
kubectl describe node <node-name>
```

**4. Erro de Load Balancer:**
```bash
# Verificar load balancer
oci lb load-balancer list --compartment-id <compartment-id>

# Verificar health checks
oci lb backend-health get --load-balancer-id <lb-id> --backend-set-name <backend-set>
```

## 📋 Checklist de Deploy OCI

### Pré-Deploy:
- [ ] Compartment OCI criado
- [ ] VCN e subnets configuradas
- [ ] Cluster OKE provisionado
- [ ] Oracle Database criado
- [ ] OCI Vault configurado
- [ ] Object Storage bucket criado
- [ ] DNS configurado

### Deploy:
- [ ] Imagens buildadas e enviadas para OCI Registry
- [ ] Secrets criados no Kubernetes
- [ ] ConfigMaps aplicados
- [ ] Deployments executados
- [ ] Services expostos
- [ ] Ingress configurado
- [ ] Load Balancer funcionando

### Pós-Deploy:
- [ ] Health checks passando
- [ ] Aplicação acessível via HTTPS
- [ ] Banco de dados conectado
- [ ] Upload de arquivos funcionando
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Logs sendo coletados

## 📞 Suporte OCI

### Contatos:
- **Equipe Técnica:** ti-agentes@tjmg.jus.br
- **Suporte Oracle:** Através do portal My Oracle Support
- **Documentação OCI:** https://docs.oracle.com/en-us/iaas/

### Recursos Úteis:
- **OCI Console:** https://cloud.oracle.com
- **OCI CLI Reference:** https://docs.oracle.com/en-us/iaas/tools/oci-cli/
- **Kubernetes Dashboard:** kubectl proxy

---

**Versão:** 2.0 OCI  
**Data:** 17/06/2025  
**Compatibilidade:** Oracle Cloud Infrastructure (OCI)  
**Autor:** Equipe de Desenvolvimento TJMG
