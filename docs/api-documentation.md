# Documentação Técnica da API
## Sistema de Gestão de Agentes Voluntários da Infância e Juventude

**Versão:** 1.0  
**Data:** 13 de junho de 2025  
**Autor:** Manus AI  

---

## Sumário

1. [Introdução](#introdução)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Endpoints da API](#endpoints-da-api)
4. [Modelos de Dados](#modelos-de-dados)
5. [Códigos de Resposta](#códigos-de-resposta)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Rate Limiting](#rate-limiting)
8. [Versionamento](#versionamento)

---

## 1. Introdução

### 1.1 Visão Geral

A API REST do Sistema de Gestão de Agentes Voluntários fornece acesso programático a todas as funcionalidades do sistema. A API segue os padrões REST e utiliza JSON para troca de dados.

**URL Base:** `https://sistema-agentes.corregedoria.tjmg.jus.br/api`

**Versão Atual:** v1

**Formato de Dados:** JSON

**Protocolo:** HTTPS

### 1.2 Características da API

- **RESTful:** Segue os princípios REST
- **Stateless:** Cada requisição é independente
- **Documentada:** OpenAPI/Swagger disponível
- **Versionada:** Suporte a múltiplas versões
- **Segura:** Autenticação JWT obrigatória
- **Monitorada:** Métricas e logs detalhados

### 1.3 Documentação Interativa

A documentação interativa da API está disponível em:
- **Swagger UI:** `https://sistema-agentes.corregedoria.tjmg.jus.br/swagger-ui.html`
- **OpenAPI Spec:** `https://sistema-agentes.corregedoria.tjmg.jus.br/v3/api-docs`

---

## 2. Autenticação e Autorização

### 2.1 Métodos de Autenticação

A API suporta dois métodos de autenticação:

**JWT Token (Keycloak):**
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```


### 2.2 Obtenção do Token

**Via Keycloak:**
```bash
curl -X POST "https://keycloak.corregedoria.tjmg.jus.br/realms/agentes-voluntarios/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=agentes-api&username=usuario&password=senha"
```


### 2.3 Perfis de Autorização

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| ADMIN | Administrador da Corregedoria | Acesso completo |
| COFIJ | Usuário do COFIJ | Emissão de credenciais, consultas |
| AGENTE | Agente Voluntário | Acesso às próprias informações |

### 2.4 Exemplo de Requisição Autenticada

```bash
curl -X GET "https://sistema-agentes.corregedoria.tjmg.jus.br/api/agentes" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

---
