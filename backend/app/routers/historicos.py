from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.historico import Historico
from app.schemas.historico import HistoricoCreate, HistoricoUpdate, HistoricoResponse

router = APIRouter(prefix="/historicos", tags=["Históricos Padrão"])


@router.get("/", response_model=List[HistoricoResponse])
def listar_historicos(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(Historico)
    if ativo is not None:
        query = query.filter(Historico.ativo == ativo)
    historicos = query.offset(skip).limit(limit).all()
    return historicos


@router.get("/{historico_id}", response_model=HistoricoResponse)
def buscar_historico(historico_id: int, db: Session = Depends(get_db)):
    historico = db.query(Historico).filter(Historico.id == historico_id).first()
    if not historico:
        raise HTTPException(status_code=404, detail="Histórico não encontrado")
    return historico


@router.post("/", response_model=HistoricoResponse, status_code=status.HTTP_201_CREATED)
def criar_historico(historico: HistoricoCreate, db: Session = Depends(get_db)):
    db_historico = db.query(Historico).filter(Historico.codigo == historico.codigo).first()
    if db_historico:
        raise HTTPException(status_code=400, detail="Código já cadastrado")

    novo_historico = Historico(**historico.model_dump())
    db.add(novo_historico)
    db.commit()
    db.refresh(novo_historico)
    return novo_historico


@router.put("/{historico_id}", response_model=HistoricoResponse)
def atualizar_historico(
    historico_id: int,
    historico: HistoricoUpdate,
    db: Session = Depends(get_db)
):
    db_historico = db.query(Historico).filter(Historico.id == historico_id).first()
    if not db_historico:
        raise HTTPException(status_code=404, detail="Histórico não encontrado")

    update_data = historico.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_historico, field, value)

    db.commit()
    db.refresh(db_historico)
    return db_historico


@router.delete("/{historico_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_historico(historico_id: int, db: Session = Depends(get_db)):
    db_historico = db.query(Historico).filter(Historico.id == historico_id).first()
    if not db_historico:
        raise HTTPException(status_code=404, detail="Histórico não encontrado")

    db_historico.ativo = False
    db.commit()
    return None
