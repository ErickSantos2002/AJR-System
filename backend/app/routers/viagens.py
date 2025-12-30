from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.viagem import Viagem
from app.schemas.viagem import ViagemCreate, ViagemUpdate, ViagemResponse

router = APIRouter(prefix="/viagens", tags=["Viagens"])


@router.get("/", response_model=List[ViagemResponse])
def listar_viagens(
    skip: int = 0,
    limit: int = 100,
    equipamento_id: int = None,
    motorista_id: int = None,
    data_inicio: date = None,
    data_fim: date = None,
    db: Session = Depends(get_db)
):
    query = db.query(Viagem)
    if equipamento_id:
        query = query.filter(Viagem.equipamento_id == equipamento_id)
    if motorista_id:
        query = query.filter(Viagem.motorista_id == motorista_id)
    if data_inicio:
        query = query.filter(Viagem.data_viagem >= data_inicio)
    if data_fim:
        query = query.filter(Viagem.data_viagem <= data_fim)

    viagens = query.order_by(Viagem.data_viagem.desc()).offset(skip).limit(limit).all()
    return viagens


@router.get("/{viagem_id}", response_model=ViagemResponse)
def buscar_viagem(viagem_id: int, db: Session = Depends(get_db)):
    viagem = db.query(Viagem).filter(Viagem.id == viagem_id).first()
    if not viagem:
        raise HTTPException(status_code=404, detail="Viagem não encontrada")
    return viagem


@router.post("/", response_model=ViagemResponse, status_code=status.HTTP_201_CREATED)
def criar_viagem(viagem: ViagemCreate, db: Session = Depends(get_db)):
    nova_viagem = Viagem(**viagem.model_dump())
    db.add(nova_viagem)
    db.commit()
    db.refresh(nova_viagem)
    return nova_viagem


@router.put("/{viagem_id}", response_model=ViagemResponse)
def atualizar_viagem(
    viagem_id: int,
    viagem: ViagemUpdate,
    db: Session = Depends(get_db)
):
    db_viagem = db.query(Viagem).filter(Viagem.id == viagem_id).first()
    if not db_viagem:
        raise HTTPException(status_code=404, detail="Viagem não encontrada")

    update_data = viagem.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_viagem, field, value)

    db.commit()
    db.refresh(db_viagem)
    return db_viagem


@router.delete("/{viagem_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_viagem(viagem_id: int, db: Session = Depends(get_db)):
    db_viagem = db.query(Viagem).filter(Viagem.id == viagem_id).first()
    if not db_viagem:
        raise HTTPException(status_code=404, detail="Viagem não encontrada")

    db.delete(db_viagem)
    db.commit()
    return None
