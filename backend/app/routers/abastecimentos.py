from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.abastecimento import Abastecimento
from app.schemas.abastecimento import AbastecimentoCreate, AbastecimentoUpdate, AbastecimentoResponse

router = APIRouter(prefix="/abastecimentos", tags=["Abastecimentos"])


@router.get("/", response_model=List[AbastecimentoResponse])
def listar_abastecimentos(
    skip: int = 0,
    limit: int = 100,
    equipamento_id: int = None,
    data_inicio: date = None,
    data_fim: date = None,
    db: Session = Depends(get_db)
):
    query = db.query(Abastecimento)
    if equipamento_id:
        query = query.filter(Abastecimento.equipamento_id == equipamento_id)
    if data_inicio:
        query = query.filter(Abastecimento.data_abastecimento >= data_inicio)
    if data_fim:
        query = query.filter(Abastecimento.data_abastecimento <= data_fim)

    abastecimentos = query.order_by(Abastecimento.data_abastecimento.desc()).offset(skip).limit(limit).all()
    return abastecimentos


@router.get("/{abastecimento_id}", response_model=AbastecimentoResponse)
def buscar_abastecimento(abastecimento_id: int, db: Session = Depends(get_db)):
    abastecimento = db.query(Abastecimento).filter(Abastecimento.id == abastecimento_id).first()
    if not abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")
    return abastecimento


@router.post("/", response_model=AbastecimentoResponse, status_code=status.HTTP_201_CREATED)
def criar_abastecimento(abastecimento: AbastecimentoCreate, db: Session = Depends(get_db)):
    novo_abastecimento = Abastecimento(**abastecimento.model_dump())
    db.add(novo_abastecimento)
    db.commit()
    db.refresh(novo_abastecimento)
    return novo_abastecimento


@router.put("/{abastecimento_id}", response_model=AbastecimentoResponse)
def atualizar_abastecimento(
    abastecimento_id: int,
    abastecimento: AbastecimentoUpdate,
    db: Session = Depends(get_db)
):
    db_abastecimento = db.query(Abastecimento).filter(Abastecimento.id == abastecimento_id).first()
    if not db_abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")

    update_data = abastecimento.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_abastecimento, field, value)

    db.commit()
    db.refresh(db_abastecimento)
    return db_abastecimento


@router.delete("/{abastecimento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_abastecimento(abastecimento_id: int, db: Session = Depends(get_db)):
    db_abastecimento = db.query(Abastecimento).filter(Abastecimento.id == abastecimento_id).first()
    if not db_abastecimento:
        raise HTTPException(status_code=404, detail="Abastecimento não encontrado")

    db.delete(db_abastecimento)
    db.commit()
    return None
