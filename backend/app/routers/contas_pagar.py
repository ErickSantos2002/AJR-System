from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models.conta_pagar import ContaPagar, StatusContaPagar
from app.schemas.conta_pagar import ContaPagarCreate, ContaPagarUpdate, ContaPagarResponse

router = APIRouter(prefix="/contas-pagar", tags=["Contas a Pagar"])


@router.get("/", response_model=List[ContaPagarResponse])
def listar_contas_pagar(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[StatusContaPagar] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    categoria: Optional[str] = None,
    fornecedor_id: Optional[int] = None,
    vencidas: Optional[bool] = None,  # True = só vencidas, False = só não vencidas
    db: Session = Depends(get_db)
):
    """Lista contas a pagar com filtros"""
    query = db.query(ContaPagar)

    # Filtro por status
    if status_filter:
        query = query.filter(ContaPagar.status == status_filter)

    # Filtro por período de vencimento
    if data_inicio:
        query = query.filter(ContaPagar.data_vencimento >= data_inicio)
    if data_fim:
        query = query.filter(ContaPagar.data_vencimento <= data_fim)

    # Filtro por categoria
    if categoria:
        query = query.filter(ContaPagar.categoria == categoria)

    # Filtro por fornecedor
    if fornecedor_id:
        query = query.filter(ContaPagar.fornecedor_id == fornecedor_id)

    # Filtro de contas vencidas (não pagas e com data de vencimento passada)
    if vencidas is not None:
        hoje = date.today()
        if vencidas:
            query = query.filter(
                and_(
                    ContaPagar.status != StatusContaPagar.PAGO,
                    ContaPagar.data_vencimento < hoje
                )
            )
        else:
            query = query.filter(
                or_(
                    ContaPagar.status == StatusContaPagar.PAGO,
                    ContaPagar.data_vencimento >= hoje
                )
            )

    # Ordenar por data de vencimento
    contas = query.order_by(ContaPagar.data_vencimento.asc()).offset(skip).limit(limit).all()

    # Atualizar status de contas vencidas automaticamente
    hoje = date.today()
    for conta in contas:
        if conta.status == StatusContaPagar.A_VENCER and conta.data_vencimento < hoje:
            conta.status = StatusContaPagar.VENCIDO
    db.commit()

    return contas


@router.get("/proximos-vencimentos", response_model=List[ContaPagarResponse])
def proximos_vencimentos(
    dias: int = Query(7, description="Número de dias para buscar vencimentos"),
    db: Session = Depends(get_db)
):
    """Retorna contas que vencem nos próximos X dias"""
    hoje = date.today()
    data_limite = hoje + timedelta(days=dias)

    contas = db.query(ContaPagar).filter(
        and_(
            ContaPagar.status.in_([StatusContaPagar.A_VENCER, StatusContaPagar.VENCIDO]),
            ContaPagar.data_vencimento >= hoje,
            ContaPagar.data_vencimento <= data_limite
        )
    ).order_by(ContaPagar.data_vencimento.asc()).all()

    return contas


@router.get("/resumo", response_model=dict)
def resumo_contas_pagar(db: Session = Depends(get_db)):
    """Retorna resumo das contas a pagar (hoje, semana, mês)"""
    hoje = date.today()
    fim_semana = hoje + timedelta(days=7)
    fim_mes = hoje + timedelta(days=30)

    # Contas a pagar hoje
    hoje_query = db.query(ContaPagar).filter(
        and_(
            ContaPagar.status != StatusContaPagar.PAGO,
            ContaPagar.data_vencimento == hoje
        )
    )
    total_hoje = sum(float(c.valor) for c in hoje_query.all())
    qtd_hoje = hoje_query.count()

    # Contas a pagar esta semana
    semana_query = db.query(ContaPagar).filter(
        and_(
            ContaPagar.status != StatusContaPagar.PAGO,
            ContaPagar.data_vencimento >= hoje,
            ContaPagar.data_vencimento <= fim_semana
        )
    )
    total_semana = sum(float(c.valor) for c in semana_query.all())
    qtd_semana = semana_query.count()

    # Contas a pagar este mês
    mes_query = db.query(ContaPagar).filter(
        and_(
            ContaPagar.status != StatusContaPagar.PAGO,
            ContaPagar.data_vencimento >= hoje,
            ContaPagar.data_vencimento <= fim_mes
        )
    )
    total_mes = sum(float(c.valor) for c in mes_query.all())
    qtd_mes = mes_query.count()

    # Contas vencidas
    vencidas_query = db.query(ContaPagar).filter(
        and_(
            ContaPagar.status != StatusContaPagar.PAGO,
            ContaPagar.data_vencimento < hoje
        )
    )
    total_vencidas = sum(float(c.valor) for c in vencidas_query.all())
    qtd_vencidas = vencidas_query.count()

    return {
        "hoje": {"total": total_hoje, "quantidade": qtd_hoje},
        "semana": {"total": total_semana, "quantidade": qtd_semana},
        "mes": {"total": total_mes, "quantidade": qtd_mes},
        "vencidas": {"total": total_vencidas, "quantidade": qtd_vencidas},
    }


@router.get("/{conta_id}", response_model=ContaPagarResponse)
def buscar_conta_pagar(conta_id: int, db: Session = Depends(get_db)):
    """Busca uma conta a pagar específica"""
    conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta a pagar não encontrada")
    return conta


@router.post("/", response_model=ContaPagarResponse, status_code=status.HTTP_201_CREATED)
def criar_conta_pagar(conta: ContaPagarCreate, db: Session = Depends(get_db)):
    """Cria uma nova conta a pagar"""
    nova_conta = ContaPagar(**conta.model_dump())
    db.add(nova_conta)
    db.commit()
    db.refresh(nova_conta)
    return nova_conta


@router.put("/{conta_id}", response_model=ContaPagarResponse)
def atualizar_conta_pagar(
    conta_id: int,
    conta: ContaPagarUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza uma conta a pagar"""
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta a pagar não encontrada")

    update_data = conta.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_conta, field, value)

    db.commit()
    db.refresh(db_conta)
    return db_conta


@router.patch("/{conta_id}/pagar", response_model=ContaPagarResponse)
def marcar_como_pago(
    conta_id: int,
    data_pagamento: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Marca uma conta como paga"""
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta a pagar não encontrada")

    db_conta.status = StatusContaPagar.PAGO
    db_conta.data_pagamento = data_pagamento or date.today()

    db.commit()
    db.refresh(db_conta)
    return db_conta


@router.delete("/{conta_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_conta_pagar(conta_id: int, db: Session = Depends(get_db)):
    """Deleta uma conta a pagar"""
    db_conta = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta a pagar não encontrada")

    db.delete(db_conta)
    db.commit()
    return None
