"""
Script para gerar dados fictícios para o sistema
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.lancamento import Lancamento
from app.models.partida import Partida
from app.models.plano_contas import PlanoContas
from app.models.historico import Historico
from app.models.centro_custo import CentroCusto
from app.models.cliente import Cliente
from app.models.equipamento import Equipamento

def gerar_historicos_padrao(db):
    """Cria históricos padrão se não existirem"""
    total_historicos = db.query(Historico).count()

    if total_historicos > 0:
        print(f">> Ja existem {total_historicos} historicos no banco")
        return total_historicos

    print(">> Criando historicos padrao...")

    historicos_padrao = [
        ("001", "Pagamento de fornecedores"),
        ("002", "Recebimento de clientes"),
        ("003", "Pagamento de salários"),
        ("004", "Pagamento de impostos"),
        ("005", "Despesas gerais"),
        ("006", "Receitas de locação"),
        ("007", "Manutenção de equipamentos"),
        ("008", "Combustível"),
        ("009", "Depreciação de equipamentos"),
        ("010", "Compra de materiais"),
        ("011", "Receitas de serviços"),
        ("012", "Despesas bancárias"),
        ("013", "Aluguel"),
        ("014", "Energia elétrica"),
        ("015", "Telefone e internet"),
        ("016", "Seguros"),
        ("017", "Impostos sobre faturamento"),
        ("018", "Comissões"),
        ("019", "Férias e 13º salário"),
        ("020", "FGTS e encargos"),
    ]

    for codigo, descricao in historicos_padrao:
        historico = Historico(
            codigo=codigo,
            descricao=descricao,
            ativo=True
        )
        db.add(historico)

    db.commit()
    print(f"OK - {len(historicos_padrao)} historicos criados")
    return len(historicos_padrao)


def gerar_lancamentos_ficticios(db, quantidade=30):
    """Gera lançamentos contábeis fictícios"""
    print(f"\n>> Gerando {quantidade} lancamentos ficticios...")

    # Buscar dados necessários
    historicos = db.query(Historico).filter(Historico.ativo == True).all()
    centros_custo = db.query(CentroCusto).filter(CentroCusto.ativo == True).all()

    # Buscar contas que aceitam lançamento
    contas_debito = db.query(PlanoContas).filter(
        PlanoContas.aceita_lancamento == True,
        PlanoContas.natureza == "DEVEDORA",
        PlanoContas.ativo == True
    ).all()

    contas_credito = db.query(PlanoContas).filter(
        PlanoContas.aceita_lancamento == True,
        PlanoContas.natureza == "CREDORA",
        PlanoContas.ativo == True
    ).all()

    if not historicos or not contas_debito or not contas_credito:
        print("ERRO: Faltam dados basicos (historicos ou contas)")
        return 0

    # Tipos de lançamentos comuns
    tipos_lancamentos = [
        {
            "descricao": "Pagamento de fornecedor",
            "observacoes": ["Pgto NF {}", "Quitação fatura {}", "Pagto serviços prestados"],
            "valores": (500, 5000)
        },
        {
            "descricao": "Recebimento de cliente",
            "observacoes": ["Recebto NF {}", "Quitação fatura {}", "Recebimento de locação"],
            "valores": (1000, 8000)
        },
        {
            "descricao": "Pagamento de salários",
            "observacoes": ["Folha de pagamento {}/2024", "Salário motorista", "Pagto funcionários"],
            "valores": (3000, 15000)
        },
        {
            "descricao": "Despesas diversas",
            "observacoes": ["Combustível", "Manutenção equipamento", "Material de escritório", "Energia elétrica"],
            "valores": (200, 2000)
        },
        {
            "descricao": "Receita de locação",
            "observacoes": ["Locação equipamento", "Aluguel retroescavadeira", "Locação caminhão"],
            "valores": (2000, 10000)
        },
    ]

    lancamentos_criados = 0
    data_inicio = datetime.now() - timedelta(days=90)  # Últimos 3 meses

    for i in range(quantidade):
        # Data aleatória nos últimos 3 meses
        dias_aleatorio = random.randint(0, 90)
        data_lancamento = data_inicio + timedelta(days=dias_aleatorio)

        # Escolher tipo de lançamento
        tipo = random.choice(tipos_lancamentos)
        historico = random.choice(historicos)

        # Gerar observação
        obs_template = random.choice(tipo["observacoes"])
        if "{}" in obs_template:
            obs = obs_template.format(random.randint(1000, 9999))
        else:
            obs = obs_template

        # Criar lançamento
        lancamento = Lancamento(
            data_lancamento=data_lancamento,
            historico_id=historico.id,
            complemento=obs
        )
        db.add(lancamento)
        db.flush()  # Para obter o ID

        # Gerar valor aleatório
        valor_min, valor_max = tipo["valores"]
        valor = Decimal(random.uniform(valor_min, valor_max)).quantize(Decimal('0.01'))

        # Decidir se é lançamento simples ou composto
        if random.random() < 0.8:  # 80% lançamentos simples (1 débito, 1 crédito)
            # Débito
            conta_deb = random.choice(contas_debito)
            partida_deb = Partida(
                lancamento_id=lancamento.id,
                conta_id=conta_deb.id,
                tipo="DEBITO",
                valor=valor,
                centro_custo_id=random.choice(centros_custo).id if centros_custo and random.random() < 0.5 else None
            )
            db.add(partida_deb)

            # Crédito
            conta_cred = random.choice(contas_credito)
            partida_cred = Partida(
                lancamento_id=lancamento.id,
                conta_id=conta_cred.id,
                tipo="CREDITO",
                valor=valor,
                centro_custo_id=random.choice(centros_custo).id if centros_custo and random.random() < 0.5 else None
            )
            db.add(partida_cred)
        else:  # 20% lançamentos compostos
            num_partidas = random.randint(2, 4)

            # Gerar débitos
            total_debito = Decimal(0)
            for _ in range(num_partidas):
                valor_partida = (valor / num_partidas).quantize(Decimal('0.01'))
                conta_deb = random.choice(contas_debito)
                partida_deb = Partida(
                    lancamento_id=lancamento.id,
                    conta_id=conta_deb.id,
                    tipo="DEBITO",
                    valor=valor_partida,
                    centro_custo_id=random.choice(centros_custo).id if centros_custo and random.random() < 0.5 else None
                )
                db.add(partida_deb)
                total_debito += valor_partida

            # Crédito para balancear
            conta_cred = random.choice(contas_credito)
            partida_cred = Partida(
                lancamento_id=lancamento.id,
                conta_id=conta_cred.id,
                tipo="CREDITO",
                valor=total_debito,
                centro_custo_id=random.choice(centros_custo).id if centros_custo and random.random() < 0.5 else None
            )
            db.add(partida_cred)

        lancamentos_criados += 1

        if (i + 1) % 10 == 0:
            print(f"  Criados {i + 1}/{quantidade} lançamentos...")

    return lancamentos_criados


def main():
    print("=" * 80)
    print("GERACAO DE DADOS FICTICIOS")
    print("=" * 80)

    db = SessionLocal()

    try:
        # Primeiro, garantir que existem históricos
        gerar_historicos_padrao(db)

        # Verificar quantos lançamentos já existem
        total_lancamentos = db.query(Lancamento).count()
        print(f"\n>> Lancamentos existentes: {total_lancamentos}")

        if total_lancamentos > 0:
            resposta = input("\n!! Ja existem lancamentos no banco. Deseja adicionar mais? (s/n): ")
            if resposta.lower() != 's':
                print("Operacao cancelada.")
                return

        # Gerar lançamentos
        quantidade = 30
        criados = gerar_lancamentos_ficticios(db, quantidade)

        if criados > 0:
            db.commit()
            print(f"\nOK - {criados} lancamentos criados com sucesso!")
            print(f">> Total de lancamentos no banco: {db.query(Lancamento).count()}")
        else:
            print("\nERRO: Nenhum lancamento foi criado.")
            db.rollback()

    except Exception as e:
        print(f"\nERRO: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
