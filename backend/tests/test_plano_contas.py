def test_criar_conta(client, plano_contas_data):
    """Testa criação de conta contábil"""
    response = client.post("/plano-contas/", json=plano_contas_data)
    assert response.status_code == 201
    data = response.json()
    assert data["codigo"] == plano_contas_data["codigo"]
    assert data["descricao"] == plano_contas_data["descricao"]
    assert "id" in data


def test_listar_contas(client, plano_contas_data):
    """Testa listagem de contas"""
    client.post("/plano-contas/", json=plano_contas_data)

    response = client.get("/plano-contas/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


def test_buscar_conta_por_codigo(client, plano_contas_data):
    """Testa busca de conta por código"""
    client.post("/plano-contas/", json=plano_contas_data)

    response = client.get(f"/plano-contas/codigo/{plano_contas_data['codigo']}")
    assert response.status_code == 200
    data = response.json()
    assert data["codigo"] == plano_contas_data["codigo"]


def test_criar_conta_codigo_duplicado(client, plano_contas_data):
    """Testa erro ao criar conta com código duplicado"""
    client.post("/plano-contas/", json=plano_contas_data)

    response = client.post("/plano-contas/", json=plano_contas_data)
    assert response.status_code == 400
