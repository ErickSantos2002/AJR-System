# AJR System - Sistema de Gestão Contábil

<div align="center">

![AJR System](frontend/src/assets/logo_png.png)

**Sistema completo de gestão contábil e financeira com controle de equipamentos, viagens e contas.**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg)](https://www.postgresql.org/)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Autenticação](#autenticação)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **AJR System** é um sistema completo de gestão contábil e financeira desenvolvido para empresas de transporte e logística. O sistema oferece controle integrado de:

- **Contabilidade**: Plano de contas, lançamentos contábeis, contas a pagar e receber
- **Operacional**: Gestão de equipamentos, motoristas, viagens e abastecimentos
- **Cadastros**: Clientes, fornecedores e contratos
- **Administrativo**: Gestão de usuários e permissões

### Principais Diferenciais

✅ **Interface Moderna**: Design responsivo com Tailwind CSS e gradientes modernos
✅ **Autenticação Segura**: Sistema JWT com controle de permissões
✅ **Tempo Real**: Atualizações automáticas com React Query
✅ **Contabilidade Completa**: Sistema de partidas dobradas
✅ **Dashboard Interativo**: Visualização de dados financeiros e operacionais
✅ **Validações Robustas**: Validação de CPF/CNPJ, email e dados contábeis

---

## ⚡ Funcionalidades

### 🔐 Autenticação e Usuários
- Login com email e senha
- Tokens JWT com expiração de 30 dias
- Controle de permissões (Admin/Usuário)
- Gestão completa de usuários
- Proteção de rotas por autenticação

### 💼 Gestão Contábil
- **Plano de Contas**: Estrutura hierárquica com categorias
- **Lançamentos**: Sistema de partidas dobradas
- **Contas a Pagar**: Controle de despesas e pagamentos
- **Contas a Receber**: Controle de receitas e recebimentos
- **Dashboard**: Visualização de saldos e movimentações

### 📊 Cadastros
- **Clientes**: CPF/CNPJ, endereço completo, contatos
- **Equipamentos**: Veículos, máquinas e implementos
- **Motoristas**: Cadastro com CNH e documentação
- **Históricos**: Descrições padrão para lançamentos
- **Centros de Custo**: Departamentos e centros

### 🚛 Operacional
- **Viagens**: Controle de origem, destino e valores
- **Abastecimentos**: Registro de combustível por equipamento
- **Manutenções**: Histórico de manutenções preventivas e corretivas

---

## 🛠️ Tecnologias

### Backend
- **[Python 3.11+](https://www.python.org/)**: Linguagem principal
- **[FastAPI](https://fastapi.tiangolo.com/)**: Framework web moderno e rápido
- **[SQLAlchemy](https://www.sqlalchemy.org/)**: ORM para banco de dados
- **[Alembic](https://alembic.sqlalchemy.org/)**: Migrations de banco de dados
- **[PostgreSQL](https://www.postgresql.org/)**: Banco de dados relacional
- **[Pydantic](https://pydantic.dev/)**: Validação de dados
- **[Python-JOSE](https://python-jose.readthedocs.io/)**: Tokens JWT
- **[Passlib](https://passlib.readthedocs.io/)**: Hash de senhas com BCrypt

### Frontend
- **[React 18](https://reactjs.org/)**: Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática
- **[Vite](https://vitejs.dev/)**: Build tool e dev server
- **[React Router](https://reactrouter.com/)**: Roteamento
- **[TanStack Query](https://tanstack.com/query)**: Gerenciamento de estado servidor
- **[Axios](https://axios-http.com/)**: Cliente HTTP
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS
- **[Lucide React](https://lucide.dev/)**: Ícones modernos
- **[React Hot Toast](https://react-hot-toast.com/)**: Notificações

---

## 🏗️ Arquitetura

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐
│                 │ ◄─────────────────► │                  │
│  React Frontend │                     │  FastAPI Backend │
│   (Port 5173)   │                     │   (Port 8000)    │
│                 │                     │                  │
└─────────────────┘                     └────────┬─────────┘
                                                 │
                                                 │ SQLAlchemy
                                                 │
                                        ┌────────▼─────────┐
                                        │                  │
                                        │   PostgreSQL     │
                                        │   (Port 5432)    │
                                        │                  │
                                        └──────────────────┘
```

### Fluxo de Autenticação

```
┌────────┐      1. Login       ┌─────────┐      2. Validate    ┌──────────┐
│        │ ──────────────────► │         │ ──────────────────► │          │
│ Client │                     │   API   │                     │ Database │
│        │ ◄────────────────── │         │ ◄────────────────── │          │
└────────┘   3. JWT Token      └─────────┘   4. User Data      └──────────┘
     │
     │ 4. Store Token
     │    (localStorage)
     │
     ▼
┌─────────────────────────────────────────┐
│  Todas as requisições subsequentes      │
│  Authorization: Bearer <token>          │
└─────────────────────────────────────────┘
```

---

## 📦 Instalação

### Pré-requisitos

- Python 3.11 ou superior
- Node.js 18 ou superior
- PostgreSQL 16 ou superior
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/ajr-system.git
cd ajr-system
```

### 2. Configuração do Backend

```bash
# Navegue para o diretório do backend
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configuração do Frontend

```bash
# Navegue para o diretório do frontend
cd frontend

# Instale as dependências
npm install
```

---

## ⚙️ Configuração

### Backend - Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ajr_system
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha

# Application
APP_NAME=AJR System API
DEBUG=True
```

### Banco de Dados

```bash
# Crie o banco de dados PostgreSQL
createdb ajr_system

# Execute as migrations
cd backend
alembic upgrade head
```

### Criar Usuário Administrador

```bash
# Execute o script de criação de admin
python criar_admin_direto.py
```

**Credenciais padrão criadas:**
- Email: `admin@ajr.com`
- Senha: `admin123`

⚠️ **IMPORTANTE**: Altere estas credenciais após o primeiro login!

---

## 🚀 Executando o Projeto

### Desenvolvimento

#### 1. Inicie o Backend

```bash
cd backend
# Ative o ambiente virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Inicie o servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

O backend estará disponível em: **http://localhost:8000**
Documentação interativa (Swagger): **http://localhost:8000/docs**

#### 2. Inicie o Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

### Produção

#### Backend

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

---

## 📁 Estrutura do Projeto

```
ajr-system/
├── backend/
│   ├── alembic/                 # Migrations do banco de dados
│   │   └── versions/            # Arquivos de migration
│   ├── app/
│   │   ├── models/              # Modelos SQLAlchemy
│   │   │   ├── usuario.py
│   │   │   ├── cliente.py
│   │   │   ├── equipamento.py
│   │   │   └── ...
│   │   ├── routers/             # Endpoints da API
│   │   │   ├── auth.py
│   │   │   ├── clientes.py
│   │   │   ├── lancamentos.py
│   │   │   └── ...
│   │   ├── schemas/             # Schemas Pydantic
│   │   │   ├── auth.py
│   │   │   ├── cliente.py
│   │   │   └── ...
│   │   ├── auth.py              # Funções de autenticação
│   │   ├── config.py            # Configurações
│   │   ├── database.py          # Conexão com banco
│   │   └── main.py              # Aplicação principal
│   ├── criar_admin.py           # Script criar admin (interativo)
│   ├── criar_admin_direto.py    # Script criar admin (direto)
│   ├── requirements.txt         # Dependências Python
│   └── alembic.ini              # Configuração Alembic
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Configuração Axios
│   │   ├── components/          # Componentes React
│   │   │   ├── ClienteModal.tsx
│   │   │   ├── UsuarioModal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ...
│   │   ├── contexts/            # Contexts React
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/               # Custom Hooks
│   │   │   ├── useClientes.ts
│   │   │   ├── useUsuarios.ts
│   │   │   └── ...
│   │   ├── layouts/             # Layouts
│   │   │   └── MainLayout.tsx
│   │   ├── lib/                 # Utilitários
│   │   │   ├── masks.ts
│   │   │   ├── validators.ts
│   │   │   └── toast.ts
│   │   ├── pages/               # Páginas
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Usuarios.tsx
│   │   │   └── ...
│   │   ├── types/               # TypeScript types
│   │   │   ├── usuario.ts
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   ├── App.tsx              # Componente principal
│   │   └── main.tsx             # Entry point
│   ├── package.json             # Dependências Node
│   ├── tsconfig.json            # Config TypeScript
│   ├── vite.config.ts           # Config Vite
│   └── tailwind.config.js       # Config Tailwind
│
├── README.md                    # Este arquivo
└── .gitignore                   # Arquivos ignorados
```

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/token` | OAuth2 token | ❌ |
| GET | `/api/auth/me` | Usuário atual | ✅ |
| GET | `/api/auth/users` | Listar usuários | 👑 Admin |
| PATCH | `/api/auth/users/{id}` | Atualizar usuário | 👑 Admin |
| DELETE | `/api/auth/users/{id}` | Desativar usuário | 👑 Admin |

### Cadastros

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/clientes/` | Listar clientes | ✅ |
| POST | `/clientes/` | Criar cliente | ✅ |
| GET | `/clientes/{id}` | Buscar cliente | ✅ |
| PUT | `/clientes/{id}` | Atualizar cliente | ✅ |
| DELETE | `/clientes/{id}` | Deletar cliente | ✅ |

*Endpoints similares para:*
- `/equipamentos/`
- `/motoristas/`
- `/contratos/`

### Contabilidade

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/plano-contas/` | Listar contas | ✅ |
| POST | `/plano-contas/` | Criar conta | ✅ |
| GET | `/plano-contas/{id}/saldo` | Saldo da conta | ✅ |
| GET | `/lancamentos/` | Listar lançamentos | ✅ |
| POST | `/lancamentos/` | Criar lançamento | ✅ |
| GET | `/contas-pagar/` | Contas a pagar | ✅ |
| GET | `/contas-receber/` | Contas a receber | ✅ |

### Dashboard

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/dashboard/` | Dados do dashboard | ✅ |
| GET | `/contas-pagar/resumo` | Resumo contas a pagar | ✅ |
| GET | `/contas-receber/resumo` | Resumo contas a receber | ✅ |

**Documentação completa**: http://localhost:8000/docs (Swagger UI)

---

## 🔐 Autenticação

### Como Funciona

1. **Login**: Usuário envia email e senha para `/api/auth/login`
2. **Token**: API retorna JWT token válido por 30 dias
3. **Armazenamento**: Frontend armazena token no `localStorage`
4. **Requisições**: Token enviado no header: `Authorization: Bearer <token>`
5. **Validação**: Backend valida token em cada requisição protegida

### Permissões

- **Usuário Comum**: Acesso a todas as funcionalidades exceto gestão de usuários
- **Administrador**: Acesso completo incluindo gestão de usuários

### Exemplo de Uso

```typescript
// Login
const response = await api.post('/api/auth/login', {
  email: 'admin@ajr.com',
  senha: 'admin123'
});

const { access_token } = response.data;

// Usar token em requisições
api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

// Buscar dados do usuário
const user = await api.get('/api/auth/me');
```

---

## 📊 Funcionalidades Detalhadas

### Sistema de Partidas Dobradas

O sistema implementa contabilidade por partidas dobradas, onde cada lançamento possui:

- **Partidas de Débito**: Contas debitadas
- **Partidas de Crédito**: Contas creditadas
- **Validação**: Soma dos débitos = Soma dos créditos

Exemplo:
```json
{
  "data": "2024-12-31",
  "historico_id": 1,
  "valor_total": 1000.00,
  "partidas": [
    {
      "conta_id": 10,  // Caixa
      "tipo": "D",
      "valor": 1000.00
    },
    {
      "conta_id": 50,  // Receita de Vendas
      "tipo": "C",
      "valor": 1000.00
    }
  ]
}
```

### Validações Implementadas

- **CPF/CNPJ**: Validação com dígitos verificadores
- **Email**: Validação de formato RFC 5322
- **CEP**: Validação de formato brasileiro
- **Telefone**: Máscaras e validação
- **Valores**: Validação de saldos e totais contábeis

### Máscaras de Entrada

- CPF: `000.000.000-00`
- CNPJ: `00.000.000/0000-00`
- Telefone: `(00) 00000-0000`
- CEP: `00000-000`
- Valores monetários: `R$ 0.000,00`

---

## 🎨 Guia de Estilo

### Cores do Sistema

```css
/* Primárias */
--blue-500: #3b82f6;
--cyan-500: #06b6d4;

/* Background */
--slate-950: #020617;
--slate-900: #0f172a;
--slate-800: #1e293b;

/* Text */
--white: #ffffff;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
```

### Componentes UI

- **Botões**: Gradientes blue-500 → cyan-500
- **Cards**: Background slate-900/50 com backdrop-blur
- **Inputs**: Background slate-800/50 com border slate-700
- **Modais**: Overlays com backdrop-blur
- **Tabelas**: Hover states e dividers

---

## 🧪 Testes

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código

#### Backend (Python)
- Seguir PEP 8
- Usar Type Hints
- Documentar funções com docstrings
- Máximo 100 caracteres por linha

#### Frontend (TypeScript)
- Usar TypeScript estrito
- Componentes funcionais com hooks
- Props tipadas
- Usar Prettier para formatação

---

## 📝 Licença

Este projeto é proprietário e confidencial.

---

## 👥 Equipe

Desenvolvido para **AJR Transportes**

---

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@ajrsystem.com
- Documentação: http://localhost:8000/docs

---

## 🚧 Roadmap

### Em Desenvolvimento
- [ ] Relatórios em PDF
- [ ] Exportação para Excel
- [ ] Gráficos avançados
- [ ] Módulo de estoque
- [ ] Integração com e-mail

### Planejado
- [ ] App mobile
- [ ] API pública
- [ ] Integração com bancos
- [ ] Backup automático
- [ ] Multi-empresa

---

## 📚 Recursos Adicionais

- [Documentação FastAPI](https://fastapi.tiangolo.com/)
- [Documentação React](https://react.dev/)
- [Guia TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

<div align="center">

**Desenvolvido com ❤️ usando FastAPI + React**

[⬆ Voltar ao topo](#ajr-system---sistema-de-gestão-contábil)

</div>
