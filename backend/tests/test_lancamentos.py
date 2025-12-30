import pytest


@pytest.fixture
def contas_setup(client):
    """Cria contas necessárias para lançamentos"""
    conta_debito = {
        "codigo": "1.1.01",
        "descricao": "Caixa",
        "tipo": "ATIVO",
        "natureza": "DEVEDORA",
        "nivel": 3,
        "aceita_lancamento": True,
        "ativo": True
    }
    conta_credito = {
        "codigo": "4.1.01",
        "descricao": "Receita de Serviços",
        "tipo": "RECEITA",
        "natureza": "CREDORA",
        "nivel": 3,
        "aceita_lancamento": True,
        "ativo": True
    }

    r1 = client.post("/plano-contas/", json=conta_debito)
    r2 = client.post("/plano-contas/", json=conta_credito)

    return {
        "conta_debito_id": r1.json()["id"],
        "conta_credito_id": r2.json()["id"]
    }


@pytest.fixture
def historico_setup(client):
    """Cria histórico para lançamentos"""
    historico = {
        "codigo": "001",
        "descricao": "Recebimento de cliente",
        "ativo": True
    }
    response = client.post("/historicos/", json=historico)
    return response.json()["id"]


def test_criar_lancamento_valido(client, contas_setup, historico_setup):
    """Testa criação de lançamento com partidas dobradas válidas"""
    lancamento_data = {
        "data_lancamento": "2024-01-15",
        "numero_lote": "001",
        "historico_id": historico_setup,
        "complemento": "Recebimento ref. NF 1234",
        "partidas": [
            {
                "conta_id": contas_setup["conta_debito_id"],
                "tipo": "DEBITO",
                "valor": 1000.00
            },
            {
                "conta_id": contas_setup["conta_credito_id"],
                "tipo": "CREDITO",
                "valor": 1000.00
            }
        ]
    }

    response = client.post("/lancamentos/", json=lancamento_data)
    assert response.status_code == 201
    data = response.json()
    assert len(data["partidas"]) == 2
    assert "id" in data


def test_criar_lancamento_partidas_invalidas(client, contas_setup, historico_setup):
    """Testa erro ao criar lançamento com débito != crédito"""
    lancamento_data = {
        "data_lancamento": "2024-01-15",
        "historico_id": historico_setup,
        "partidas": [
            {
                "conta_id": contas_setup["conta_debito_id"],
                "tipo": "DEBITO",
                "valor": 1000.00
            },
            {
                "conta_id": contas_setup["conta_credito_id"],
                "tipo": "CREDITO",
                "valor": 500.00  # Valor diferente!
            }
        ]
    }

    response = client.post("/lancamentos/", json=lancamento_data)
    assert response.status_code == 422  # Validation error


def test_listar_lancamentos(client, contas_setup, historico_setup):
    """Testa listagem de lançamentos"""
    lancamento_data = {
        "data_lancamento": "2024-01-15",
        "historico_id": historico_setup,
        "partidas": [
            {
                "conta_id": contas_setup["conta_debito_id"],
                "tipo": "DEBITO",
                "valor": 1000.00
            },
            {
                "conta_id": contas_setup["conta_credito_id"],
                "tipo": "CREDITO",
                "valor": 1000.00
            }
        ]
    }

    client.post("/lancamentos/", json=lancamento_data)

    response = client.get("/lancamentos/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
