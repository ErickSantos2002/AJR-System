# AJR System - Backend

Backend do sistema contábil AJR System desenvolvido com FastAPI e PostgreSQL.

## Stack

- **FastAPI** - Framework web
- **PostgreSQL** - Banco de dados
- **SQLAlchemy** - ORM
- **Alembic** - Migrations
- **Pydantic** - Validação de dados

## Instalação

### 1. Criar ambiente virtual

```bash
python -m venv venv
```

### 2. Ativar ambiente virtual

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as credenciais do seu banco de dados.

## Migrations

### Criar nova migration

```bash
alembic revision --autogenerate -m "descrição da migration"
```

### Aplicar migrations

```bash
alembic upgrade head
```

### Reverter migration

```bash
alembic downgrade -1
```

## Executar

### Desenvolvimento

```bash
uvicorn app.main:app --reload --port 8000
```

### Produção

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /` - Informações da API
- `GET /health` - Health check
- `GET /docs` - Documentação Swagger
- `GET /redoc` - Documentação ReDoc

## Estrutura do Banco de Dados

### Tabelas

- **plano_contas** - Plano de contas contábil (hierárquico)
- **historicos** - Históricos padrão para lançamentos
- **centros_custo** - Centros de custo
- **lancamentos** - Lançamentos contábeis
- **partidas** - Partidas de débito/crédito (partidas dobradas)

## Regras de Negócio

### Partidas Dobradas
- Todo lançamento deve ter no mínimo 2 partidas
- Soma dos débitos = Soma dos créditos (sempre)

### Plano de Contas
- Estrutura hierárquica (1, 1.1, 1.1.1, etc)
- Contas sintéticas não aceitam lançamento
- Contas analíticas aceitam lançamento
