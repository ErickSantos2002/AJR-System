from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.manutencao import Manutencao
from app.schemas.manutencao import ManutencaoCreate, ManutencaoUpdate, ManutencaoResponse

router = APIRouter(prefix="/manutencoes", tags=["Manutenções"])


@router.get("/", response_model=List[ManutencaoResponse])
def listar_manutencoes(
    skip: int = 0,
    limit: int = 100,
    equipamento_id: int = None,
    status_filtro: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Manutencao)
    if equipamento_id:
        query = query.filter(Manutencao.equipamento_id == equipamento_id)
    if status_filtro:
        query = query.filter(Manutencao.status == status_filtro)

    manutencoes = query.order_by(Manutencao.data_agendada.desc()).offset(skip).limit(limit).all()
    return manutencoes


@router.get("/{manutencao_id}", response_model=ManutencaoResponse)
def buscar_manutencao(manutencao_id: int, db: Session = Depends(get_db)):
    manutencao = db.query(Manutencao).filter(Manutencao.id == manutencao_id).first()
    if not manutencao:
        raise HTTPException(status_code=404, detail="Manutenção não encontrada")
    return manutencao


@router.post("/", response_model=ManutencaoResponse, status_code=status.HTTP_201_CREATED)
def criar_manutencao(manutencao: ManutencaoCreate, db: Session = Depends(get_db)):
    nova_manutencao = Manutencao(**manutencao.model_dump())
    db.add(nova_manutencao)
    db.commit()
    db.refresh(nova_manutencao)
    return nova_manutencao


@router.put("/{manutencao_id}", response_model=ManutencaoResponse)
def atualizar_manutencao(
    manutencao_id: int,
    manutencao: ManutencaoUpdate,
    db: Session = Depends(get_db)
):
    db_manutencao = db.query(Manutencao).filter(Manutencao.id == manutencao_id).first()
    if not db_manutencao:
        raise HTTPException(status_code=404, detail="Manutenção não encontrada")

    update_data = manutencao.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_manutencao, field, value)

    db.commit()
    db.refresh(db_manutencao)
    return db_manutencao


@router.delete("/{manutencao_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_manutencao(manutencao_id: int, db: Session = Depends(get_db)):
    db_manutencao = db.query(Manutencao).filter(Manutencao.id == manutencao_id).first()
    if not db_manutencao:
        raise HTTPException(status_code=404, detail="Manutenção não encontrada")

    db.delete(db_manutencao)
    db.commit()
    return None
