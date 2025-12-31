# Dashboard - Plano de Melhorias

## 🚨 PROBLEMAS IDENTIFICADOS

### Performance
- ✅ Dashboard está carregando (endpoint retorna 200 OK)
- ⚠️ **Demora para carregar os dados** - precisa otimizar
- ⚠️ **Recarrega toda vez que volta para a página** - sem cache
- ⚠️ Gráficos podem estar lentos para renderizar

---

## 🎯 MELHORIAS PRIORITÁRIAS

### 1. Implementar Sistema de Cache (URGENTE)

**Problema:** Toda vez que navega entre páginas e volta, recarrega tudo do zero.

**Soluções possíveis:**

#### Opção A: React Query (RECOMENDADO)
- ✅ Cache automático com revalidação inteligente
- ✅ Refetch em background
- ✅ Retry automático em caso de erro
- ✅ Loading e error states automáticos
- ✅ Invalidação de cache fácil

```bash
npm install @tanstack/react-query
```

#### Opção B: SWR (Alternativa)
- ✅ Similar ao React Query, mais leve
- ✅ Cache automático

```bash
npm install swr
```

#### Opção C: Cache Manual (Não recomendado)
- Context API + localStorage
- Mais trabalho manual
- Menos features

**Decisão:** Usar **React Query** por ser mais completo e robusto.

---

### 2. Otimização de Performance

#### Backend
- [ ] Verificar se o endpoint `/dashboard/` está otimizado
- [ ] Adicionar índices no banco de dados
- [ ] Implementar cache no backend (Redis?)
- [ ] Verificar queries N+1
- [ ] Considerar paginação ou limitação de dados

#### Frontend
- [ ] Implementar lazy loading dos gráficos
- [ ] Usar React.memo para evitar re-renders desnecessários
- [ ] Virtualizar listas grandes se houver
- [ ] Code splitting para bibliotecas de gráficos (recharts)

---

### 3. Skeleton Loading

**Problema:** Loading atual é apenas um spinner genérico

**Solução:** Criar skeleton screens que mostram o layout antes dos dados

```tsx
// Exemplo de skeleton para os cards
<div className="bg-slate-900/50 rounded-2xl p-6 animate-pulse">
  <div className="h-10 w-10 bg-slate-700 rounded-xl mb-4"></div>
  <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
  <div className="h-8 bg-slate-700 rounded w-3/4"></div>
</div>
```

---

### 4. Tratamento de Erro Visual

**Problema:** Se der erro, não mostra nada amigável ao usuário

**Solução:**
- [ ] Card de erro com opção de retentar
- [ ] Mostrar mensagem específica do erro
- [ ] Botão para recarregar dados

---

### 5. Funcionalidades Adicionais

- [ ] **Botão de Refresh Manual**
  - Permite atualizar dados sem recarregar a página
  - Indicador visual de "carregando"

- [ ] **Filtro de Período**
  - Dropdown: Hoje / Esta Semana / Este Mês / Últimos 3 Meses / Últimos 6 Meses / Este Ano
  - Atualiza gráficos e KPIs baseado no período selecionado

- [ ] **Exportar Dados**
  - Exportar gráficos como imagem (PNG)
  - Exportar dados como Excel/CSV
  - Gerar PDF do dashboard

- [ ] **Auto-refresh Opcional**
  - Toggle para ativar/desativar
  - Atualiza a cada X minutos
  - Mostra último horário de atualização

- [ ] **Indicadores Adicionais**
  - Comparação com mês anterior (% crescimento)
  - Alertas de contas a vencer
  - Previsão de fluxo de caixa
  - Top 5 clientes / despesas

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### Sprint 1 - Cache e Performance (Prioridade ALTA)

#### Etapa 1: Configurar React Query
```bash
# Instalar dependência
npm install @tanstack/react-query

# Criar arquivos:
# - src/lib/queryClient.ts (configuração)
# - src/hooks/useDashboard.ts (hook customizado)
```

#### Etapa 2: Refatorar Dashboard.tsx
- [ ] Criar hook `useDashboard()` que usa React Query
- [ ] Configurar cache de 5 minutos (staleTime)
- [ ] Configurar revalidação em background
- [ ] Remover useState e useEffect atuais
- [ ] Usar states do React Query (isLoading, isError, data)

#### Etapa 3: Configurar Provider no App
- [ ] Adicionar QueryClientProvider no App.tsx
- [ ] Configurar opções globais de cache
- [ ] Adicionar DevTools do React Query (dev mode)

---

### Sprint 2 - Skeleton Loading e Erros

#### Etapa 1: Criar Componente de Skeleton
- [ ] Criar `DashboardSkeleton.tsx`
- [ ] Replicar layout dos cards com animação pulse
- [ ] Usar quando `isLoading === true`

#### Etapa 2: Criar Componente de Erro
- [ ] Criar `DashboardError.tsx`
- [ ] Mostrar mensagem amigável
- [ ] Botão "Tentar Novamente" que chama `refetch()`
- [ ] Usar quando `isError === true`

---

### Sprint 3 - Funcionalidades Extras

#### Etapa 1: Filtro de Período
- [ ] Adicionar dropdown de período
- [ ] State para período selecionado
- [ ] Passar período como query param para API
- [ ] Atualizar cache quando mudar período

#### Etapa 2: Botão de Refresh
- [ ] Adicionar botão no header
- [ ] Chamar `refetch()` do React Query
- [ ] Mostrar spinner enquanto recarrega

#### Etapa 3: Auto-refresh (Opcional)
- [ ] Toggle no canto superior
- [ ] Usar `refetchInterval` do React Query
- [ ] Mostrar "última atualização"

---

## 🔧 CÓDIGO EXEMPLO

### Configuração do React Query

**src/lib/queryClient.ts**
```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            cacheTime: 10 * 60 * 1000, // 10 minutos
            refetchOnWindowFocus: true, // Revalida quando volta pro app
            retry: 2,
        },
    },
});
```

**src/App.tsx**
```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            {/* ... resto do app ... */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
```

**src/hooks/useDashboard.ts**
```typescript
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { DashboardData } from "../types";

export function useDashboard(period?: string) {
    return useQuery({
        queryKey: ["dashboard", period],
        queryFn: async () => {
            const params = period ? { period } : {};
            const { data } = await api.get<DashboardData>("/dashboard/", { params });
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: true,
    });
}
```

**src/pages/Dashboard.tsx (refatorado)**
```typescript
import { useDashboard } from "../hooks/useDashboard";
import DashboardSkeleton from "../components/DashboardSkeleton";
import DashboardError from "../components/DashboardError";

export default function Dashboard() {
    const { data, isLoading, isError, error, refetch } = useDashboard();

    if (isLoading) return <DashboardSkeleton />;
    if (isError) return <DashboardError error={error} onRetry={refetch} />;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* ... resto do código usando 'data' ... */}
        </div>
    );
}
```

---

## 📊 COMPARAÇÃO DE PERFORMANCE

### Antes (Estado Atual)
- ❌ Toda navegação = nova requisição
- ❌ Loading genérico sem feedback
- ❌ Sem tratamento de erro visual
- ❌ Possível lentidão no backend

### Depois (Com Melhorias)
- ✅ Cache de 5 minutos (não recarrega sempre)
- ✅ Revalidação inteligente em background
- ✅ Skeleton loading (feedback visual)
- ✅ Tratamento de erro amigável
- ✅ Botão de refresh manual
- ✅ Otimizações de performance

---

## 🎯 OBJETIVOS DE PERFORMANCE

- **Tempo de carregamento inicial:** < 1 segundo
- **Tempo de navegação de volta:** < 100ms (cache)
- **Feedback visual:** Imediato (skeleton)
- **Taxa de erro:** < 1% (com retry automático)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Setup (30min)
- [ ] Instalar @tanstack/react-query
- [ ] Criar queryClient.ts
- [ ] Adicionar QueryClientProvider no App.tsx
- [ ] Adicionar DevTools

### Fase 2: Hook Customizado (30min)
- [ ] Criar useDashboard.ts
- [ ] Configurar queryKey e queryFn
- [ ] Definir staleTime e cacheTime

### Fase 3: Refatorar Dashboard (1h)
- [ ] Remover useState e useEffect
- [ ] Usar useDashboard hook
- [ ] Atualizar renderização condicional

### Fase 4: Skeleton Loading (1h)
- [ ] Criar DashboardSkeleton.tsx
- [ ] Replicar estrutura com animação
- [ ] Integrar no Dashboard

### Fase 5: Error Handling (30min)
- [ ] Criar DashboardError.tsx
- [ ] Adicionar botão de retry
- [ ] Integrar no Dashboard

### Fase 6: Funcionalidades Extras (2h)
- [ ] Botão de refresh manual
- [ ] Filtro de período
- [ ] Auto-refresh opcional
- [ ] Timestamp última atualização

### Fase 7: Otimização Backend (variável)
- [ ] Analisar queries do endpoint /dashboard/
- [ ] Adicionar índices no banco
- [ ] Implementar cache no backend se necessário

---

**Tempo total estimado:** 5-6 horas
**Impacto esperado:** Alto (melhoria significativa na UX)
**Prioridade:** 🔥 ALTA
