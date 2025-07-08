# Manual de Deploy - Sistema de Gestão de Agentes Voluntários v2.0

## 📋 Visão Geral

Este manual contém as instruções completas para deploy do Sistema de Gestão de Agentes Voluntários da Infância e Juventude, versão 2.0, incluindo as novas funcionalidades de Autos de Infração.

## 🏗️ Arquitetura do Sistema

### Componentes Principais:
- **Backend:** Java 17 + Spring Boot 3.x
- **Frontend:** Angular 16+ 
- **Banco de Dados:** PostgreSQL 14+
- **Autenticação:** Keycloak + Login gov.br
- **Monitoramento:** Prometheus + Grafana
- **Containerização:** Docker + Docker Compose

## 📦 Pré-requisitos

### Ambiente de Produção:
- **Sistema Operacional:** Ubuntu 20.04+ ou CentOS 8+
- **Memória RAM:** Mínimo 8GB (Recomendado 16GB)
- **Armazenamento:** Mínimo 50GB SSD
- **CPU:** Mínimo 4 cores
- **Rede:** Acesso à internet para downloads

### Software Necessário:
```bash
# Docker e Docker Compose
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker

# Java 17 (se não usar Docker)
sudo apt install openjdk-17-jdk

# Node.js 18+ (se não usar Docker)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# PostgreSQL 14+ (se não usar Docker)
sudo apt install postgresql-14 postgresql-contrib
```

## 🚀 Deploy com Docker (Recomendado)

### 1. Preparação do Ambiente

```bash
# Criar diretório do projeto
sudo mkdir -p /opt/agentes-voluntarios
cd /opt/agentes-voluntarios

# Extrair o código-fonte
unzip sistema-agentes-voluntarios-v2.0.zip
cd sistema-agentes-voluntarios
```

### 2. Configuração de Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

**Configurações principais no .env:**
```env
# Banco de Dados
DB_HOST=postgres
DB_PORT=5432
DB_NAME=agentes_voluntarios
DB_USER=agentes_user
DB_PASSWORD=SenhaSegura123!

# Aplicação
APP_PORT=8080
FRONTEND_PORT=80
APP_PROFILE=prod

# Keycloak
KEYCLOAK_URL=https://sso.tjmg.jus.br
KEYCLOAK_REALM=agentes-voluntarios
KEYCLOAK_CLIENT_ID=agentes-app

# Login gov.br
GOVBR_CLIENT_ID=seu_client_id
GOVBR_CLIENT_SECRET=seu_client_secret
GOVBR_REDIRECT_URI=https://agentes.tjmg.jus.br/auth/govbr/callback

# SSL/TLS
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/agentes.crt
SSL_KEY_PATH=/etc/ssl/private/agentes.key

# Monitoramento
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=AdminSeguro123!
```

### 3. Configuração SSL/TLS

```bash
# Criar diretório para certificados
sudo mkdir -p /etc/ssl/agentes

# Copiar certificados (fornecidos pela infraestrutura TJMG)
sudo cp certificados/agentes.crt /etc/ssl/certs/
sudo cp certificados/agentes.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/agentes.key
```

### 4. Deploy da Aplicação

```bash
# Executar script de deploy
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh

# Ou manualmente:
docker-compose up -d
```

### 5. Verificação do Deploy

```bash
# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Testar conectividade
curl -k https://localhost/health
```

## 🔧 Deploy Manual (Sem Docker)

### 1. Configuração do Banco de Dados

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Criar banco e usuário
CREATE DATABASE agentes_voluntarios;
CREATE USER agentes_user WITH PASSWORD 'SenhaSegura123!';
GRANT ALL PRIVILEGES ON DATABASE agentes_voluntarios TO agentes_user;

-- Executar scripts de inicialização
\c agentes_voluntarios
\i database/init/01-init.sql
```

### 2. Deploy do Backend

```bash
cd backend

# Configurar application.properties
cp src/main/resources/application.properties.example src/main/resources/application.properties
nano src/main/resources/application.properties

# Compilar aplicação
./mvnw clean package -DskipTests

# Executar aplicação
java -jar target/agentes-voluntarios-2.0.0.jar
```

### 3. Deploy do Frontend

```bash
cd frontend/agentes-frontend

# Instalar dependências
npm install

# Configurar ambiente
cp src/environments/environment.prod.ts.example src/environments/environment.prod.ts
nano src/environments/environment.prod.ts

# Build para produção
npm run build --prod

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/agentes-voluntarios
sudo ln -s /etc/nginx/sites-available/agentes-voluntarios /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Configuração de Segurança

### 1. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Ou iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### 2. Backup Automático

```bash
# Configurar backup diário
sudo crontab -e

# Adicionar linha:
0 2 * * * /opt/agentes-voluntarios/scripts/backup.sh
```

### 3. Monitoramento

```bash
# Acessar Grafana
https://seu-servidor:3000
# Login: admin / AdminSeguro123!

# Importar dashboards
# Arquivos em: monitoring/grafana/dashboards/
```

## 📊 Funcionalidades da Versão 2.0

### Novas Funcionalidades:
1. **Cadastro de Autos de Infração** (UC005)
2. **Consulta e Gerenciamento de Autos** (UC006)
3. **Sistema de Anexos** com upload
4. **Log de Auditoria** completo
5. **Controle de Acesso** por perfil
6. **Dashboard** com painel de agentes
7. **Responsividade** mobile completa

### Campos Adicionais no Cadastro de Agentes:
- Foto do agente
- Número Carteira Identidade
- Data Expedição CI
- Nacionalidade
- Naturalidade
- UF
- Data de Nascimento
- Filiação Pai
- Filiação Mãe

## 🔄 Processo de Atualização

### De v1.0 para v2.0:

```bash
# Backup do banco atual
pg_dump agentes_voluntarios > backup_v1.sql

# Executar migrations
psql agentes_voluntarios < database/migrations/v1_to_v2.sql

# Deploy nova versão
docker-compose down
docker-compose pull
docker-compose up -d
```

## 🚨 Troubleshooting

### Problemas Comuns:

**1. Erro de Conexão com Banco:**
```bash
# Verificar status PostgreSQL
sudo systemctl status postgresql
docker-compose logs postgres
```

**2. Erro de Memória:**
```bash
# Aumentar heap Java
export JAVA_OPTS="-Xmx4g -Xms2g"
```

**3. Erro de Certificado SSL:**
```bash
# Verificar certificados
openssl x509 -in /etc/ssl/certs/agentes.crt -text -noout
```

**4. Erro de Permissão:**
```bash
# Ajustar permissões
sudo chown -R www-data:www-data /var/www/agentes
sudo chmod -R 755 /var/www/agentes
```

## 📞 Suporte

### Contatos:
- **Equipe Técnica:** ti-agentes@tjmg.jus.br
- **Documentação:** https://docs.agentes.tjmg.jus.br
- **Issues:** https://github.com/tjmg/agentes-voluntarios/issues

### Logs Importantes:
- **Backend:** `/var/log/agentes/backend.log`
- **Frontend:** `/var/log/nginx/agentes_access.log`
- **Banco:** `/var/log/postgresql/postgresql.log`

## 📋 Checklist de Deploy

- [ ] Pré-requisitos instalados
- [ ] Variáveis de ambiente configuradas
- [ ] Certificados SSL instalados
- [ ] Banco de dados criado e configurado
- [ ] Aplicação backend deployada
- [ ] Frontend buildado e servido
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Testes de funcionalidade realizados
- [ ] Documentação entregue à equipe

---

**Versão:** 2.0  
**Data:** 17/06/2025  
**Autor:** Equipe de Desenvolvimento

