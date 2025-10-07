# Execução Local — Gestão de Agentes Voluntários

Pré-requisitos:
- JDK 17, Maven 3.9+
- Node 18+, Angular CLI (opcional)
- Banco Oracle disponível (ou XE) e usuário/schema com permissões de DDL
- Keycloak (conforme docker-compose) para SSO

## Backend (Spring Boot 3)

1. Configure variáveis (exemplo via .env):
   - `ORACLE_DB_HOST`, `ORACLE_DB_PORT=1521`, `ORACLE_DB_SERVICE=ORCL`
   - `ORACLE_DB_USER`, `ORACLE_DB_PASSWORD`
   - `ORACLE_DB_SCHEMA=AGENTES`
   - `KEYCLOAK_PUBLIC_BASE_URL`, `KEYCLOAK_INTERNAL_BASE_URL`, `KEYCLOAK_REALM`
   - `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`

2. Execute:
   - `cd backend`
   - `mvn spring-boot:run`

Flyway executa automaticamente as migrações em `db/migration` no schema definido.

Swagger/OpenAPI: `http://localhost:8080/swagger-ui.html`

## Frontend (Angular 17)

1. `cd frontend/agentes-frontend`
2. `npm ci`
3. `npm run start` (ou use a imagem com Nginx conforme Dockerfile)

Defina `environment.apiUrl` ou injetor de runtime (`window.APP_CONFIG.apiUrl`) para apontar ao backend.

## Teste rápido (Postman)

Importe `docs/postman/AgentesVoluntarios.postman_collection.json`, ajuste `{{baseUrl}}` e `{{token}}` (obtido após login via Keycloak) e rode as requisições UC001–UC006.

## Notas
- Diretório de uploads (RN009): configurável por `app.uploads.dir` (padrão `uploads/`).
- Sessão expira em 15min (RNF004). Logs estruturados e auditoria ativos.

