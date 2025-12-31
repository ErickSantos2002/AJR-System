# TODO - Frontend AJR System

## 🚨 CRÍTICO - BUGS A CORRIGIR

### Dashboard.tsx
- [ ] **URGENTE**: Corrigir erro que impede o Dashboard de carregar
  - Verificar endpoint `/dashboard/` na API
  - Adicionar tratamento de erro robusto
  - Verificar estrutura de dados retornada pela API
  - Adicionar fallback para dados vazios ou null

---

## 🎯 PRIORIDADE ALTA

### Componentes Reutilizáveis (Criar primeiro)
- [ ] Criar componente `LoadingSpinner` consistente (igual ao do Dashboard)
- [ ] Criar componente `ErrorMessage` para exibir erros
- [ ] Criar componente `EmptyState` para quando não há dados
- [ ] Criar componente `Modal` base reutilizável
- [ ] Criar componente `ConfirmDialog` para confirmações
- [ ] Criar componente `Toast/Notification` para feedback de ações
- [ ] Criar componente `Pagination` reutilizável
- [ ] Criar componente `TableActions` (editar/excluir)

### Sistema de Notificações
- [ ] Implementar sistema de notificações toast (react-hot-toast ou similar)
- [ ] Adicionar feedback visual para ações (sucesso, erro, carregando)
- [ ] Implementar tratamento de erro global

---

## 📋 POR PÁGINA

### 1. Dashboard.tsx
- [x] Página já possui design completo
- [ ] Adicionar tratamento de erro visual (card de erro)
- [ ] Adicionar botão de refresh manual
- [ ] Adicionar skeleton loading nos cards enquanto carrega
- [ ] Adicionar filtro de período (mês atual, últimos 3 meses, etc)
- [ ] Adicionar opção de exportar dados dos gráficos
- [ ] Adicionar mais KPIs relevantes
- [ ] Implementar atualização automática (polling ou websocket)

### 2. Clientes.tsx
- [ ] **Criar Modal de Cadastro/Edição**
  - Formulário completo com todos os campos
  - Validação de CPF/CNPJ
  - Máscara para telefone e documentos
  - Upload de documentos (opcional)

- [ ] **Funcionalidades CRUD**
  - Implementar função de criar cliente
  - Implementar função de editar cliente
  - Implementar função de excluir cliente (com confirmação)
  - Implementar função de ativar/inativar

- [ ] **Melhorias na Tabela**
  - Adicionar coluna de ações (editar/excluir)
  - Adicionar coluna de contato (telefone/email)
  - Adicionar ordenação por colunas
  - Adicionar paginação
  - Melhorar loading (usar spinner consistente)

- [ ] **Filtros Avançados**
  - Filtro por tipo (Física/Jurídica)
  - Filtro por status (Ativo/Inativo)
  - Filtro por cidade/estado
  - Limpar filtros

- [ ] **Visualização**
  - Criar página de detalhes do cliente
  - Mostrar histórico de lançamentos do cliente
  - Mostrar saldo devedor/credor

### 3. Equipamentos.tsx
- [ ] **Criar Modal de Cadastro/Edição**
  - Formulário completo com todos os campos
  - Upload de fotos do equipamento
  - Campos: ano, km/horímetro, chassi, renavam
  - Seleção de motorista responsável

- [ ] **Funcionalidades CRUD**
  - Implementar função de criar equipamento
  - Implementar função de editar equipamento
  - Implementar função de excluir equipamento (com confirmação)
  - Implementar função de ativar/inativar

- [ ] **Melhorias na Tabela**
  - Adicionar coluna de ações
  - Adicionar coluna de motorista responsável
  - Adicionar coluna de status operacional (operando/manutenção/parado)
  - Adicionar ordenação
  - Adicionar paginação
  - Melhorar loading

- [ ] **Filtros Avançados**
  - Filtro por tipo de equipamento
  - Filtro por status
  - Filtro por marca

- [ ] **Visualização**
  - Criar página de detalhes do equipamento
  - Mostrar histórico de manutenções
  - Mostrar custos operacionais
  - Mostrar alocação de motoristas

### 4. PlanoContas.tsx
- [ ] **Criar Modal de Cadastro/Edição**
  - Formulário para criar/editar conta
  - Seleção de conta pai (para hierarquia)
  - Validação de código único
  - Validação de natureza x tipo

- [ ] **Funcionalidades CRUD**
  - Implementar botão "Nova Conta"
  - Implementar função de criar conta
  - Implementar função de editar conta
  - Implementar função de excluir conta (validar se não tem lançamentos)
  - Implementar função de ativar/inativar

- [ ] **Melhorias na Tabela**
  - Adicionar coluna de ações
  - Implementar visualização em árvore (tree view)
  - Adicionar expansão/colapso de níveis
  - Adicionar ordenação
  - Melhorar loading

- [ ] **Visualização**
  - Melhorar indentação visual da hierarquia
  - Adicionar ícones para expandir/colapsar
  - Mostrar saldo de cada conta
  - Criar página de detalhes da conta com movimentações

### 5. Motoristas.tsx
- [ ] **Criar Modal de Cadastro/Edição**
  - Formulário completo com todos os campos
  - Upload de foto e documentos (CNH, ASO)
  - Campos: endereço, contato, data admissão
  - Validação de CPF
  - Validação de CNH

- [ ] **Funcionalidades CRUD**
  - Implementar função de criar motorista
  - Implementar função de editar motorista
  - Implementar função de excluir motorista (com confirmação)
  - Implementar função de ativar/inativar

- [ ] **Melhorias na Tabela**
  - Adicionar coluna de ações
  - Adicionar coluna de contato (telefone)
  - Adicionar coluna de equipamento alocado
  - Adicionar alerta visual para CNH vencida/próxima do vencimento
  - Adicionar ordenação
  - Adicionar paginação
  - Melhorar loading

- [ ] **Filtros Avançados**
  - Filtro por status
  - Filtro por categoria CNH
  - Filtro por CNH vencida/a vencer

- [ ] **Alertas e Notificações**
  - Alerta vermelho para CNH vencida
  - Alerta amarelo para CNH a vencer em 30 dias
  - Notificação de aniversário
  - Notificação de vencimento de ASO

- [ ] **Visualização**
  - Criar página de detalhes do motorista
  - Mostrar histórico de equipamentos operados
  - Mostrar histórico de viagens/serviços

### 6. Configuracoes.tsx
- [ ] **Históricos**
  - Criar modal para adicionar histórico
  - Implementar função de criar histórico
  - Implementar função de editar histórico
  - Implementar função de excluir histórico (validar se não tem lançamentos)
  - Adicionar coluna de ações

- [ ] **Centros de Custo**
  - Criar modal para adicionar centro de custo
  - Implementar função de criar centro de custo
  - Implementar função de editar centro de custo
  - Implementar função de excluir centro de custo (validar se não tem lançamentos)
  - Adicionar coluna de ações

- [ ] **Novas Abas de Configuração**
  - Criar aba "Usuários" para gerenciar usuários do sistema
  - Criar aba "Parâmetros" para configurações gerais
  - Criar aba "Backup" para fazer backup/restore do banco
  - Criar aba "Logs" para visualizar logs do sistema

- [ ] **Melhorias Gerais**
  - Melhorar loading
  - Adicionar tratamento de erro
  - Adicionar paginação se necessário

### 7. Lancamentos.tsx
- [ ] **Criar Modal de Cadastro/Edição**
  - Formulário de lançamento com partidas dobradas
  - Validação: débito = crédito
  - Seleção de conta do plano de contas
  - Seleção de histórico
  - Campo para complemento/observações
  - Seleção de centro de custo
  - Data do lançamento
  - Adicionar/remover partidas dinamicamente

- [ ] **Funcionalidades CRUD**
  - Implementar função de criar lançamento
  - Implementar função de editar lançamento (apenas rascunhos)
  - Implementar função de excluir lançamento (com confirmação)
  - Implementar função de confirmar lançamento (mudar status)

- [ ] **Melhorias na Listagem**
  - Adicionar ações (editar/excluir/confirmar)
  - Adicionar paginação (IMPORTANTE - pode ter muitos registros)
  - Adicionar ordenação por data
  - Melhorar loading
  - Adicionar badge de status (rascunho/confirmado)

- [ ] **Filtros Avançados**
  - Filtro por período (data inicial e final)
  - Filtro por conta
  - Filtro por histórico
  - Filtro por centro de custo
  - Filtro por status (rascunho/confirmado)
  - Filtro por valor (maior que, menor que)

- [ ] **Visualização e Relatórios**
  - Criar página de detalhes do lançamento
  - Adicionar botão de exportar para PDF
  - Adicionar botão de exportar para Excel
  - Criar relatório de razão
  - Criar relatório de diário
  - Criar relatório de balancete

---

## 🎨 MELHORIAS DE UX/UI

### Geral (Todas as Páginas)
- [ ] Adicionar breadcrumbs para navegação
- [ ] Adicionar botão "Voltar ao topo" em listas longas
- [ ] Melhorar estados vazios (empty states) com ilustrações
- [ ] Adicionar skeleton loading consistente
- [ ] Adicionar animações suaves nas transições
- [ ] Implementar tema escuro/claro (toggle)
- [ ] Adicionar atalhos de teclado (ex: Ctrl+N para novo)
- [ ] Melhorar responsividade mobile
- [ ] Adicionar tooltips informativos
- [ ] Implementar drag and drop onde faz sentido

### Acessibilidade
- [ ] Adicionar labels ARIA
- [ ] Garantir navegação por teclado
- [ ] Adicionar textos alternativos
- [ ] Melhorar contraste de cores
- [ ] Adicionar focus visible em elementos interativos

---

## ⚙️ MELHORIAS TÉCNICAS

### Performance
- [ ] Implementar lazy loading de imagens
- [ ] Implementar virtualização para listas grandes
- [ ] Otimizar re-renders com React.memo
- [ ] Implementar debounce em buscas
- [ ] Adicionar cache de requisições (React Query ou SWR)

### Validação e Segurança
- [ ] Implementar validação com Zod ou Yup
- [ ] Adicionar sanitização de inputs
- [ ] Implementar rate limiting no frontend
- [ ] Validar permissões de usuário antes de ações

### Testes
- [ ] Adicionar testes unitários (Jest + Testing Library)
- [ ] Adicionar testes de integração
- [ ] Adicionar testes E2E (Playwright ou Cypress)
- [ ] Configurar CI/CD para rodar testes

### Código
- [ ] Extrair lógica de negócio para hooks customizados
- [ ] Criar context para gerenciar estado global (user, auth, settings)
- [ ] Padronizar tratamento de erros
- [ ] Adicionar tipos TypeScript mais rigorosos
- [ ] Documentar componentes principais
- [ ] Adicionar JSDoc em funções complexas

---

## 📦 NOVAS FUNCIONALIDADES

### Autenticação e Autorização
- [ ] Implementar tela de login
- [ ] Implementar recuperação de senha
- [ ] Implementar controle de permissões por perfil
- [ ] Implementar sessão com token JWT
- [ ] Implementar logout automático por inatividade

### Dashboard Avançado
- [ ] Adicionar widgets personalizáveis
- [ ] Implementar drag and drop de widgets
- [ ] Salvar preferências do usuário
- [ ] Adicionar mais visualizações de dados

### Relatórios
- [ ] Criar módulo de relatórios gerenciais
- [ ] Implementar geração de PDF
- [ ] Implementar exportação para Excel
- [ ] Criar relatórios customizáveis
- [ ] Adicionar agendamento de relatórios

### Integrações
- [ ] Integração com API de CEP (buscar endereço)
- [ ] Integração com API de CNPJ (ReceitaWS)
- [ ] Envio de email (notificações)
- [ ] Exportação para contabilidade (SPED)

---

## 📱 MOBILE

- [ ] Criar versão PWA (Progressive Web App)
- [ ] Implementar menu hamburguer para mobile
- [ ] Otimizar tabelas para mobile (cards responsivos)
- [ ] Adicionar gestos (swipe para deletar, etc)
- [ ] Testar em diferentes tamanhos de tela

---

## 📝 DOCUMENTAÇÃO

- [ ] Documentar estrutura do projeto
- [ ] Criar guia de contribuição
- [ ] Documentar APIs e endpoints
- [ ] Criar changelog
- [ ] Adicionar README com instruções de instalação

---

## 🔄 PRIORIZAÇÃO SUGERIDA

### Sprint 1 - Fundação (1-2 semanas)
1. Corrigir bug crítico do Dashboard
2. Criar componentes reutilizáveis
3. Implementar sistema de notificações
4. Adicionar loading e error states em todas as páginas

### Sprint 2 - CRUD Básico (2-3 semanas)
1. Implementar modais de cadastro/edição
2. Implementar funções de criar/editar/excluir
3. Adicionar validações de formulário
4. Adicionar confirmações antes de deletar

### Sprint 3 - Melhorias UX (1-2 semanas)
1. Adicionar paginação
2. Adicionar filtros avançados
3. Adicionar ordenação
4. Melhorar estados vazios

### Sprint 4 - Funcionalidades Avançadas (2-3 semanas)
1. Páginas de detalhes
2. Relatórios básicos
3. Exportação de dados
4. Autenticação completa

### Sprint 5 - Polimento (1-2 semanas)
1. Testes
2. Acessibilidade
3. Performance
4. Documentação

---

**Última atualização:** 2025-12-30
**Total de tarefas:** ~150+
**Estimativa total:** 9-12 semanas de desenvolvimento
