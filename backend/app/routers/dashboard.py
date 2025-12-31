# Dashboard endpoint - OPTIMIZED VERSION
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case, extract
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


def calcular_saldo_contas(db: Session, pattern: str):
    """
    Calcula saldo de contas com um padrão específico usando uma única query
    """
    resultado = db.query(
        func.sum(
            case(
                (Partida.tipo == "DEBITO", Partida.valor),
                else_=0
            )
        ).label("debitos"),
        func.sum(
            case(
                (Partida.tipo == "CREDITO", Partida.valor),
                else_=0
            )
        ).label("creditos")
    ).join(
        PlanoContas, Partida.conta_id == PlanoContas.id
    ).filter(
        PlanoContas.codigo.like(pattern),
        PlanoContas.aceita_lancamento == True
    ).first()

    debitos = resultado.debitos or Decimal(0)
    creditos = resultado.creditos or Decimal(0)
    return debitos, creditos


def calcular_receitas_despesas_periodo(db: Session, tipo: str, inicio, fim):
    """
    Calcula receitas ou despesas de um período usando uma única query
    """
    tipo_partida = "CREDITO" if tipo == "RECEITA" else "DEBITO"

    total = db.query(
        func.sum(Partida.valor)
    ).join(
        PlanoContas, Partida.conta_id == PlanoContas.id
    ).join(
        Lancamento, Partida.lancamento_id == Lancamento.id
    ).filter(
        PlanoContas.tipo == tipo,
        PlanoContas.aceita_lancamento == True,
        Partida.tipo == tipo_partida,
        Lancamento.data_lancamento >= inicio,
        Lancamento.data_lancamento <= fim
    ).scalar() or Decimal(0)

    return total


@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Retorna dados consolidados para o dashboard - VERSÃO OTIMIZADA
    """
    hoje = datetime.now().date()
    inicio_mes = hoje.replace(day=1)

    # ========== TOTAIS (4 queries) ==========
    total_clientes = db.query(func.count(Cliente.id)).filter(Cliente.ativo == True).scalar()
    total_equipamentos = db.query(func.count(Equipamento.id)).filter(Equipamento.ativo == True).scalar()
    total_motoristas = db.query(func.count(Motorista.id)).filter(Motorista.ativo == True).scalar()
    total_lancamentos = db.query(func.count(Lancamento.id)).scalar()

    # ========== SALDOS DAS CONTAS (5 queries otimizadas) ==========

    # Caixa e Bancos (1 query)
    deb_disp, cred_disp = calcular_saldo_contas(db, "1.1.1%")
    saldo_disponivel = deb_disp - cred_disp

    # Clientes a Receber (1 query)
    deb_rec, cred_rec = calcular_saldo_contas(db, "1.1.2%")
    total_receber = deb_rec - cred_rec

    # Fornecedores a Pagar (1 query)
    deb_pag, cred_pag = calcular_saldo_contas(db, "2.1.1%")
    total_pagar = cred_pag - deb_pag

    # Salários a Pagar (1 query)
    deb_sal, cred_sal = calcular_saldo_contas(db, "2.1.2%")
    salarios_pagar = cred_sal - deb_sal

    # Impostos a Pagar (1 query)
    deb_imp, cred_imp = calcular_saldo_contas(db, "2.1.3%")
    impostos_pagar = cred_imp - deb_imp

    # ========== RECEITAS E DESPESAS DO MÊS (2 queries) ==========
    receitas_mes = calcular_receitas_despesas_periodo(db, "RECEITA", inicio_mes, hoje)
    despesas_mes = calcular_receitas_despesas_periodo(db, "DESPESA", inicio_mes, hoje)
    resultado_mes = receitas_mes - despesas_mes

    # ========== GRÁFICO: RECEITAS POR TIPO (1 query) ==========
    receitas_por_tipo_query = db.query(
        PlanoContas.descricao,
        func.sum(Partida.valor).label("total")
    ).join(
        Partida, PlanoContas.id == Partida.conta_id
    ).join(
        Lancamento, Partida.lancamento_id == Lancamento.id
    ).filter(
        PlanoContas.tipo == "RECEITA",
        PlanoContas.aceita_lancamento == True,
        Partida.tipo == "CREDITO",
        Lancamento.data_lancamento >= inicio_mes
    ).group_by(
        PlanoContas.id, PlanoContas.descricao
    ).all()

    receitas_por_tipo = [
        {"nome": desc, "valor": float(total)}
        for desc, total in receitas_por_tipo_query
        if total > 0
    ]

    # ========== GRÁFICO: DESPESAS POR CATEGORIA (1 query) ==========
    # Pegar categorias de nível 3 e agrupar
    despesas_por_categoria_query = db.query(
        func.substring(PlanoContas.codigo, 1, 5).label("categoria_codigo"),
        func.sum(Partida.valor).label("total")
    ).join(
        Partida, PlanoContas.id == Partida.conta_id
    ).join(
        Lancamento, Partida.lancamento_id == Lancamento.id
    ).filter(
        PlanoContas.tipo == "DESPESA",
        PlanoContas.aceita_lancamento == True,
        Partida.tipo == "DEBITO",
        Lancamento.data_lancamento >= inicio_mes
    ).group_by(
        func.substring(PlanoContas.codigo, 1, 5)
    ).all()

    # Buscar nomes das categorias (1 query adicional)
    categorias_map = {}
    if despesas_por_categoria_query:
        codigos = [cat_cod for cat_cod, _ in despesas_por_categoria_query]
        categorias = db.query(PlanoContas).filter(
            PlanoContas.codigo.in_(codigos),
            PlanoContas.tipo == "DESPESA"
        ).all()
        categorias_map = {c.codigo: c.descricao for c in categorias}

    despesas_por_categoria = [
        {"nome": categorias_map.get(cat_cod, cat_cod), "valor": float(total)}
        for cat_cod, total in despesas_por_categoria_query
        if total > 0
    ]

    # ========== EVOLUÇÃO MENSAL (2 queries por mês = 12 queries) ==========
    evolucao_mensal = []
    for i in range(5, -1, -1):
        mes_ref = hoje - timedelta(days=i*30)
        inicio = mes_ref.replace(day=1)

        if i > 0:
            fim = (mes_ref + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            fim = hoje

        # Receitas do mês (1 query)
        rec = calcular_receitas_despesas_periodo(db, "RECEITA", inicio, fim)

        # Despesas do mês (1 query)
        desp = calcular_receitas_despesas_periodo(db, "DESPESA", inicio, fim)

        mes_nome = inicio.strftime("%b/%Y")
        evolucao_mensal.append({
            "mes": mes_nome,
            "receitas": float(rec),
            "despesas": float(desp),
            "resultado": float(rec - desp)
        })

    # ========== ÚLTIMOS LANÇAMENTOS (1 query com eager loading) ==========
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
