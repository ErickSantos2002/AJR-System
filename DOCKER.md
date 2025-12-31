# 🐳 AJR System - Guia Docker

Documentação completa para executar o AJR System usando Docker e Docker Compose.

## 📋 Pré-requisitos

- **Docker**: versão 20.10 ou superior
- **Docker Compose**: versão 2.0 ou superior

### Instalação do Docker

#### Windows
Instale o [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

#### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### macOS
Instale o [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)

### Verificar Instalação

```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/ajr-system.git
cd ajr-system
```

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# IMPORTANTE: Altere a senha do banco de dados!
```

### 3. Inicie os Serviços

```bash
# Construir e iniciar todos os serviços
docker-compose up -d
```

### 4. Executar Migrations

```bash
# As migrations são executadas automaticamente no backend
# Aguarde cerca de 10-15 segundos após o start
```

### 5. Criar Usuário Administrador

```bash
docker-compose exec backend python criar_admin_direto.py
```

**Credenciais padrão criadas:**
- Email: `admin@ajr.com`
- Senha: `admin123`

### 6. Acessar o Sistema

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **pgAdmin** (dev): http://localhost:5050

---

## 📦 Arquitetura dos Containers

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│                     ajr-network                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │              │  │              │  │              │ │
│  │   Frontend   │  │   Backend    │  │   Database   │ │
│  │   (Nginx)    │  │   (FastAPI)  │  │ (PostgreSQL) │ │
│  │   Port: 80   │  │  Port: 8000  │  │  Port: 5432  │ │
│  │              │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │        │
│         │                  │                  │        │
│         │                  └──────────────────┘        │
│         │                   (Depends on DB)            │
│         │                                              │
│         └──────────────────────────────────────────────┘
│                    (Depends on Backend)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Comandos Docker Compose

### Iniciar Serviços

```bash
# Iniciar todos os serviços
docker-compose up -d

# Iniciar com logs visíveis
docker-compose up

# Iniciar apenas alguns serviços
docker-compose up -d database backend
```

### Parar Serviços

```bash
# Parar todos os serviços
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar, remover containers e volumes
docker-compose down -v
```

### Ver Logs

```bash
# Logs de todos os serviços
docker-compose logs

# Logs de um serviço específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Seguir logs em tempo real
docker-compose logs -f backend
```

### Reconstruir Containers

```bash
# Reconstruir todos os serviços
docker-compose build

# Reconstruir sem cache
docker-compose build --no-cache

# Reconstruir e reiniciar
docker-compose up -d --build
```

### Executar Comandos nos Containers

```bash
# Backend
docker-compose exec backend bash
docker-compose exec backend python criar_admin_direto.py
docker-compose exec backend alembic upgrade head

# Database
docker-compose exec database psql -U postgres -d ajr_system

# Frontend (não há shell interativo no Nginx)
docker-compose exec frontend sh
```

---

## 🗄️ Gerenciamento de Banco de Dados

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec database pg_dump -U postgres ajr_system > backup.sql

# Backup com data
docker-compose exec database pg_dump -U postgres ajr_system > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Banco de Dados

```bash
# Restaurar backup
docker-compose exec -T database psql -U postgres ajr_system < backup.sql
```

### Acessar pgAdmin (Dev)

```bash
# Iniciar com pgAdmin
docker-compose --profile dev up -d

# Acessar: http://localhost:5050
# Email: admin@ajr.com
# Senha: admin (ou conforme .env)
```

**Configurar conexão no pgAdmin:**
- Host: `database`
- Port: `5432`
- Database: `ajr_system`
- Username: `postgres`
- Password: (conforme .env)

---

## 🔍 Monitoramento e Debug

### Status dos Containers

```bash
# Ver status de todos os containers
docker-compose ps

# Ver uso de recursos
docker stats
```

### Health Checks

```bash
# Backend health check
curl http://localhost:8000/health

# Frontend health check
curl http://localhost/

# Database health check
docker-compose exec database pg_isready -U postgres
```

### Inspecionar Containers

```bash
# Inspecionar backend
docker inspect ajr-backend

# Ver redes
docker network ls
docker network inspect ajr-system_ajr-network

# Ver volumes
docker volume ls
docker volume inspect ajr-system_postgres_data
```

---

## 🌍 Variáveis de Ambiente

### Arquivo .env

```env
# Database
DATABASE_NAME=ajr_system
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_aqui
DATABASE_PORT=5432

# Ports
BACKEND_PORT=8000
FRONTEND_PORT=80
PGADMIN_PORT=5050

# App
APP_NAME=AJR System API
DEBUG=False
```

### Sobrescrever Variáveis

```bash
# Via linha de comando
DATABASE_PASSWORD=novasenha docker-compose up -d

# Via arquivo específico
docker-compose --env-file .env.production up -d
```

---

## 🚀 Deploy em Produção

### 1. Configurações de Segurança

```env
# .env.production
DEBUG=False
DATABASE_PASSWORD=senha_forte_e_segura
SECRET_KEY=chave_secreta_unica_e_forte
ALLOWED_ORIGINS=https://seudominio.com
```

### 2. Usar HTTPS (Recomendado)

Adicione um container Nginx Proxy com SSL:

```yaml
# docker-compose.prod.yml
services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - ./certs:/etc/nginx/certs

  letsencrypt:
    image: nginxproxy/acme-companion
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    volumes_from:
      - nginx-proxy
```

### 3. Limitar Recursos

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 4. Iniciar em Produção

```bash
# Usar arquivo específico de produção
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🔐 Segurança

### Boas Práticas

✅ **Alterar senhas padrão**
```bash
# Gerar senha forte
openssl rand -base64 32
```

✅ **Não expor porta do banco**
```yaml
# Remover ou comentar em produção
# ports:
#   - "5432:5432"
```

✅ **Usar secrets do Docker**
```yaml
services:
  backend:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

✅ **Limitar privilégios**
```yaml
services:
  backend:
    user: "1000:1000"
    read_only: true
```

---

## 📊 Performance

### Otimizações

#### 1. Build Cache

```bash
# Aproveitar cache
docker-compose build

# Limpar cache antigo
docker builder prune
```

#### 2. Volumes para Desenvolvimento

```yaml
volumes:
  - ./backend:/app
  - /app/venv  # Não sobrescrever venv
```

#### 3. Resources Limits

```yaml
deploy:
  resources:
    limits:
      memory: 512M
```

---

## 🐛 Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs
docker-compose logs backend

# Verificar status
docker-compose ps

# Reconstruir
docker-compose up -d --build
```

### Problema: Erro de conexão com banco

```bash
# Verificar se banco está rodando
docker-compose ps database

# Testar conexão
docker-compose exec backend python -c "
from app.database import engine
try:
    with engine.connect() as conn:
        print('✅ Conexão OK')
except Exception as e:
    print(f'❌ Erro: {e}')
"
```

### Problema: Migrations não aplicadas

```bash
# Executar migrations manualmente
docker-compose exec backend alembic upgrade head

# Ver histórico
docker-compose exec backend alembic history
```

### Problema: Frontend não carrega

```bash
# Verificar logs do Nginx
docker-compose logs frontend

# Testar build local
cd frontend
npm run build
```

### Limpeza Completa

```bash
# Remover tudo e começar do zero
docker-compose down -v
docker system prune -a
docker volume prune
```

---

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🎯 Comandos Rápidos

```bash
# Start tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Restart um serviço
docker-compose restart backend

# Entrar no container
docker-compose exec backend bash

# Criar backup DB
docker-compose exec database pg_dump -U postgres ajr_system > backup.sql

# Parar tudo
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

<div align="center">

**Deploy facilitado com Docker 🐳**

[⬆ Voltar ao topo](#-ajr-system---guia-docker)

</div>
