def test_criar_cliente(client, cliente_data):
    """Testa criação de cliente"""
    response = client.post("/clientes/", json=cliente_data)
    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == cliente_data["nome"]
    assert data["cpf_cnpj"] == cliente_data["cpf_cnpj"]
    assert "id" in data


def test_listar_clientes(client, cliente_data):
    """Testa listagem de clientes"""
    client.post("/clientes/", json=cliente_data)

    response = client.get("/clientes/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


def test_buscar_cliente(client, cliente_data):
    """Testa busca de cliente por ID"""
    create_response = client.post("/clientes/", json=cliente_data)
    cliente_id = create_response.json()["id"]

    response = client.get(f"/clientes/{cliente_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == cliente_id


def test_atualizar_cliente(client, cliente_data):
    """Testa atualização de cliente"""
    create_response = client.post("/clientes/", json=cliente_data)
    cliente_id = create_response.json()["id"]

    update_data = {"telefone": "(11) 99999-9999"}
    response = client.put(f"/clientes/{cliente_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["telefone"] == "(11) 99999-9999"


def test_criar_cliente_cpf_cnpj_duplicado(client, cliente_data):
    """Testa erro ao criar cliente com CPF/CNPJ duplicado"""
    client.post("/clientes/", json=cliente_data)

    response = client.post("/clientes/", json=cliente_data)
    assert response.status_code == 400
