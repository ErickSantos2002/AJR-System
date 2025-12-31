from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models.conta_receber import ContaReceber, StatusContaReceber
from app.schemas.conta_receber import ContaReceberCreate, ContaReceberUpdate, ContaReceberResponse

router = APIRouter(prefix="/contas-receber", tags=["Contas a Receber"])


@router.get("/", response_model=List[ContaReceberResponse])
def listar_contas_receber(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[StatusContaReceber] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    categoria: Optional[str] = None,
    cliente_id: Optional[int] = None,
    atrasadas: Optional[bool] = None,  # True = só atrasadas, False = só em dia
    db: Session = Depends(get_db)
):
    """Lista contas a receber com filtros"""
    query = db.query(ContaReceber)

    # Filtro por status
    if status_filter:
        query = query.filter(ContaReceber.status == status_filter)

    # Filtro por período de vencimento
    if data_inicio:
        query = query.filter(ContaReceber.data_vencimento >= data_inicio)
    if data_fim:
        query = query.filter(ContaReceber.data_vencimento <= data_fim)

    # Filtro por categoria
    if categoria:
        query = query.filter(ContaReceber.categoria == categoria)

    # Filtro por cliente
    if cliente_id:
        query = query.filter(ContaReceber.cliente_id == cliente_id)

    # Filtro de contas atrasadas (não recebidas e com data de vencimento passada)
    if atrasadas is not None:
        hoje = date.today()
        if atrasadas:
            query = query.filter(
                and_(
                    ContaReceber.status != StatusContaReceber.RECEBIDO,
                    ContaReceber.data_vencimento < hoje
                )
            )
        else:
            query = query.filter(
                or_(
                    ContaReceber.status == StatusContaReceber.RECEBIDO,
                    ContaReceber.data_vencimento >= hoje
                )
            )

    # Ordenar por data de vencimento
    contas = query.order_by(ContaReceber.data_vencimento.asc()).offset(skip).limit(limit).all()

    # Atualizar status de contas atrasadas automaticamente
    hoje = date.today()
    for conta in contas:
        if conta.status == StatusContaReceber.A_RECEBER and conta.data_vencimento < hoje:
            conta.status = StatusContaReceber.ATRASADO
    db.commit()

    return contas


@router.get("/proximos-recebimentos", response_model=List[ContaReceberResponse])
def proximos_recebimentos(
    dias: int = Query(7, description="Número de dias para buscar recebimentos"),
    db: Session = Depends(get_db)
):
    """Retorna contas que vencem nos próximos X dias"""
    hoje = date.today()
    data_limite = hoje + timedelta(days=dias)

    contas = db.query(ContaReceber).filter(
        and_(
            ContaReceber.status.in_([StatusContaReceber.A_RECEBER, StatusContaReceber.ATRASADO]),
            ContaReceber.data_vencimento >= hoje,
            ContaReceber.data_vencimento <= data_limite
        )
    ).order_by(ContaReceber.data_vencimento.asc()).all()

    return contas


@router.get("/resumo", response_model=dict)
def resumo_contas_receber(db: Session = Depends(get_db)):
    """Retorna resumo das contas a receber (hoje, semana, mês)"""
    hoje = date.today()
    fim_semana = hoje + timedelta(days=7)
    fim_mes = hoje + timedelta(days=30)

    # Contas a receber hoje
    hoje_query = db.query(ContaReceber).filter(
        and_(
            ContaReceber.status != StatusContaReceber.RECEBIDO,
            ContaReceber.data_vencimento == hoje
        )
    )
    total_hoje = sum(float(c.valor) for c in hoje_query.all())
    qtd_hoje = hoje_query.count()

    # Contas a receber esta semana
    semana_query = db.query(ContaReceber).filter(
        and_(
            ContaReceber.status != StatusContaReceber.RECEBIDO,
            ContaReceber.data_vencimento >= hoje,
            ContaReceber.data_vencimento <= fim_semana
        )
    )
    total_semana = sum(float(c.valor) for c in semana_query.all())
    qtd_semana = semana_query.count()

    # Contas a receber este mês
    mes_query = db.query(ContaReceber).filter(
        and_(
            ContaReceber.status != StatusContaReceber.RECEBIDO,
            ContaReceber.data_vencimento >= hoje,
            ContaReceber.data_vencimento <= fim_mes
        )
    )
    total_mes = sum(float(c.valor) for c in mes_query.all())
    qtd_mes = mes_query.count()

    # Contas atrasadas
    atrasadas_query = db.query(ContaReceber).filter(
        and_(
            ContaReceber.status != StatusContaReceber.RECEBIDO,
            ContaReceber.data_vencimento < hoje
        )
    )
    total_atrasadas = sum(float(c.valor) for c in atrasadas_query.all())
    qtd_atrasadas = atrasadas_query.count()

    return {
        "hoje": {"total": total_hoje, "quantidade": qtd_hoje},
        "semana": {"total": total_semana, "quantidade": qtd_semana},
        "mes": {"total": total_mes, "quantidade": qtd_mes},
        "atrasadas": {"total": total_atrasadas, "quantidade": qtd_atrasadas},
    }


@router.get("/{conta_id}", response_model=ContaReceberResponse)
def buscar_conta_receber(conta_id: int, db: Session = Depends(get_db)):
    """Busca uma conta a receber específica"""
    conta = db.query(ContaReceber).filter(ContaReceber.id == conta_id).first()
    if not conta:
        raise HTTPException(status_code=404, detail="Conta a receber não encontrada")
    return conta


@router.post("/", response_model=ContaReceberResponse, status_code=status.HTTP_201_CREATED)
def criar_conta_receber(conta: ContaReceberCreate, db: Session = Depends(get_db)):
    """Cria uma nova conta a receber"""
    nova_conta = ContaReceber(**conta.model_dump())
    db.add(nova_conta)
    db.commit()
    db.refresh(nova_conta)
    return nova_conta


@router.put("/{conta_id}", response_model=ContaReceberResponse)
def atualizar_conta_receber(
    conta_id: int,
    conta: ContaReceberUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza uma conta a receber"""
    db_conta = db.query(ContaReceber).filter(ContaReceber.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta a receber não encontrada")

    update_data = conta.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_conta, field, value)

    db.commit()
    db.refresh(db_conta)
    return db_conta


@router.patch("/{conta_id}/receber", response_model=ContaReceberResponse)
def marcar_como_recebido(
    conta_id: int,
    data_recebimento: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Marca uma conta como recebida"""
    db_conta = db.query(ContaReceber).filter(ContaReceber.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta a receber não encontrada")

    db_conta.status = StatusContaReceber.RECEBIDO
    db_conta.data_recebimento = data_recebimento or date.today()

    db.commit()
    db.refresh(db_conta)
    return db_conta


@router.delete("/{conta_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_conta_receber(conta_id: int, db: Session = Depends(get_db)):
    """Deleta uma conta a receber"""
    db_conta = db.query(ContaReceber).filter(ContaReceber.id == conta_id).first()
    if not db_conta:
        raise HTTPException(status_code=404, detail="Conta a receber não encontrada")

    db.delete(db_conta)
    db.commit()
    return None
