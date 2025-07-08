# Changelog - Sistema de Agentes Voluntários

## Versão 2.0.0 - 17/06/2025

### ✨ Novas Funcionalidades

#### 📋 **Cadastro de Agentes Aprimorado**
- **Novos campos adicionados:**
  - Foto do agente (upload de imagem)
  - Número da Carteira de Identidade
  - Data de Expedição da CI
  - Nacionalidade
  - Naturalidade
  - UF (Estados brasileiros)
  - Data de Nascimento
  - Filiação Pai
  - Filiação Mãe

#### 🏛️ **Dados das Comarcas de Minas Gerais**
- Integração completa com **298 comarcas** de MG
- Dados importados do arquivo oficial ComarcasMG-ComarcaeCódigo.xlsx
- Campo de seleção atualizado com todas as comarcas

#### 📊 **Painel de Agentes no Dashboard**
- **Grid interativo** com dados dos agentes voluntários
- **Colunas exibidas:** Nome, CPF, Status, Comarca, Validade, Data Cadastro
- **Funcionalidades de filtro:**
  - Filtro por nome
  - Filtro por status (Ativo, Inativo, Em Análise, Revogado)
  - Filtro por comarca
  - Filtro por validade
- **Exportação de dados:**
  - Exportação para CSV
  - Exportação para PDF
  - Função de impressão
- **Paginação** e navegação otimizada

### 🎨 **Melhorias de Interface**

#### 📱 **Responsividade Completa**
- **Design responsivo** para smartphones e tablets
- **Breakpoints otimizados:** 320px, 576px, 768px, 1024px+
- **Componentes adaptados:**
  - Formulários responsivos
  - Tabelas com scroll horizontal
  - Menu de navegação mobile
  - Botões e elementos interativos
  - Espaçamentos e tipografia

#### 🧭 **Navegação Aprimorada**
- **Botão "Voltar"** em todas as telas
- **Menu fixo no topo** com logo TJMG
- **Dashboard** adicionado ao menu principal
- **Cores atualizadas** para vermelho TJMG (#dc3545)

### 🔧 **Melhorias Técnicas**

#### 🗄️ **Backend (Java/Spring Boot)**
- **Entidade AgenteVoluntario** expandida com novos campos
- **DTOs atualizados** para suportar novos dados
- **Suporte a upload de imagens** via Base64
- **Validações** para novos campos

#### 🌐 **Frontend (Angular)**
- **Componente PainelAgentes** criado
- **Formulário de cadastro** expandido e organizado
- **Estados brasileiros** integrados
- **Upload de foto** com validação de tamanho e formato
- **Estilos responsivos** globais implementados

#### 📄 **Emissão de Credenciais**
- **Código da credencial** incluído
- **Novos campos** adicionados à credencial:
  - Foto do agente
  - Dados de documentação
  - Informações de filiação
  - Dados de nascimento

### 🐛 **Correções**

#### 📱 **Consulta QR Code Mobile**
- **Correção identificada** para consulta via QR Code em smartphones
- **Melhorias de responsividade** na página de consulta pública
- **JavaScript otimizado** para navegadores móveis

### 📚 **Documentação**
- **Versão incrementada** para 2.0.0
- **Changelog** detalhado criado
- **Documentação técnica** atualizada

---

## Versão 1.0.0 - 16/06/2025

### ✨ Funcionalidades Iniciais
- Sistema base de gestão de agentes voluntários
- Cadastro básico de agentes
- Emissão de credenciais com QR Code
- Consulta pública
- Autenticação gov.br
- Interface administrativa

---

**Desenvolvido para:** Tribunal de Justiça de Minas Gerais (TJMG)  
**Tecnologias:** Java 17, Spring Boot 3.2, Angular 17, Bootstrap 5

