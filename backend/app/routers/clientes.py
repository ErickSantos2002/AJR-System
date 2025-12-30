from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.get("/", response_model=List[ClienteResponse])
def listar_clientes(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(Cliente)
    if ativo is not None:
        query = query.filter(Cliente.ativo == ativo)
    clientes = query.offset(skip).limit(limit).all()
    return clientes


@router.get("/{cliente_id}", response_model=ClienteResponse)
def buscar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente


@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def criar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    db_cliente = db.query(Cliente).filter(Cliente.cpf_cnpj == cliente.cpf_cnpj).first()
    if db_cliente:
        raise HTTPException(status_code=400, detail="CPF/CNPJ já cadastrado")

    novo_cliente = Cliente(**cliente.model_dump())
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def atualizar_cliente(
    cliente_id: int,
    cliente: ClienteUpdate,
    db: Session = Depends(get_db)
):
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    update_data = cliente.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cliente, field, value)

    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    db_cliente.ativo = False
    db.commit()
    return None
