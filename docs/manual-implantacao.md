# Manual de Implantação
## Sistema de Gestão de Agentes Voluntários da Infância e Juventude

**Versão:** 1.0  
**Data:** 13 de junho de 2025  
**Autor:** Manus AI  

---

## Sumário

1. [Introdução](#introdução)
2. [Pré-requisitos](#pré-requisitos)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Instalação e Configuração](#instalação-e-configuração)
5. [Deploy com Docker](#deploy-com-docker)
6. [Configuração de Monitoramento](#configuração-de-monitoramento)
7. [Configuração de Segurança](#configuração-de-segurança)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Troubleshooting](#troubleshooting)
10. [Manutenção](#manutenção)

---

## 1. Introdução

Este manual fornece instruções detalhadas para a implantação do Sistema de Gestão de Agentes Voluntários da Infância e Juventude em ambiente de produção. O sistema foi desenvolvido utilizando arquitetura de microsserviços com Java Spring Boot no backend, Angular no frontend, e Oracle Database como banco de dados principal.

### 1.1 Objetivos do Sistema

O sistema tem como principais objetivos:

- Centralizar o cadastro e gestão de agentes voluntários
- Emitir credenciais digitais com QR Code para verificação
- Permitir consulta pública da validade das credenciais
- Controlar o ciclo de vida dos agentes (status cadastral)
- Integrar com sistemas de autenticação gov.br e Keycloak
- Fornecer auditoria completa das operações

### 1.2 Características Técnicas

- **Backend:** Java 17, Spring Boot 3.x, Spring Security, JPA/Hibernate
- **Frontend:** Angular 17, Bootstrap 5, TypeScript
- **Banco de Dados:** Oracle Database 21c
- **Autenticação:** Keycloak (administrativo) e gov.br (agentes)
- **Containerização:** Docker e Docker Compose
- **Infraestrutura:** Oracle Cloud Infrastructure (OCI)

---


## 2. Pré-requisitos

### 2.1 Requisitos de Hardware

Para um ambiente de produção que suporte até 1.000 usuários simultâneos, recomenda-se a seguinte configuração mínima:

**Servidor de Aplicação:**
- CPU: 8 vCPUs (Intel Xeon ou equivalente)
- RAM: 16 GB
- Armazenamento: 100 GB SSD
- Rede: 1 Gbps

**Servidor de Banco de Dados:**
- CPU: 8 vCPUs (Intel Xeon ou equivalente)
- RAM: 32 GB
- Armazenamento: 500 GB SSD (com backup automático)
- Rede: 1 Gbps

**Servidor de Monitoramento:**
- CPU: 4 vCPUs
- RAM: 8 GB
- Armazenamento: 200 GB SSD
- Rede: 1 Gbps

### 2.2 Requisitos de Software

**Sistema Operacional:**
- Ubuntu 22.04 LTS ou superior
- CentOS 8 ou superior
- Oracle Linux 8 ou superior

**Dependências Obrigatórias:**
- Docker 24.0 ou superior
- Docker Compose 2.0 ou superior
- Git 2.30 ou superior
- curl e wget
- OpenSSL 1.1.1 ou superior

**Dependências Opcionais:**
- Terraform 1.5 ou superior (para IaC)
- kubectl 1.28 ou superior (para Kubernetes)
- Helm 3.12 ou superior (para Kubernetes)

### 2.3 Requisitos de Rede

**Portas que devem estar abertas:**
- 80/443: Frontend (HTTP/HTTPS)
- 8080: Backend API
- 1521: Oracle Database
- 8180: Keycloak

**Conectividade Externa:**
- Acesso à internet para integração com gov.br
- Acesso aos repositórios Docker Hub e Oracle Container Registry
- Conectividade com serviços de DNS públicos

### 2.4 Certificados SSL/TLS

Para ambiente de produção, é necessário configurar certificados SSL/TLS válidos:

- Certificado para o domínio principal da aplicação
- Certificado para subdomínios (se aplicável)
- Certificados intermediários da cadeia de confiança

---

## 3. Arquitetura do Sistema

### 3.1 Visão Geral da Arquitetura

O sistema utiliza uma arquitetura de microsserviços containerizada, com os seguintes componentes principais:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Frontend    │    │     Backend     │
│    (Nginx)      │◄──►│   (Angular)     │◄──►│  (Spring Boot)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │    Keycloak     │◄────────────┤
                       │ (Autenticação)  │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │ Oracle Database │◄────────────┘
                       │   (Dados)       │
                       └─────────────────┘

```

### 3.2 Componentes do Sistema

**Frontend (Angular):**
- Interface web responsiva
- Autenticação via Keycloak e gov.br
- Comunicação com backend via REST APIs
- Servido por Nginx com proxy reverso

**Backend (Spring Boot):**
- APIs RESTful documentadas com OpenAPI
- Autenticação e autorização com JWT
- Integração com Oracle Database via JPA
- Logs estruturados e métricas para monitoramento

**Banco de Dados (Oracle):**
- Armazenamento principal dos dados
- Triggers para auditoria automática
- Views para relatórios e consultas otimizadas
- Backup automatizado

**Keycloak:**
- Gerenciamento de identidade e acesso
- Single Sign-On (SSO)
- Integração com LDAP/Active Directory (opcional)
- Políticas de segurança configuráveis

**Monitoramento:**
- Logs centralizados com ELK Stack (opcional)

### 3.3 Fluxo de Dados

O fluxo típico de dados no sistema segue o padrão:

1. **Autenticação:** Usuário se autentica via Keycloak ou gov.br
2. **Autorização:** Token JWT é validado pelo backend
3. **Processamento:** Backend processa a requisição e aplica regras de negócio
4. **Persistência:** Dados são armazenados no Oracle Database
5. **Auditoria:** Operações são registradas automaticamente
6. **Resposta:** Resultado é retornado ao frontend
7. **Monitoramento:** Métricas são coletadas pelo sistema de observabilidade

---


## 4. Instalação e Configuração

### 4.1 Preparação do Ambiente

**Passo 1: Atualização do Sistema**

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

**Passo 2: Instalação do Docker**

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**Passo 3: Instalação do Docker Compose**

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Passo 4: Verificação das Instalações**

```bash
docker --version
docker-compose --version
```

### 4.2 Clonagem e Configuração do Projeto

**Passo 1: Clonagem do Repositório**

```bash
git clone https://github.com/corregedoria/sistema-agentes-voluntarios.git
cd sistema-agentes-voluntarios
```

**Passo 2: Configuração das Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis de ambiente
nano .env
```

**Variáveis Obrigatórias:**

```bash
# Configurações do gov.br (obter no portal do desenvolvedor gov.br)
GOVBR_CLIENT_ID=seu-client-id-real
GOVBR_CLIENT_SECRET=seu-client-secret-real
GOVBR_REDIRECT_URI=https://seu-dominio.gov.br/auth/govbr/callback

# Configurações do Oracle Database
ORACLE_PWD=SenhaSegura123!
ORACLE_CHARACTERSET=AL32UTF8

# Configurações do Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=SenhaAdmin123!


# Configurações do PostgreSQL (Keycloak)
POSTGRES_DB=keycloak
POSTGRES_USER=keycloak
POSTGRES_PASSWORD=SenhaPostgres123!
```

### 4.3 Configuração de Certificados SSL

**Para ambiente de produção com HTTPS:**

```bash
# Criar diretório para certificados
mkdir -p ssl/

# Copiar certificados (exemplo com Let's Encrypt)
sudo cp /etc/letsencrypt/live/seu-dominio.gov.br/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/seu-dominio.gov.br/privkey.pem ssl/
sudo chown $USER:$USER ssl/*
```

**Atualizar configuração do Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.gov.br;
    
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;
    
    # Configurações SSL modernas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Resto da configuração...
}
```

### 4.4 Configuração do Banco de Dados

**Passo 1: Preparação dos Scripts de Inicialização**

Os scripts de inicialização estão localizados em `database/init/`. Verifique se os scripts estão corretos para seu ambiente:

```bash
ls -la database/init/
# Deve mostrar: 01-init.sql
```

**Passo 2: Configuração de Backup Automático**

```bash
# Criar script de backup
cat > scripts/backup-oracle.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/oracle"
DATE=$(date +%Y%m%d_%H%M%S)
ORACLE_SID=XE

mkdir -p $BACKUP_DIR

# Backup completo
docker exec agentes-oracle-db sh -c "
expdp system/OraclePassword123@XE \
  directory=DATA_PUMP_DIR \
  dumpfile=backup_$DATE.dmp \
  logfile=backup_$DATE.log \
  full=y
"

# Copiar backup para host
docker cp agentes-oracle-db:/opt/oracle/admin/XE/dpdump/backup_$DATE.dmp $BACKUP_DIR/
docker cp agentes-oracle-db:/opt/oracle/admin/XE/dpdump/backup_$DATE.log $BACKUP_DIR/

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "backup_*.dmp" -mtime +7 -delete
find $BACKUP_DIR -name "backup_*.log" -mtime +7 -delete
EOF

chmod +x scripts/backup-oracle.sh
```

**Passo 3: Configuração do Cron para Backup Automático**

```bash
# Adicionar ao crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /caminho/para/sistema-agentes-voluntarios/scripts/backup-oracle.sh") | crontab -
```

---

