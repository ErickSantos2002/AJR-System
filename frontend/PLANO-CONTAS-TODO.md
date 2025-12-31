# Plano de Contas - Melhorias

## 📋 **ANÁLISE DA PÁGINA ATUAL**

### ✅ **O que está funcionando:**
- Design bonito e consistente
- Busca por código e descrição
- Indentação hierárquica por nível
- Badges de tipo e natureza
- Indicador de aceita lançamento

### ❌ **Problemas identificados:**

1. **Falta CRUD completo** - Sem criar, editar ou excluir contas
2. **Loading simples** - Só texto, sem skeleton
3. **Sem cache** - Recarrega dados toda vez (sem React Query)
4. **Sem tratamento de erro** - Apenas console.error
5. **Visualização hierárquica limitada** - Poderia ter expand/collapse
6. **Sem coluna de ações** - Falta editar/excluir
7. **Sem ordenação** - Não ordena por colunas
8. **Sem filtros avançados** - Só busca por texto
9. **Sem paginação** - Pode ficar pesado com muitas contas
10. **Sem mostrar saldo** - Não exibe saldo atual da conta
11. **Sem exportação** - Poderia exportar plano de contas
12. **Sem validações** - Código único, conta pai válida, etc

---

## 🎯 **PLANO DE MELHORIAS**

### **Prioridade 1 - Fundação (Aplicar aprendizados do Dashboard)**

#### 1.1. React Query + Cache
- [ ] Criar hook `usePlanoContas()`
- [ ] Configurar cache de 10 minutos (plano de contas muda pouco)
- [ ] Auto-refresh opcional
- [ ] Refatorar componente para usar o hook

#### 1.2. Loading e Error States
- [ ] Criar `PlanoContasSkeleton.tsx`
- [ ] Criar `PlanoContasError.tsx`
- [ ] Integrar no componente

#### 1.3. Performance
- [ ] Verificar se backend está otimizado
- [ ] Adicionar índices se necessário
- [ ] Implementar lazy loading se lista for muito grande

---

### **Prioridade 2 - CRUD Completo**

#### 2.1. Modal de Cadastro/Edição
- [ ] Criar `PlanoContasModal.tsx`
- [ ] Campos do formulário:
  - Código (input com validação)
  - Descrição (textarea)
  - Tipo (select: ATIVO, PASSIVO, PATRIMONIO_LIQUIDO, RECEITA, DESPESA)
  - Natureza (select: DEVEDORA, CREDORA)
  - Conta Pai (select hierárquico - opcional)
  - Aceita Lançamento (checkbox)
  - Ativo (checkbox)
- [ ] Validações:
  - Código único
  - Código no formato correto (ex: 1.1.1.01)
  - Descrição obrigatória
  - Se tem conta pai, validar que existe
  - Natureza compatível com tipo

#### 2.2. Funções CRUD
- [ ] **Criar conta:**
  - POST `/plano-contas/`
  - Validar dados no frontend
  - Mostrar toast de sucesso/erro
  - Invalidar cache do React Query

- [ ] **Editar conta:**
  - PUT `/plano-contas/{id}`
  - Validar se não tem lançamentos (se mudar aceita_lancamento)
  - Atualizar cache

- [ ] **Excluir conta:**
  - DELETE `/plano-contas/{id}`
  - Validar se não tem lançamentos
  - Validar se não tem contas filhas
  - Modal de confirmação
  - Atualizar cache

- [ ] **Ativar/Inativar:**
  - PATCH `/plano-contas/{id}/toggle-ativo`
  - Atualizar cache

#### 2.3. Coluna de Ações
- [ ] Adicionar coluna "Ações" na tabela
- [ ] Botão "Editar" (ícone de lápis)
- [ ] Botão "Excluir" (ícone de lixeira)
- [ ] Dropdown de ações (3 pontos verticais)
- [ ] Mostrar apenas para contas que podem ser editadas/excluídas

---

### **Prioridade 3 - Visualização Hierárquica Melhorada**

#### 3.1. Tree View com Expand/Collapse
- [ ] Adicionar ícone de expand/collapse para contas com filhas
- [ ] Estado de expandido/colapsado por conta
- [ ] Botão "Expandir Tudo" / "Colapsar Tudo"
- [ ] Salvar estado no localStorage

#### 3.2. Navegação Visual
- [ ] Linhas conectando hierarquia (estilo tree)
- [ ] Cores diferentes por nível
- [ ] Ícones por tipo de conta
- [ ] Hover mostra caminho completo (breadcrumb)

#### 3.3. Filtro por Nível
- [ ] Dropdown para filtrar por nível (1, 2, 3, 4, 5)
- [ ] "Mostrar apenas sintéticas" (contas que não aceitam lançamento)
- [ ] "Mostrar apenas analíticas" (contas que aceitam lançamento)

---

### **Prioridade 4 - Saldo e Movimentações**

#### 4.1. Mostrar Saldo Atual
- [ ] Nova coluna "Saldo" na tabela
- [ ] Mostrar saldo atual de cada conta
- [ ] Cores: verde (saldo devedor em conta devedora), vermelho (saldo credor em conta devedora)
- [ ] Formato de moeda (R$)

#### 4.2. Modal de Detalhes da Conta
- [ ] Click na linha abre modal com detalhes
- [ ] Informações completas da conta
- [ ] Saldo atual
- [ ] Últimas 10 movimentações
- [ ] Gráfico de evolução do saldo (opcional)
- [ ] Botão "Ver Razão Completo" (link para relatório)

---

### **Prioridade 5 - Filtros e Ordenação**

#### 5.1. Filtros Avançados
- [ ] Filtro por Tipo (ATIVO, PASSIVO, etc)
- [ ] Filtro por Natureza (DEVEDORA, CREDORA)
- [ ] Filtro "Aceita Lançamento" (Sim/Não/Todos)
- [ ] Filtro "Ativo" (Sim/Não/Todos)
- [ ] Filtro por Nível (1, 2, 3, 4, 5)
- [ ] Botão "Limpar Filtros"

#### 5.2. Ordenação
- [ ] Click no header ordena por aquela coluna
- [ ] Seta indicando ordenação (asc/desc)
- [ ] Ordenar por:
  - Código (padrão)
  - Descrição
  - Tipo
  - Saldo (se mostrar saldo)
  - Data de criação

---

### **Prioridade 6 - Exportação e Importação**

#### 6.1. Exportação
- [ ] Botão "Exportar para Excel"
  - Todas as contas com hierarquia
  - Indentação no Excel
  - Cores por tipo
- [ ] Botão "Exportar para PDF"
  - Relatório formatado do plano de contas
  - Com hierarquia visual
- [ ] Botão "Exportar estrutura JSON"
  - Para backup/importação

#### 6.2. Importação (Opcional - Avançado)
- [ ] Upload de arquivo Excel/CSV
- [ ] Validação da estrutura
- [ ] Preview antes de importar
- [ ] Importar em lote

---

### **Prioridade 7 - Features Extras**

#### 7.1. Barra de Ações Superior
- [ ] Botão "Nova Conta" (destaque)
- [ ] Botão "Expandir Tudo" / "Colapsar Tudo"
- [ ] Dropdown de Filtros
- [ ] Botões de Exportação
- [ ] Campo de busca

#### 7.2. Paginação/Virtualização
- [ ] Se tiver muitas contas (>100), implementar virtualização
- [ ] OU paginação tradicional
- [ ] Mostrar total de contas

#### 7.3. Validações Avançadas
- [ ] Código deve seguir padrão (ex: 1.1.1.01)
- [ ] Impedir exclusão de conta com lançamentos
- [ ] Impedir exclusão de conta com filhas
- [ ] Avisar se mudar "Aceita Lançamento" e já tiver lançamentos
- [ ] Validar que conta pai aceita ter filhas (sintética)

#### 7.4. Dicas e Ajuda
- [ ] Tooltip explicando cada campo
- [ ] Ícone de ajuda (?) com informações
- [ ] Modal "Como usar o plano de contas"
- [ ] Exemplos de códigos válidos

---

## 🔧 **IMPLEMENTAÇÃO SUGERIDA**

### **Fase 1: Base (1-2 dias)**
1. React Query + hooks
2. Skeleton e Error components
3. Otimização de performance

### **Fase 2: CRUD (2-3 dias)**
1. Modal de cadastro/edição
2. Validações
3. Funções de criar/editar/excluir
4. Coluna de ações

### **Fase 3: UX (1-2 dias)**
1. Tree view com expand/collapse
2. Filtros avançados
3. Ordenação

### **Fase 4: Funcionalidades Extras (2-3 dias)**
1. Mostrar saldo
2. Modal de detalhes
3. Exportação
4. Barra de ações completa

---

## 📊 **ESTRUTURA DE COMPONENTES**

```
PlanoContasPage.tsx (principal)
├── usePlanoContas.ts (hook com React Query)
├── PlanoContasSkeleton.tsx (loading)
├── PlanoContasError.tsx (erro)
├── PlanoContasModal.tsx (criar/editar)
│   ├── PlanoContasForm.tsx (formulário)
│   └── ContaPaiSelect.tsx (select hierárquico)
├── PlanoContasTable.tsx (tabela)
│   ├── PlanoContasRow.tsx (linha com expand/collapse)
│   └── PlanoContasActions.tsx (ações)
├── PlanoContasFiltros.tsx (filtros avançados)
└── PlanoContasDetalhesModal.tsx (ver detalhes + saldo)
```

---

## 🎨 **MOCKUP DA INTERFACE**

```
┌─────────────────────────────────────────────────────────────┐
│ [Contabilidade]                                              │
│ Plano de Contas                                              │
│ Estrutura hierárquica de contas contábeis                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [🔍 Buscar...] [Tipo ▼] [Nível ▼]     [Expandir] [Exportar] │
│                                           [+ Nova Conta]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Código  │ Descrição          │ Tipo  │ Nat  │ Aceita │ Ações│
├─────────┼────────────────────┼───────┼──────┼────────┼──────┤
│ 1       │ ▼ ATIVO           │ ATIVO │ DEV  │   -    │  ... │
│ 1.1     │   ▼ Circulante    │ ATIVO │ DEV  │   -    │  ... │
│ 1.1.1   │     ▶ Caixa       │ ATIVO │ DEV  │   ✓    │ ✏️ 🗑️ │
│ 1.1.2   │     ▶ Bancos      │ ATIVO │ DEV  │   ✓    │ ✏️ 🗑️ │
└─────────┴────────────────────┴───────┴──────┴────────┴──────┘

Total: 245 conta(s) | Mostrando: 15 de 245
```

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

### React Query e Base
- [ ] Instalar dependências (se necessário)
- [ ] Criar `usePlanoContas.ts`
- [ ] Criar `PlanoContasSkeleton.tsx`
- [ ] Criar `PlanoContasError.tsx`
- [ ] Refatorar `PlanoContas.tsx`

### CRUD
- [ ] Criar `PlanoContasModal.tsx`
- [ ] Criar `PlanoContasForm.tsx`
- [ ] Implementar validações
- [ ] Endpoint POST `/plano-contas/`
- [ ] Endpoint PUT `/plano-contas/{id}`
- [ ] Endpoint DELETE `/plano-contas/{id}`
- [ ] Toast notifications

### UX
- [ ] Expand/collapse hierárquico
- [ ] Filtros avançados
- [ ] Ordenação por colunas
- [ ] Coluna de ações

### Extras
- [ ] Mostrar saldo
- [ ] Modal de detalhes
- [ ] Exportação Excel/PDF
- [ ] Importação (opcional)

---

**Estimativa total:** 6-10 dias de desenvolvimento
**Prioridade:** ALTA (Plano de contas é base do sistema contábil)
