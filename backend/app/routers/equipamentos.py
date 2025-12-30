from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.equipamento import Equipamento
from app.schemas.equipamento import EquipamentoCreate, EquipamentoUpdate, EquipamentoResponse

router = APIRouter(prefix="/equipamentos", tags=["Equipamentos"])


@router.get("/", response_model=List[EquipamentoResponse])
def listar_equipamentos(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(Equipamento)
    if ativo is not None:
        query = query.filter(Equipamento.ativo == ativo)
    equipamentos = query.offset(skip).limit(limit).all()
    return equipamentos


@router.get("/{equipamento_id}", response_model=EquipamentoResponse)
def buscar_equipamento(equipamento_id: int, db: Session = Depends(get_db)):
    equipamento = db.query(Equipamento).filter(Equipamento.id == equipamento_id).first()
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return equipamento


@router.post("/", response_model=EquipamentoResponse, status_code=status.HTTP_201_CREATED)
def criar_equipamento(equipamento: EquipamentoCreate, db: Session = Depends(get_db)):
    db_equipamento = db.query(Equipamento).filter(
        Equipamento.identificador == equipamento.identificador
    ).first()
    if db_equipamento:
        raise HTTPException(status_code=400, detail="Identificador já cadastrado")

    if equipamento.placa:
        db_placa = db.query(Equipamento).filter(Equipamento.placa == equipamento.placa).first()
        if db_placa:
            raise HTTPException(status_code=400, detail="Placa já cadastrada")

    novo_equipamento = Equipamento(**equipamento.model_dump())
    db.add(novo_equipamento)
    db.commit()
    db.refresh(novo_equipamento)
    return novo_equipamento


@router.put("/{equipamento_id}", response_model=EquipamentoResponse)
def atualizar_equipamento(
    equipamento_id: int,
    equipamento: EquipamentoUpdate,
    db: Session = Depends(get_db)
):
    db_equipamento = db.query(Equipamento).filter(Equipamento.id == equipamento_id).first()
    if not db_equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")

    update_data = equipamento.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_equipamento, field, value)

    db.commit()
    db.refresh(db_equipamento)
    return db_equipamento


@router.delete("/{equipamento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_equipamento(equipamento_id: int, db: Session = Depends(get_db)):
    db_equipamento = db.query(Equipamento).filter(Equipamento.id == equipamento_id).first()
    if not db_equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")

    db_equipamento.ativo = False
    db.commit()
    return None
