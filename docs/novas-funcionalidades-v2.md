# Documentação das Novas Funcionalidades - Versão 2.0

## 📋 Visão Geral

A versão 2.0 do Sistema de Gestão de Agentes Voluntários introduz funcionalidades importantes para o registro e gerenciamento de Autos de Infração, além de melhorias significativas na interface e experiência do usuário.

## 🆕 Principais Funcionalidades Adicionadas

### 1. Módulo de Autos de Infração

#### UC005 - Cadastrar Auto de Infração
**Descrição:** Permite que agentes voluntários registrem infrações relacionadas à infância e juventude.

**Funcionalidades:**
- Formulário completo com validações
- Upload de anexos (documentos e imagens)
- Preenchimento automático de dados do agente
- Validação de CPF/CNPJ
- Sistema de status (Rascunho → Registrado)

**Campos Obrigatórios:**
- Dados do autuado (nome, CPF/CNPJ, endereço, contato)
- Dados da infração (data, hora, local, descrição)
- Base legal (artigos do ECA)
- Identificação do agente (automática)

**Campos Opcionais:**
- Dados da criança/adolescente envolvida
- Informações de testemunhas
- Assinatura do autuado
- Anexos diversos

#### UC006 - Consultar e Gerenciar Autos de Infração
**Descrição:** Interface centralizada para consulta, edição e cancelamento de autos.

**Funcionalidades:**
- Lista paginada com filtros avançados
- Visualização detalhada de cada auto
- Edição controlada por perfil e status
- Cancelamento com justificativa obrigatória
- Exportação para CSV/PDF
- Log completo de auditoria

**Filtros Disponíveis:**
- Status do auto
- Período (data da infração)
- Agente responsável
- Nome do autuado
- Comarca
- Base legal

### 2. Sistema de Controle de Acesso (RNF005)

#### Perfis de Usuário:

**Agente Voluntário:**
- Cadastra próprios autos de infração
- Consulta apenas seus autos
- Edita autos em status "Rascunho"
- Não pode cancelar autos

**Supervisor:**
- Consulta autos da sua comarca
- Edita campos específicos em autos "Registrados"
- Cancela autos com justificativa
- Acesso a relatórios da comarca

**Administrador/COFIJ:**
- Acesso completo ao sistema
- Consulta todos os autos
- Edita conforme regras de negócio
- Cancela qualquer auto
- Relatórios completos

### 3. Melhorias no Cadastro de Agentes

#### Novos Campos Adicionados:
- **Foto do agente** (upload de imagem)
- **Número da Carteira de Identidade**
- **Data de Expedição da CI**
- **Nacionalidade**
- **Naturalidade**
- **UF** (Estados brasileiros)
- **Data de Nascimento**
- **Filiação Pai**
- **Filiação Mãe**

#### Integração com Comarcas de MG:
- 298 comarcas oficiais de Minas Gerais
- Dados importados do arquivo oficial
- Campo de seleção otimizado

### 4. Dashboard Aprimorado

#### Painel de Agentes:
- Grid interativo com dados dos agentes
- Filtros por nome, status, comarca, validade
- Exportação para CSV e PDF
- Função de impressão
- Paginação e navegação intuitiva

### 5. Melhorias de Interface

#### Responsividade:
- Design mobile-first
- Breakpoints para todos os dispositivos
- Formulários adaptados para smartphones
- Tabelas com scroll horizontal
- Menu de navegação mobile

#### Layout:
- Logo TJMG posicionado no topo à esquerda
- Menu fixo no header
- Cores vermelhas (identidade TJMG)
- Botão "Voltar" em todas as telas
- Interface limpa e profissional

### 6. Sistema de Anexos (RN009)

#### Funcionalidades:
- Upload de múltiplos arquivos
- Tipos suportados: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF
- Tamanho máximo: 10MB por arquivo
- Máximo de 10 anexos por auto
- Visualização e download de anexos
- Controle de permissões por perfil

### 7. Log de Auditoria Completo

#### Eventos Registrados:
- Criação de autos de infração
- Edições (com campos alterados)
- Cancelamentos (com justificativa)
- Consultas realizadas
- Tentativas de acesso negado

#### Dados do Log:
- ID do auto de infração
- Usuário responsável
- Data/hora da operação
- Tipo de operação
- Detalhes da ação
- Endereço IP
- Perfil do usuário

## 🔐 Regras de Negócio Implementadas

### RN008 - Dados Obrigatórios para Cadastro
Validação rigorosa de campos obrigatórios no cadastro de autos de infração.

### RN009 - Sistema de Anexos
Upload seguro de documentos e imagens com validação de tipo e tamanho.

### RN010 - Imutabilidade do Auto Registrado
Autos com status "Registrado" não podem ser excluídos, apenas cancelados.

### RN011 - Edição de Rascunhos
Autos em "Rascunho" podem ser editados livremente pelo agente criador.

### RN012 - Edição de Autos Registrados/Concluídos
Apenas supervisores podem editar campos específicos em autos finalizados.

### RN013 - Justificativa de Cancelamento
Cancelamento de autos exige justificativa obrigatória de 20-500 caracteres.

### RN014 - Status de Cancelamento
Status "Cancelado" é irreversível, mantendo histórico para auditoria.

### RNF005 - Controle de Acesso Baseado em Perfil
Sistema robusto de permissões por funcionalidade e perfil de usuário.

## 📊 Estatísticas e Relatórios

### Dashboards Disponíveis:
- Painel de agentes voluntários
- Estatísticas de autos de infração
- Relatórios de auditoria
- Métricas de uso do sistema

### Exportações:
- Listas em CSV
- Relatórios em PDF
- Dados para impressão
- Backup de informações

## 🔧 Aspectos Técnicos

### Backend:
- **Novas Entidades:** AutoInfracao, AnexoAutoInfracao, LogAuditoriaAutoInfracao
- **Repositories:** Consultas otimizadas com filtros complexos
- **Services:** Implementação completa das regras de negócio
- **Controllers:** Segurança por perfil com @PreAuthorize
- **DTOs:** Estruturas otimizadas para entrada e saída

### Frontend:
- **Componentes Angular:** Formulários reativos e listas interativas
- **Guards:** Proteção de rotas por perfil
- **Services:** Integração com APIs do backend
- **Interceptors:** Tratamento de erros e autenticação
- **Responsividade:** CSS Grid e Flexbox

### Banco de Dados:
- **Novas Tabelas:** auto_infracao, anexo_auto_infracao, log_auditoria_auto_infracao
- **Índices:** Otimização para consultas frequentes
- **Constraints:** Validação de integridade referencial
- **Triggers:** Auditoria automática de alterações

## 🚀 Migração da Versão 1.0

### Processo de Atualização:
1. Backup completo dos dados atuais
2. Execução de scripts de migração
3. Atualização do código-fonte
4. Testes de funcionalidade
5. Deploy em produção

### Compatibilidade:
- Dados existentes preservados
- Funcionalidades anteriores mantidas
- Novos campos opcionais
- Interface aprimorada

## 📞 Suporte e Treinamento

### Documentação:
- Manual do usuário atualizado
- Guias de funcionalidades
- Tutoriais em vídeo
- FAQ expandido

### Treinamento:
- Sessões para agentes voluntários
- Capacitação para supervisores
- Workshop para administradores
- Material de apoio

---

**Versão:** 2.0  
**Data:** 17/06/2025  
**Autor:** Equipe de Desenvolvimento  
**Revisão:** Corregedoria da Infância e Juventude

