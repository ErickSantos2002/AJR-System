from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.plano_contas import PlanoContas
from app.schemas.plano_contas import PlanoContasCreate, PlanoContasUpdate, PlanoContasResponse

router = APIRouter(prefix="/plano-contas", tags=["Plano de Contas"])


@router.get("/", response_model=List[PlanoContasResponse])
def listar_contas(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(PlanoContas)
    if ativo is not None:
        query = query.filter(PlanoContas.ativo == ativo)
    contas = query.order_by(PlanoContas.codigo).offset(skip).limit(limit).all()
    return contas


@router.get("/{conta_id}", response_model=PlanoContasResponse)
def buscar_conta(conta_id: int, db: Session = Depends(get_db)):
    conta = db.query(PlanoContas).filter(PlanoContas.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return conta


@router.get("/codigo/{codigo}", response_model=PlanoContasResponse)
def buscar_conta_por_codigo(codigo: str, db: Session = Depends(get_db)):
    conta = db.query(PlanoContas).filter(PlanoContas.codigo == codigo).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    return conta


@router.post("/", response_model=PlanoContasResponse, status_code=status.HTTP_201_CREATED)
def criar_conta(conta: PlanoContasCreate, db: Session = Depends(get_db)):
    db_conta = db.query(PlanoContas).filter(PlanoContas.codigo == conta.codigo).first()
    if db_conta:
        raise HTTPException(status_code=400, detail="Código de conta já cadastrado")

    if conta.conta_pai_id:
        conta_pai = db.query(PlanoContas).filter(PlanoContas.id == conta.conta_pai_id).first()
        if not conta_pai:
            raise HTTPException(status_code=400, detail="Conta pai não encontrada")

    nova_conta = PlanoContas(**conta.model_dump())
    db.add(nova_conta)
    db.commit()
    db.refresh(nova_conta)
    return nova_conta


@router.put("/{conta_id}", response_model=PlanoContasResponse)
def atualizar_conta(
    conta_id: int,
    conta: PlanoContasUpdate,
    db: Session = Depends(get_db)
):
    db_conta = db.query(PlanoContas).filter(PlanoContas.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    update_data = conta.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_conta, field, value)

    db.commit()
    db.refresh(db_conta)
    return db_conta


@router.delete("/{conta_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_conta(conta_id: int, db: Session = Depends(get_db)):
    db_conta = db.query(PlanoContas).filter(PlanoContas.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta não encontrada")

    db_conta.ativo = False
    db.commit()
    return None
