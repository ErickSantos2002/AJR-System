from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.centro_custo import CentroCusto
from app.schemas.centro_custo import CentroCustoCreate, CentroCustoUpdate, CentroCustoResponse

router = APIRouter(prefix="/centros-custo", tags=["Centros de Custo"])


@router.get("/", response_model=List[CentroCustoResponse])
def listar_centros_custo(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(CentroCusto)
    if ativo is not None:
        query = query.filter(CentroCusto.ativo == ativo)
    centros = query.offset(skip).limit(limit).all()
    return centros


@router.get("/{centro_id}", response_model=CentroCustoResponse)
def buscar_centro_custo(centro_id: int, db: Session = Depends(get_db)):
    centro = db.query(CentroCusto).filter(CentroCusto.id == centro_id).first()
    if not centro:
        raise HTTPException(status_code=404, detail="Centro de custo não encontrado")
    return centro


@router.post("/", response_model=CentroCustoResponse, status_code=status.HTTP_201_CREATED)
def criar_centro_custo(centro: CentroCustoCreate, db: Session = Depends(get_db)):
    db_centro = db.query(CentroCusto).filter(CentroCusto.codigo == centro.codigo).first()
    if db_centro:
        raise HTTPException(status_code=400, detail="Código já cadastrado")

    novo_centro = CentroCusto(**centro.model_dump())
    db.add(novo_centro)
    db.commit()
    db.refresh(novo_centro)
    return novo_centro


@router.put("/{centro_id}", response_model=CentroCustoResponse)
def atualizar_centro_custo(
    centro_id: int,
    centro: CentroCustoUpdate,
    db: Session = Depends(get_db)
):
    db_centro = db.query(CentroCusto).filter(CentroCusto.id == centro_id).first()
    if not db_centro:
        raise HTTPException(status_code=404, detail="Centro de custo não encontrado")

    update_data = centro.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_centro, field, value)

    db.commit()
    db.refresh(db_centro)
    return db_centro


@router.delete("/{centro_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_centro_custo(centro_id: int, db: Session = Depends(get_db)):
    db_centro = db.query(CentroCusto).filter(CentroCusto.id == centro_id).first()
    if not db_centro:
        raise HTTPException(status_code=404, detail="Centro de custo não encontrado")

    db_centro.ativo = False
    db.commit()
    return None
