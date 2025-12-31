from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.lancamento import Lancamento
from app.models.partida import Partida
from app.schemas.lancamento import LancamentoCreate, LancamentoResponse

router = APIRouter(prefix="/lancamentos", tags=["Lançamentos Contábeis"])


@router.get("/", response_model=List[LancamentoResponse])
def listar_lancamentos(
    skip: int = 0,
    limit: int = 100,
    data_inicio: date = None,
    data_fim: date = None,
    numero_lote: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Lancamento)
    if data_inicio:
        query = query.filter(Lancamento.data_lancamento >= data_inicio)
    if data_fim:
        query = query.filter(Lancamento.data_lancamento <= data_fim)
    if numero_lote:
        query = query.filter(Lancamento.numero_lote == numero_lote)

    lancamentos = query.order_by(Lancamento.data_lancamento.desc()).offset(skip).limit(limit).all()
    return lancamentos


@router.get("/{lancamento_id}", response_model=LancamentoResponse)
def buscar_lancamento(lancamento_id: int, db: Session = Depends(get_db)):
    lancamento = db.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
    if not lancamento:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    return lancamento


@router.post("/", response_model=LancamentoResponse, status_code=status.HTTP_201_CREATED)
def criar_lancamento(lancamento: LancamentoCreate, db: Session = Depends(get_db)):
    # A validação de partidas dobradas já é feita pelo schema Pydantic
    # mas vamos garantir aqui também

    from decimal import Decimal
    from app.models.partida import TipoPartida

    debitos = sum(p.valor for p in lancamento.partidas if p.tipo == TipoPartida.DEBITO)
    creditos = sum(p.valor for p in lancamento.partidas if p.tipo == TipoPartida.CREDITO)

    if debitos != creditos:
        raise HTTPException(
            status_code=400,
            detail=f"Partidas dobradas inválidas: débitos ({debitos}) != créditos ({creditos})"
        )

    # Criar o lançamento
    lancamento_data = lancamento.model_dump(exclude={'partidas'})
    novo_lancamento = Lancamento(**lancamento_data)
    db.add(novo_lancamento)
    db.flush()  # Flush para gerar o ID do lançamento

    # Criar as partidas
    for partida_data in lancamento.partidas:
        partida = Partida(
            lancamento_id=novo_lancamento.id,
            **partida_data.model_dump()
        )
        db.add(partida)

    db.commit()
    db.refresh(novo_lancamento)
    return novo_lancamento


@router.put("/{lancamento_id}", response_model=LancamentoResponse)
def atualizar_lancamento(lancamento_id: int, lancamento: LancamentoCreate, db: Session = Depends(get_db)):
    from decimal import Decimal
    from app.models.partida import TipoPartida

    # Buscar lançamento existente
    db_lancamento = db.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
    if not db_lancamento:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")

    # Validar partidas dobradas
    debitos = sum(p.valor for p in lancamento.partidas if p.tipo == TipoPartida.DEBITO)
    creditos = sum(p.valor for p in lancamento.partidas if p.tipo == TipoPartida.CREDITO)

    if debitos != creditos:
        raise HTTPException(
            status_code=400,
            detail=f"Partidas dobradas inválidas: débitos ({debitos}) != créditos ({creditos})"
        )

    # Atualizar dados do lançamento
    for key, value in lancamento.model_dump(exclude={'partidas'}).items():
        setattr(db_lancamento, key, value)

    # Deletar partidas antigas
    db.query(Partida).filter(Partida.lancamento_id == lancamento_id).delete()

    # Criar novas partidas
    for partida_data in lancamento.partidas:
        partida = Partida(
            lancamento_id=db_lancamento.id,
            **partida_data.model_dump()
        )
        db.add(partida)

    db.commit()
    db.refresh(db_lancamento)
    return db_lancamento


@router.delete("/{lancamento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_lancamento(lancamento_id: int, db: Session = Depends(get_db)):
    db_lancamento = db.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
    if not db_lancamento:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")

    # As partidas serão deletadas automaticamente por causa do cascade
    db.delete(db_lancamento)
    db.commit()
    return None
