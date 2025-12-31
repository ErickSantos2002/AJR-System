# Dashboard endpoint - v2
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta
from decimal import Decimal

from app.database import get_db
from app.models.lancamento import Lancamento
from app.models.partida import Partida
from app.models.plano_contas import PlanoContas
from app.models.cliente import Cliente
from app.models.equipamento import Equipamento
from app.models.motorista import Motorista

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

print(f"[DEBUG] Dashboard router criado: {router.prefix}")
print(f"[DEBUG] Router tem {len(router.routes)} rotas")


@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Retorna dados consolidados para o dashboard
    """
    hoje = datetime.now().date()
    inicio_mes = hoje.replace(day=1)

    # Total de registros
    total_clientes = db.query(Cliente).filter(Cliente.ativo == True).count()
    total_equipamentos = db.query(Equipamento).filter(Equipamento.ativo == True).count()
    total_motoristas = db.query(Motorista).filter(Motorista.ativo == True).count()
    total_lancamentos = db.query(Lancamento).count()

    # ========== SALDOS DAS CONTAS ==========

    # Caixa e Bancos (disponibilidades)
    disponibilidades = db.query(PlanoContas).filter(
        PlanoContas.codigo.like("1.1.1%"),
        PlanoContas.aceita_lancamento == True
    ).all()

    saldo_disponivel = Decimal(0)
    for conta in disponibilidades:
        debitos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "DEBITO"
        ).scalar() or Decimal(0)

        creditos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "CREDITO"
        ).scalar() or Decimal(0)

        saldo_disponivel += (debitos - creditos)

    # Clientes a Receber
    contas_receber = db.query(PlanoContas).filter(
        PlanoContas.codigo.like("1.1.2%"),
        PlanoContas.aceita_lancamento == True
    ).all()

    total_receber = Decimal(0)
    for conta in contas_receber:
        debitos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "DEBITO"
        ).scalar() or Decimal(0)

        creditos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "CREDITO"
        ).scalar() or Decimal(0)

        total_receber += (debitos - creditos)

    # Fornecedores a Pagar
    contas_pagar = db.query(PlanoContas).filter(
        PlanoContas.codigo.like("2.1.1%"),
        PlanoContas.aceita_lancamento == True
    ).all()

    total_pagar = Decimal(0)
    for conta in contas_pagar:
        debitos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "DEBITO"
        ).scalar() or Decimal(0)

        creditos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "CREDITO"
        ).scalar() or Decimal(0)

        total_pagar += (creditos - debitos)

    # Salários a Pagar
    contas_salarios = db.query(PlanoContas).filter(
        PlanoContas.codigo.like("2.1.2%"),
        PlanoContas.aceita_lancamento == True
    ).all()

    salarios_pagar = Decimal(0)
    for conta in contas_salarios:
        debitos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "DEBITO"
        ).scalar() or Decimal(0)

        creditos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "CREDITO"
        ).scalar() or Decimal(0)

        salarios_pagar += (creditos - debitos)

    # Impostos a Pagar
    contas_impostos = db.query(PlanoContas).filter(
        PlanoContas.codigo.like("2.1.3%"),
        PlanoContas.aceita_lancamento == True
    ).all()

    impostos_pagar = Decimal(0)
    for conta in contas_impostos:
        debitos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "DEBITO"
        ).scalar() or Decimal(0)

        creditos = db.query(func.sum(Partida.valor)).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "CREDITO"
        ).scalar() or Decimal(0)

        impostos_pagar += (creditos - debitos)

    # ========== RECEITAS E DESPESAS DO MÊS ==========

    # Receitas do mês
    contas_receita = db.query(PlanoContas).filter(
        PlanoContas.tipo == "RECEITA",
        PlanoContas.aceita_lancamento == True
    ).all()

    receitas_mes = Decimal(0)
    for conta in contas_receita:
        total = db.query(func.sum(Partida.valor)).join(
            Lancamento, Partida.lancamento_id == Lancamento.id
        ).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "CREDITO",
            Lancamento.data_lancamento >= inicio_mes,
            Lancamento.data_lancamento <= hoje
        ).scalar() or Decimal(0)

        receitas_mes += total

    # Despesas do mês
    contas_despesa = db.query(PlanoContas).filter(
        PlanoContas.tipo == "DESPESA",
        PlanoContas.aceita_lancamento == True
    ).all()

    despesas_mes = Decimal(0)
    for conta in contas_despesa:
        total = db.query(func.sum(Partida.valor)).join(
            Lancamento, Partida.lancamento_id == Lancamento.id
        ).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "DEBITO",
            Lancamento.data_lancamento >= inicio_mes,
            Lancamento.data_lancamento <= hoje
        ).scalar() or Decimal(0)

        despesas_mes += total

    resultado_mes = receitas_mes - despesas_mes

    # ========== GRÁFICO: RECEITAS POR TIPO ==========
    receitas_por_tipo = []
    for conta in contas_receita:
        total = db.query(func.sum(Partida.valor)).join(
            Lancamento, Partida.lancamento_id == Lancamento.id
        ).filter(
            Partida.conta_id == conta.id,
            Partida.tipo == "CREDITO",
            Lancamento.data_lancamento >= inicio_mes
        ).scalar() or Decimal(0)

        if total > 0:
            receitas_por_tipo.append({
                "nome": conta.descricao,
                "valor": float(total)
            })

    # ========== GRÁFICO: DESPESAS POR CATEGORIA ==========
    # Agrupar por categoria (nível 3)
    categorias_despesa = db.query(PlanoContas).filter(
        PlanoContas.tipo == "DESPESA",
        PlanoContas.nivel == 3
    ).all()

    despesas_por_categoria = []
    for categoria in categorias_despesa:
        # Buscar todas as contas filhas desta categoria
        contas_filhas = db.query(PlanoContas).filter(
            PlanoContas.codigo.like(f"{categoria.codigo}%"),
            PlanoContas.aceita_lancamento == True
        ).all()

        total_categoria = Decimal(0)
        for conta in contas_filhas:
            total = db.query(func.sum(Partida.valor)).join(
                Lancamento, Partida.lancamento_id == Lancamento.id
            ).filter(
                Partida.conta_id == conta.id,
                Partida.tipo == "DEBITO",
                Lancamento.data_lancamento >= inicio_mes
            ).scalar() or Decimal(0)
            total_categoria += total

        if total_categoria > 0:
            despesas_por_categoria.append({
                "nome": categoria.descricao,
                "valor": float(total_categoria)
            })

    # ========== EVOLUÇÃO MENSAL (últimos 6 meses) ==========
    evolucao_mensal = []
    for i in range(5, -1, -1):
        mes_ref = hoje - timedelta(days=i*30)
        inicio = mes_ref.replace(day=1)

        if i > 0:
            fim = (mes_ref + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            fim = hoje

        # Receitas do mês
        rec = Decimal(0)
        for conta in contas_receita:
            total = db.query(func.sum(Partida.valor)).join(
                Lancamento, Partida.lancamento_id == Lancamento.id
            ).filter(
                Partida.conta_id == conta.id,
                Partida.tipo == "CREDITO",
                Lancamento.data_lancamento >= inicio,
                Lancamento.data_lancamento <= fim
            ).scalar() or Decimal(0)
            rec += total

        # Despesas do mês
        desp = Decimal(0)
        for conta in contas_despesa:
            total = db.query(func.sum(Partida.valor)).join(
                Lancamento, Partida.lancamento_id == Lancamento.id
            ).filter(
                Partida.conta_id == conta.id,
                Partida.tipo == "DEBITO",
                Lancamento.data_lancamento >= inicio,
                Lancamento.data_lancamento <= fim
            ).scalar() or Decimal(0)
            desp += total

        mes_nome = inicio.strftime("%b/%Y")
        evolucao_mensal.append({
            "mes": mes_nome,
            "receitas": float(rec),
            "despesas": float(desp),
            "resultado": float(rec - desp)
        })

    # ========== ÚLTIMOS LANÇAMENTOS ==========
    ultimos_lancamentos = db.query(Lancamento).order_by(
        Lancamento.data_lancamento.desc(),
        Lancamento.id.desc()
    ).limit(10).all()

    lancamentos_resumo = []
    for lanc in ultimos_lancamentos:
        total = sum(p.valor for p in lanc.partidas if p.tipo == "DEBITO")
        lancamentos_resumo.append({
            "id": lanc.id,
            "data": lanc.data_lancamento.isoformat(),
            "historico_id": lanc.historico_id,
            "complemento": lanc.complemento,
            "valor": float(total)
        })

    return {
        "totais": {
            "clientes": total_clientes,
            "equipamentos": total_equipamentos,
            "motoristas": total_motoristas,
            "lancamentos": total_lancamentos
        },
        "financeiro": {
            "saldo_disponivel": float(saldo_disponivel),
            "total_receber": float(total_receber),
            "total_pagar": float(total_pagar),
            "salarios_pagar": float(salarios_pagar),
            "impostos_pagar": float(impostos_pagar),
            "receitas_mes": float(receitas_mes),
            "despesas_mes": float(despesas_mes),
            "resultado_mes": float(resultado_mes)
        },
        "graficos": {
            "receitas_por_tipo": receitas_por_tipo,
            "despesas_por_categoria": despesas_por_categoria,
            "evolucao_mensal": evolucao_mensal
        },
        "ultimos_lancamentos": lancamentos_resumo
    }
