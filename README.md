# Sistema de Gestão de Agentes Voluntários da Infância e Juventude

## 📋 Versão 2.0 - Junho 2025

Sistema completo para gestão de agentes voluntários e registro de autos de infração, desenvolvido para o Tribunal de Justiça de Minas Gerais (TJMG).

## 🚀 Principais Funcionalidades

### ✅ Gestão de Agentes Voluntários
- Cadastro completo com 9 novos campos (foto, documentação, filiação)
- Emissão de credenciais com QR Code
- Controle de situação cadastral
- Consulta pública de validade
- Dashboard com painel interativo

### 🆕 Módulo de Autos de Infração (v2.0)
- **UC005:** Cadastro completo de autos de infração
- **UC006:** Consulta e gerenciamento com filtros avançados
- Sistema de anexos (documentos e imagens)
- Controle de acesso baseado em perfil
- Log de auditoria completo
- Exportação para CSV/PDF

### 🔐 Segurança e Controle
- Autenticação via Keycloak + Login gov.br
- Controle de acesso por perfil (Agente/Supervisor/Admin)
- Auditoria completa de operações
- Criptografia de dados sensíveis

### 📱 Interface Responsiva
- Design mobile-first
- Compatível com smartphones e tablets
- Menu fixo no topo com logo TJMG
- Cores da identidade visual do TJMG

## 🏗️ Arquitetura Técnica

### Backend
- **Java 17** + Spring Boot 3.x
- **PostgreSQL 14+** para persistência
- **Spring Security** para autenticação
- **JPA/Hibernate** para ORM
- **Maven** para build

### Frontend
- **Angular 16+** com TypeScript
- **Bootstrap 5** para responsividade
- **Angular Material** para componentes
- **RxJS** para programação reativa

### Infraestrutura
- **Docker** + Docker Compose
- **Nginx** como proxy reverso
- **Prometheus** + Grafana para monitoramento
- **SSL/TLS** para segurança

## 📦 Estrutura do Projeto

```
sistema-agentes-voluntarios/
├── backend/                    # Aplicação Java Spring Boot
│   ├── src/main/java/         # Código-fonte Java
│   ├── src/main/resources/    # Configurações e recursos
│   ├── pom.xml               # Dependências Maven
│   └── Dockerfile            # Container do backend
├── frontend/                  # Aplicação Angular
│   ├── src/app/              # Componentes Angular
│   ├── src/assets/           # Recursos estáticos
│   ├── package.json          # Dependências NPM
│   └── Dockerfile            # Container do frontend
├── database/                  # Scripts de banco
│   ├── init/                 # Scripts de inicialização
│   └── migrations/           # Scripts de migração
├── docs/                     # Documentação
│   ├── manual-deploy-v2.md   # Manual de deploy
│   ├── novas-funcionalidades-v2.md
│   ├── manual-usuario.md     # Manual do usuário
│   └── api-documentation.md  # Documentação da API
├── scripts/                  # Scripts de automação
│   ├── deploy.sh            # Script de deploy
│   ├── backup.sh            # Script de backup
│   └── restore.sh           # Script de restore
├── monitoring/               # Configurações de monitoramento
│   ├── prometheus.yml       # Configuração Prometheus
│   └── grafana/             # Dashboards Grafana
├── docker-compose.yml        # Orquestração de containers
├── .env.example             # Exemplo de variáveis de ambiente
└── README.md                # Este arquivo
```

## 🚀 Quick Start

### 1. Pré-requisitos
```bash
# Docker e Docker Compose
sudo apt install docker.io docker-compose-plugin

# Ou instalação manual:
# Java 17, Node.js 18+, PostgreSQL 14+
```

### 2. Deploy com Docker (Recomendado)
```bash
# Clonar/extrair o projeto
cd sistema-agentes-voluntarios

# Configurar variáveis de ambiente
cp .env.example .env
nano .env

# Executar deploy
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

### 3. Verificar Instalação
```bash
# Verificar containers
docker-compose ps

# Testar aplicação
curl -k https://localhost/health

# Acessar interface
https://localhost
```

## 📊 Novidades da Versão 2.0

### 🆕 Funcionalidades Adicionadas
- **Módulo completo de Autos de Infração**
- **Sistema de anexos** com upload seguro
- **Controle de acesso** granular por perfil
- **Log de auditoria** completo
- **Dashboard aprimorado** com painel de agentes
- **9 novos campos** no cadastro de agentes
- **298 comarcas** de Minas Gerais integradas

### 🔧 Melhorias Técnicas
- **Responsividade** mobile completa
- **Performance** otimizada
- **Segurança** aprimorada
- **Monitoramento** com Prometheus/Grafana
- **Backup automático** configurado
- **Scripts de deploy** automatizados

### 📋 Regras de Negócio
- **RN008-RN014:** Regras para autos de infração
- **RNF005:** Controle de acesso baseado em perfil
- **Validações** rigorosas de dados
- **Auditoria** de todas as operações

## 🔐 Perfis de Usuário

### Agente Voluntário
- Cadastra próprios autos de infração
- Consulta apenas seus registros
- Edita autos em rascunho
- Acesso limitado por comarca

### Supervisor
- Gerencia autos da comarca
- Edita campos específicos
- Cancela autos com justificativa
- Relatórios da comarca

### Administrador/COFIJ
- Acesso completo ao sistema
- Gerencia todos os autos
- Relatórios globais
- Configurações do sistema

## 📞 Suporte e Documentação

### 📚 Documentação Completa
- [Manual de Deploy](docs/manual-deploy-v2.md)
- [Novas Funcionalidades](docs/novas-funcionalidades-v2.md)
- [Manual do Usuário](docs/manual-usuario.md)
- [Documentação da API](docs/api-documentation.md)

### 🛠️ Scripts Úteis
```bash
# Backup do sistema
./scripts/backup.sh

# Restore de backup
./scripts/restore.sh 20250617_143000

# Deploy/atualização
./scripts/deploy.sh

# Verificar logs
docker-compose logs -f backend
```

### 📧 Contatos
- **Equipe Técnica:** ti-agentes@tjmg.jus.br
- **Suporte:** suporte-agentes@tjmg.jus.br
- **Documentação:** https://docs.agentes.tjmg.jus.br

## 🔄 Migração e Atualizações

### Da Versão 1.0 para 2.0
1. Backup completo dos dados
2. Execução de scripts de migração
3. Deploy da nova versão
4. Testes de funcionalidade
5. Treinamento dos usuários

### Atualizações Futuras
- Backup automático antes de atualizações
- Scripts de migração versionados
- Rollback automático em caso de falha
- Documentação de mudanças

## 📈 Monitoramento e Métricas

### Dashboards Disponíveis
- **Sistema:** CPU, memória, disco, rede
- **Aplicação:** Requisições, erros, performance
- **Banco de Dados:** Conexões, queries, locks
- **Negócio:** Agentes, autos, operações

### Alertas Configurados
- Indisponibilidade do sistema
- Alto uso de recursos
- Erros de aplicação
- Falhas de backup

## 🏆 Qualidade e Testes

### Cobertura de Testes
- **Backend:** Testes unitários e integração
- **Frontend:** Testes de componentes
- **E2E:** Testes de fluxo completo
- **Performance:** Testes de carga

### Padrões de Código
- **Java:** Checkstyle + SpotBugs
- **TypeScript:** ESLint + Prettier
- **Documentação:** JavaDoc + TSDoc
- **Versionamento:** Git Flow

---

## 📄 Licença

Sistema desenvolvido para o Tribunal de Justiça de Minas Gerais (TJMG).  
Todos os direitos reservados.

**Versão:** 2.0  
**Data:** 17/06/2025  
**Equipe:** Desenvolvimento TJMG

