# Testes Automatizados - AJR System Backend

Testes automatizados usando pytest para todas as APIs do sistema.

## Instalação

Instalar dependências de teste:

```bash
pip install -r requirements-test.txt
```

## Executar Testes

### Todos os testes

```bash
pytest
```

### Testes específicos

```bash
# Apenas testes de equipamentos
pytest tests/test_equipamentos.py

# Apenas testes de lançamentos
pytest tests/test_lancamentos.py

# Teste específico
pytest tests/test_equipamentos.py::test_criar_equipamento
```

### Com coverage

```bash
pytest --cov=app --cov-report=html
```

Depois abrir `htmlcov/index.html` no navegador.

### Modo verbose

```bash
pytest -v
```

### Parar no primeiro erro

```bash
pytest -x
```

## Estrutura dos Testes

```
tests/
├── conftest.py              # Fixtures compartilhadas
├── test_equipamentos.py     # Testes de equipamentos
├── test_clientes.py         # Testes de clientes
├── test_motoristas.py       # Testes de motoristas
├── test_contratos.py        # Testes de contratos
├── test_plano_contas.py     # Testes de plano de contas
├── test_historicos.py       # Testes de históricos
├── test_centros_custo.py    # Testes de centros de custo
├── test_viagens.py          # Testes de viagens
├── test_abastecimentos.py   # Testes de abastecimentos
├── test_manutencoes.py      # Testes de manutenções
└── test_lancamentos.py      # Testes de lançamentos contábeis
```

## Fixtures Disponíveis

- `client` - Cliente HTTP de teste
- `db` - Sessão de banco de dados de teste
- `equipamento_data` - Dados de teste para equipamento
- `cliente_data` - Dados de teste para cliente
- `motorista_data` - Dados de teste para motorista
- `plano_contas_data` - Dados de teste para conta contábil
- `historico_data` - Dados de teste para histórico
- `centro_custo_data` - Dados de teste para centro de custo

## Padrão de Teste

Cada entidade tem testes para:

- ✅ Criar (POST)
- ✅ Listar (GET /)
- ✅ Buscar por ID (GET /{id})
- ✅ Atualizar (PUT /{id})
- ✅ Deletar (DELETE /{id})
- ✅ Validações de erro (duplicados, não encontrado, etc)

## Exemplo de Teste

```python
def test_criar_equipamento(client, equipamento_data):
    response = client.post("/equipamentos/", json=equipamento_data)
    assert response.status_code == 201
    data = response.json()
    assert data["identificador"] == equipamento_data["identificador"]
    assert "id" in data
```

## Coverage Esperado

Meta: **>80%** de cobertura de código

## CI/CD

Os testes rodam automaticamente no pipeline de CI/CD antes de cada deploy.
