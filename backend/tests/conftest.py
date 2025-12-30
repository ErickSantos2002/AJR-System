import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# Banco de dados de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Cria um banco de dados limpo para cada teste"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Cliente HTTP de teste"""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# Fixtures de dados de teste

@pytest.fixture
def equipamento_data():
    return {
        "tipo": "CAMINHAO",
        "placa": "ABC1234",
        "identificador": "CAM-001",
        "modelo": "Ford Cargo 1719",
        "marca": "Ford",
        "ano_fabricacao": 2020,
        "valor_aquisicao": 150000.00,
        "ativo": True
    }


@pytest.fixture
def cliente_data():
    return {
        "nome": "Empresa Teste Ltda",
        "tipo_pessoa": "J",
        "cpf_cnpj": "12.345.678/0001-90",
        "telefone": "(11) 98765-4321",
        "email": "contato@empresateste.com",
        "endereco": "Rua Teste, 123",
        "cidade": "São Paulo",
        "estado": "SP",
        "cep": "01234-567",
        "ativo": True
    }


@pytest.fixture
def motorista_data():
    return {
        "nome": "João Silva",
        "cpf": "123.456.789-00",
        "cnh": "12345678900",
        "categoria_cnh": "D",
        "validade_cnh": "2025-12-31",
        "telefone": "(11) 91234-5678",
        "ativo": True
    }


@pytest.fixture
def plano_contas_data():
    return {
        "codigo": "1.1.01",
        "descricao": "Caixa",
        "tipo": "ATIVO",
        "natureza": "DEVEDORA",
        "nivel": 3,
        "aceita_lancamento": True,
        "ativo": True
    }


@pytest.fixture
def historico_data():
    return {
        "codigo": "001",
        "descricao": "Pagamento de fornecedor",
        "ativo": True
    }


@pytest.fixture
def centro_custo_data():
    return {
        "codigo": "CC001",
        "descricao": "Administrativo",
        "ativo": True
    }
