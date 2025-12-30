def test_criar_equipamento(client, equipamento_data):
    """Testa criação de equipamento"""
    response = client.post("/equipamentos/", json=equipamento_data)
    assert response.status_code == 201
    data = response.json()
    assert data["identificador"] == equipamento_data["identificador"]
    assert data["placa"] == equipamento_data["placa"]
    assert "id" in data


def test_listar_equipamentos(client, equipamento_data):
    """Testa listagem de equipamentos"""
    # Criar equipamento primeiro
    client.post("/equipamentos/", json=equipamento_data)

    # Listar
    response = client.get("/equipamentos/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["identificador"] == equipamento_data["identificador"]


def test_buscar_equipamento(client, equipamento_data):
    """Testa busca de equipamento por ID"""
    # Criar
    create_response = client.post("/equipamentos/", json=equipamento_data)
    equipamento_id = create_response.json()["id"]

    # Buscar
    response = client.get(f"/equipamentos/{equipamento_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == equipamento_id


def test_atualizar_equipamento(client, equipamento_data):
    """Testa atualização de equipamento"""
    # Criar
    create_response = client.post("/equipamentos/", json=equipamento_data)
    equipamento_id = create_response.json()["id"]

    # Atualizar
    update_data = {"modelo": "Scania R450"}
    response = client.put(f"/equipamentos/{equipamento_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["modelo"] == "Scania R450"


def test_deletar_equipamento(client, equipamento_data):
    """Testa deleção (desativação) de equipamento"""
    # Criar
    create_response = client.post("/equipamentos/", json=equipamento_data)
    equipamento_id = create_response.json()["id"]

    # Deletar
    response = client.delete(f"/equipamentos/{equipamento_id}")
    assert response.status_code == 204

    # Verificar que foi desativado
    get_response = client.get(f"/equipamentos/{equipamento_id}")
    assert get_response.json()["ativo"] == False


def test_criar_equipamento_duplicado(client, equipamento_data):
    """Testa erro ao criar equipamento com identificador duplicado"""
    # Criar primeiro
    client.post("/equipamentos/", json=equipamento_data)

    # Tentar criar novamente
    response = client.post("/equipamentos/", json=equipamento_data)
    assert response.status_code == 400
