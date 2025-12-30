# CLAUDE.md - Sistema Contábil Moderno (Substituição XTDC)

## 📋 CONTEXTO DO PROJETO

Cliente usa sistema contábil legado **XTDC** (WK Sistemas - anos 90) há décadas e precisa de modernização.

### Objetivo
Criar sistema contábil web moderno que:
- ✅ Substitua completamente o XTDC
- ✅ Importe dados históricos do sistema antigo
- ✅ Seja integrativo e extensível
- ✅ Interface moderna e intuitiva
- ✅ Multi-usuário e acessível via web

### Restrições do Cliente
- ⚠️ Empresa pequena, poucos usuários
- ⚠️ Sem tempo para reuniões longas
- ⚠️ Sem documentação de processos
- ⚠️ Sem acesso presencial frequente
- ⚠️ Dependência total do XTDC atualmente

---

## 🎯 ESCOPO - FASE 1 (MVP)

### Módulos Essenciais

#### 1. PLANO DE CONTAS
- Cadastro de contas contábeis (hierárquico)
- Código, descrição, tipo (ativo/passivo/receita/despesa)
- Natureza (devedora/credora)
- Nível hierárquico (1.1.1.1.01)
- Flag "aceita lançamento" (analítica/sintética)

#### 2. LANÇAMENTOS CONTÁBEIS
- Sistema de partidas dobradas (débito/crédito)
- Históricos padrão + complemento
- Lotes de lançamento
- Data, valor, documento
- Centro de custo (opcional)

#### 3. RELATÓRIOS OBRIGATÓRIOS
- **Balancete** (mensal/anual)
- **Livro Diário** (cronológico)
- **Livro Razão** (por conta)
- **DRE** (Demonstração Resultado Exercício)
- **Balanço Patrimonial**
- **Razão Analítico** (detalhado por conta)

#### 4. CONSULTAS
- Saldo de contas (por período)
- Extrato de conta
- Conciliação de lançamentos

#### 5. IMPORTAÇÃO XTDC
- Parser de arquivos .DAT/.LAN/.TXT do XTDC
- Migração de plano de contas
- Migração de lançamentos históricos
- Validação de consistência (débito=crédito)

---

## 🏗️ STACK TECNOLÓGICA SUGERIDA

```
Frontend: React + TypeScript + TailwindCSS
Backend: FastAPI + Python
Banco: PostgreSQL
Auth: JWT
Deploy: Docker
```

**Justificativa:** Cliente já usa essa stack em outros projetos (ControlHS, ChamadosHS)

---

## 📊 ESTRUTURA DE BANCO DE DADOS (Inicial)

### Tabelas Principais

```sql
-- 1. Plano de Contas
plano_contas (
    id, codigo, descricao, tipo, natureza, 
    nivel, conta_pai_id, aceita_lancamento, ativo
)

-- 2. Históricos Padrão
historicos (
    id, codigo, descricao, ativo
)

-- 3. Centro de Custos
centros_custo (
    id, codigo, descricao, ativo
)

-- 4. Lançamentos
lancamentos (
    id, data_lancamento, numero_lote, 
    historico_id, complemento, valor, usuario_id
)

-- 5. Partidas (débito/crédito)
partidas (
    id, lancamento_id, conta_id, 
    tipo, valor, centro_custo_id
)
```

---

## 📁 ARQUIVOS DO XTDC RECEBIDOS

Cliente enviou arquivos da pasta do XTDC:
- ✅ `.DAT` - Dados/tabelas (formato proprietário)
- ✅ `.LAN` - Lançamentos contábeis
- ✅ `.TXT` - Exportações texto
- ✅ `.LST` - Relatórios/listagens

### ⚠️ Formato Proprietário
Os arquivos `.DAT` **NÃO são DBF padrão**, são formato binário customizado do XTDC.

### Estratégia de Importação
1. Analisar estrutura binária dos arquivos
2. Criar parser específico para cada tipo
3. Validar dados antes da importação
4. Logs detalhados do processo

---

## 🎯 PRIORIDADES DE DESENVOLVIMENTO

### Sprint 1 - Base do Sistema (2 semanas)
- [ ] Setup do projeto (React + FastAPI)
- [ ] Banco de dados PostgreSQL
- [ ] CRUD Plano de Contas
- [ ] CRUD Históricos Padrão
- [ ] CRUD Centro de Custos

### Sprint 2 - Lançamentos (2 semanas)
- [ ] Interface de lançamento contábil
- [ ] Validação partidas dobradas
- [ ] Listagem de lançamentos
- [ ] Edição/exclusão de lançamentos

### Sprint 3 - Relatórios Básicos (2 semanas)
- [ ] Balancete
- [ ] Livro Diário
- [ ] Livro Razão
- [ ] Consulta de saldos

### Sprint 4 - Importação XTDC (2-3 semanas)
- [ ] Parser de arquivos XTDC
- [ ] Importação plano de contas
- [ ] Importação lançamentos
- [ ] Validação e logs

### Sprint 5 - Relatórios Avançados (2 semanas)
- [ ] DRE
- [ ] Balanço Patrimonial
- [ ] Razão Analítico
- [ ] Exportação Excel/PDF

---

## 🔧 FUNCIONALIDADES EXTRAS (Futuro)

### Fase 2
- Dashboard gerencial
- Gráficos e indicadores
- Conciliação bancária
- Exportação SPED Contábil

### Fase 3
- API para integrações
- Integração bancária (OFX)
- Integração NFe
- Multi-empresa
- Permissões por usuário

---

## 📝 REGRAS DE NEGÓCIO CONTÁBEIS

### Partidas Dobradas
- Todo lançamento tem débito(s) E crédito(s)
- Soma dos débitos = Soma dos créditos (SEMPRE)
- Um lançamento pode ter múltiplas partidas

### Plano de Contas
- Estrutura hierárquica (1, 1.1, 1.1.1, 1.1.1.01)
- Contas sintéticas: não aceitam lançamento (apenas agrupam)
- Contas analíticas: aceitam lançamento
- Natureza: Devedora (Ativo, Despesa) / Credora (Passivo, Receita)

### Tipos de Conta
- **1.x.x.x** = ATIVO
- **2.x.x.x** = PASSIVO
- **3.x.x.x** = PATRIMÔNIO LÍQUIDO
- **4.x.x.x** = RECEITAS
- **5.x.x.x** = DESPESAS

### Relatórios
- **Balancete**: Lista todas as contas com saldo no período
- **Diário**: Lançamentos em ordem cronológica
- **Razão**: Movimentação individual de cada conta
- **DRE**: Receitas - Despesas = Resultado
- **Balanço**: Ativo = Passivo + PL

---

## 🚨 PONTOS DE ATENÇÃO

1. **Dados Históricos**: Podem ter inconsistências (sistema antigo)
2. **Validação Rigorosa**: Implementar na importação
3. **Backup**: Sempre manter dados originais do XTDC
4. **Performance**: Relatórios podem ter muitos dados
5. **Auditoria**: Registrar quem fez o quê e quando

---

## 📚 RECURSOS ÚTEIS

### Documentação Contábil BR
- Lei 6.404/76 (Lei das S.A.)
- CPC - Comitê de Pronunciamentos Contábeis
- Resolução CFC sobre escrituração

### Referências Técnicas
- SPED Contábil (estrutura)
- Plano de Contas Referencial (Receita Federal)

---

## 🎬 COMO COMEÇAR

1. **Analisar arquivos XTDC enviados**
   - Criar scripts Python para ler .DAT/.LAN/.TXT
   - Documentar estrutura encontrada
   - Extrair plano de contas e lançamentos

2. **Setup inicial do projeto**
   - Backend FastAPI + PostgreSQL
   - Frontend React + TypeScript
   - Docker compose para desenvolvimento

3. **CRUD básico primeiro**
   - Plano de contas funcional
   - Depois lançamentos
   - Depois relatórios

4. **Validar com cliente**
   - Mostrar protótipo cedo
   - Ajustar conforme feedback
   - Iterações curtas

---

## ✅ CRITÉRIOS DE SUCESSO (MVP)

- [ ] Sistema consegue importar dados do XTDC
- [ ] Balancete bate com XTDC (validação)
- [ ] Usuários conseguem fazer lançamentos
- [ ] Relatórios principais funcionais
- [ ] Interface intuitiva e rápida
- [ ] Cliente aprova para uso paralelo

---

## 📞 PRÓXIMOS PASSOS

1. **URGENTE**: Solicitar pasta completa do XTDC (todos arquivos)
2. Criar parser dos arquivos do sistema legado
3. Setup ambiente de desenvolvimento
4. Começar pelo plano de contas

---

**Bora começar! 🚀**
