from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.motorista import Motorista
from app.schemas.motorista import MotoristaCreate, MotoristaUpdate, MotoristaResponse

router = APIRouter(prefix="/motoristas", tags=["Motoristas"])


@router.get("/", response_model=List[MotoristaResponse])
def listar_motoristas(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(Motorista)
    if ativo is not None:
        query = query.filter(Motorista.ativo == ativo)
    motoristas = query.offset(skip).limit(limit).all()
    return motoristas


@router.get("/{motorista_id}", response_model=MotoristaResponse)
def buscar_motorista(motorista_id: int, db: Session = Depends(get_db)):
    motorista = db.query(Motorista).filter(Motorista.id == motorista_id).first()
    if not motorista:
        raise HTTPException(status_code=404, detail="Motorista não encontrado")
    return motorista


@router.post("/", response_model=MotoristaResponse, status_code=status.HTTP_201_CREATED)
def criar_motorista(motorista: MotoristaCreate, db: Session = Depends(get_db)):
    db_motorista = db.query(Motorista).filter(Motorista.cpf == motorista.cpf).first()
    if db_motorista:
        raise HTTPException(status_code=400, detail="CPF já cadastrado")

    novo_motorista = Motorista(**motorista.model_dump())
    db.add(novo_motorista)
    db.commit()
    db.refresh(novo_motorista)
    return novo_motorista


@router.put("/{motorista_id}", response_model=MotoristaResponse)
def atualizar_motorista(
    motorista_id: int,
    motorista: MotoristaUpdate,
    db: Session = Depends(get_db)
):
    db_motorista = db.query(Motorista).filter(Motorista.id == motorista_id).first()
    if not db_motorista:
        raise HTTPException(status_code=404, detail="Motorista não encontrado")

    update_data = motorista.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_motorista, field, value)

    db.commit()
    db.refresh(db_motorista)
    return db_motorista


@router.delete("/{motorista_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_motorista(motorista_id: int, db: Session = Depends(get_db)):
    db_motorista = db.query(Motorista).filter(Motorista.id == motorista_id).first()
    if not db_motorista:
        raise HTTPException(status_code=404, detail="Motorista não encontrado")

    db_motorista.ativo = False
    db.commit()
    return None
