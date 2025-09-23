# Relatório de Conformidade — Gestão de Agentes Voluntários (19/09/2025)

Este documento mapeia os requisitos funcionais (RN001–RN014), não funcionais (RNF001–RNF019) e casos de uso (UC001–UC006) aos respectivos trechos de código, endpoints e telas.

## Mapeamento RN / UC

- RN001/RN002 (Cadastro + CPF único):
  - Backend: `AgenteVoluntario` (backend/src/main/java/br/gov/corregedoria/agentes/entity/AgenteVoluntario.java)
  - Service/Controller: `AgenteVoluntarioService`, `AgenteVoluntarioController`
  - DB: constraint unique `cpf` (V1 migration)
  - Frontend: UC001 — `agente-cadastro` (form reativo)

- RN003–RN005 (Credencial + QR + Consulta Pública):
  - Backend: `CredencialService` (QR + emissão + auditoria); `ConsultaPublicaController/Service`
  - DB: tabela `credencial`
  - Frontend: UC002 — `credencial-emissao`; UC003 — `consulta-publica`

- RN006–RN007 (Situação/Status):
  - Backend: `StatusAgente`, `AgenteVoluntarioService.atualizarStatus`
  - Frontend: tela para Corregedoria (painel de agentes); status inicial EM_ANALISE no cadastro

- RN008–RN014 (Autos de Infração):
  - Backend: `AutoInfracao` (campos obrigatórios); `AutoInfracaoService` (regras de edição, cancelamento); novo `registrar()` com geração de `numero_auto` e endpoint `PATCH /api/autos/{id}/registrar`
  - DB: `auto_infracao`, índices, `numero_auto` único; anexos `anexo_auto_infracao`; tabelas normalizadas do DER (estabelecimento, responsavel, menor_envolvido, testemunha, auto_infracao_testemunha)
  - Frontend: UC005/UC006 — `auto-infracao-cadastro`, `auto-infracao-lista`, `auto-infracao-detalhe`
  - RN009 (Uploads): controller `AnexoAutoInfracaoController` com validações de tipo/tamanho

## RNF (amostra)

- RNF001/RNF005 (SSO Keycloak + RBAC):
  - Config/guards: `SecurityConfig`, `AuthGuard`, `RoleGuard`
- RNF003/RNF015–RNF016 (Logs/Auditoria):
  - `AuditoriaUtil`, `LogAuditoria`, `LogAuditoriaAutoInfracao`
- RNF004 (Sessão 15min):
  - `server.servlet.session.timeout=15m` em `application.properties`
- RNF006–RNF010 (Desempenho/Escalabilidade/Docker):
  - Dockerfiles e compose existentes; queries paginadas; índices na migration
- RNF012–RNF014 (Acessibilidade/Responsividade):
  - Frontend SCSS sem inline style; componentes com aria-atributos; correção no login para SCSS

## Endpoints principais

- Agentes: `POST /api/agentes`, `GET /api/agentes`, `PATCH /api/agentes/{id}/status`
- Credenciais: `POST /api/credenciais/emitir/{agenteId}`, `GET /api/credenciais/agente/{agenteId}`
- Consulta pública (sem login): `GET /public/verificar/{credencialId}`
- Autos de infração: `POST /api/autos`, `GET /api/autos`, `PATCH /api/autos/{id}/registrar`, `PATCH /api/autos/{id}/cancelar`, `DELETE /api/autos/{id}`
- Anexos: `GET /api/autos/{autoId}/anexos`, `POST /api/autos/{autoId}/anexos`, `GET /api/anexos/{anexoId}/download`, `DELETE /api/anexos/{anexoId}`

## Scripts/migrações (Oracle)

- `backend/src/main/resources/db/migration/V1__init_agentes_schema.sql` — criação de tabelas, índices e sequences no schema AGENTES

## Testes/Validação manual (checklist)

- UC001: Criar agente (CPF único), verificar status inicial EM_ANALISE, auditoria
- UC002: Emissão de credencial apenas para ATIVO; baixar PDF (placeholder) e QR aponta para `/public/verificar/{id}`
- UC003: Acessar `/public/verificar/{id}` sem token e checar dados públicos
- UC004: Atualizar status via Corregedoria; auditar alteração
- UC005: Criar auto (RASCUNHO), editar, anexar documento; listar com filtros
- UC006: Registrar auto (gera `numero_auto`), impedir exclusão, cancelar com justificativa e log

## Observações

- Geração de PDF da credencial: método presente com TODO (biblioteca iText disponível); gera QR em Base64
- Tabelas normalizadas (DER) criadas na migration; entidades Java podem ser evoluídas para refletir integralmente esse DER sem quebrar compatibilidade

