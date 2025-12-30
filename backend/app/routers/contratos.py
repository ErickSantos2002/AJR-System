from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.contrato_locacao import ContratoLocacao
from app.schemas.contrato_locacao import ContratoLocacaoCreate, ContratoLocacaoUpdate, ContratoLocacaoResponse

router = APIRouter(prefix="/contratos", tags=["Contratos de Locação"])


@router.get("/", response_model=List[ContratoLocacaoResponse])
def listar_contratos(
    skip: int = 0,
    limit: int = 100,
    status_filtro: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(ContratoLocacao)
    if status_filtro:
        query = query.filter(ContratoLocacao.status == status_filtro)
    contratos = query.offset(skip).limit(limit).all()
    return contratos


@router.get("/{contrato_id}", response_model=ContratoLocacaoResponse)
def buscar_contrato(contrato_id: int, db: Session = Depends(get_db)):
    contrato = db.query(ContratoLocacao).filter(ContratoLocacao.id == contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    return contrato


@router.post("/", response_model=ContratoLocacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_contrato(contrato: ContratoLocacaoCreate, db: Session = Depends(get_db)):
    db_contrato = db.query(ContratoLocacao).filter(
        ContratoLocacao.numero_contrato == contrato.numero_contrato
    ).first()
    if db_contrato:
        raise HTTPException(status_code=400, detail="Número de contrato já cadastrado")

    novo_contrato = ContratoLocacao(**contrato.model_dump())
    db.add(novo_contrato)
    db.commit()
    db.refresh(novo_contrato)
    return novo_contrato


@router.put("/{contrato_id}", response_model=ContratoLocacaoResponse)
def atualizar_contrato(
    contrato_id: int,
    contrato: ContratoLocacaoUpdate,
    db: Session = Depends(get_db)
):
    db_contrato = db.query(ContratoLocacao).filter(ContratoLocacao.id == contrato_id).first()
    if not db_contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")

    update_data = contrato.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contrato, field, value)

    db.commit()
    db.refresh(db_contrato)
    return db_contrato


@router.delete("/{contrato_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_contrato(contrato_id: int, db: Session = Depends(get_db)):
    db_contrato = db.query(ContratoLocacao).filter(ContratoLocacao.id == contrato_id).first()
    if not db_contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")

    db.delete(db_contrato)
    db.commit()
    return None
