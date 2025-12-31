"""
Script para recriar o Plano de Contas adequado para locadora de equipamentos
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.plano_contas import PlanoContas
from app.models.lancamento import Lancamento
from app.models.partida import Partida


def limpar_lancamentos(db):
    """Remove todos os lançamentos existentes"""
    total_partidas = db.query(Partida).count()
    total_lancamentos = db.query(Lancamento).count()

    print(f">> Removendo {total_partidas} partidas e {total_lancamentos} lancamentos...")
    db.query(Partida).delete()
    db.query(Lancamento).delete()
    db.commit()
    print("OK - Lancamentos removidos")


def limpar_plano_contas(db):
    """Remove todas as contas existentes"""
    total = db.query(PlanoContas).count()
    print(f">> Removendo {total} contas existentes...")
    db.query(PlanoContas).delete()
    db.commit()
    print("OK - Contas removidas")


def criar_plano_contas_locadora(db):
    """Cria Plano de Contas para locadora de equipamentos"""
    print("\n>> Criando novo Plano de Contas...")

    contas = [
        # ========== 1. ATIVO ==========
        {
            "codigo": "1",
            "descricao": "ATIVO",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 1,
            "conta_pai_id": None,
            "aceita_lancamento": False,
        },
        # 1.1 ATIVO CIRCULANTE
        {
            "codigo": "1.1",
            "descricao": "ATIVO CIRCULANTE",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 2,
            "conta_pai_codigo": "1",
            "aceita_lancamento": False,
        },
        # 1.1.1 DISPONIBILIDADES
        {
            "codigo": "1.1.1",
            "descricao": "Disponibilidades",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "1.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "1.1.1.01",
            "descricao": "Caixa",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.1.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "1.1.1.02",
            "descricao": "Banco Conta Corrente",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.1.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "1.1.1.03",
            "descricao": "Banco Conta Poupança",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.1.1",
            "aceita_lancamento": True,
        },
        # 1.1.2 CLIENTES
        {
            "codigo": "1.1.2",
            "descricao": "Clientes",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "1.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "1.1.2.01",
            "descricao": "Clientes a Receber",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.1.2",
            "aceita_lancamento": True,
        },
        {
            "codigo": "1.1.2.02",
            "descricao": "Duplicatas a Receber",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.1.2",
            "aceita_lancamento": True,
        },
        # 1.2 ATIVO NÃO CIRCULANTE
        {
            "codigo": "1.2",
            "descricao": "ATIVO NÃO CIRCULANTE",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 2,
            "conta_pai_codigo": "1",
            "aceita_lancamento": False,
        },
        # 1.2.1 IMOBILIZADO
        {
            "codigo": "1.2.1",
            "descricao": "Imobilizado",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "1.2",
            "aceita_lancamento": False,
        },
        {
            "codigo": "1.2.1.01",
            "descricao": "Equipamentos de Locação",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.2.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "1.2.1.02",
            "descricao": "Veículos",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.2.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "1.2.1.03",
            "descricao": "Móveis e Utensílios",
            "tipo": "ATIVO",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.2.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "1.2.1.04",
            "descricao": "(-) Depreciação Acumulada",
            "tipo": "ATIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "1.2.1",
            "aceita_lancamento": True,
        },

        # ========== 2. PASSIVO ==========
        {
            "codigo": "2",
            "descricao": "PASSIVO",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 1,
            "conta_pai_id": None,
            "aceita_lancamento": False,
        },
        # 2.1 PASSIVO CIRCULANTE
        {
            "codigo": "2.1",
            "descricao": "PASSIVO CIRCULANTE",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 2,
            "conta_pai_codigo": "2",
            "aceita_lancamento": False,
        },
        # 2.1.1 FORNECEDORES
        {
            "codigo": "2.1.1",
            "descricao": "Fornecedores",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 3,
            "conta_pai_codigo": "2.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "2.1.1.01",
            "descricao": "Fornecedores a Pagar",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "2.1.1",
            "aceita_lancamento": True,
        },
        # 2.1.2 OBRIGAÇÕES TRABALHISTAS
        {
            "codigo": "2.1.2",
            "descricao": "Obrigações Trabalhistas",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 3,
            "conta_pai_codigo": "2.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "2.1.2.01",
            "descricao": "Salários a Pagar",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "2.1.2",
            "aceita_lancamento": True,
        },
        {
            "codigo": "2.1.2.02",
            "descricao": "FGTS a Recolher",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "2.1.2",
            "aceita_lancamento": True,
        },
        {
            "codigo": "2.1.2.03",
            "descricao": "INSS a Recolher",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "2.1.2",
            "aceita_lancamento": True,
        },
        # 2.1.3 OBRIGAÇÕES FISCAIS
        {
            "codigo": "2.1.3",
            "descricao": "Obrigações Fiscais",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 3,
            "conta_pai_codigo": "2.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "2.1.3.01",
            "descricao": "Impostos a Recolher",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "2.1.3",
            "aceita_lancamento": True,
        },
        {
            "codigo": "2.1.3.02",
            "descricao": "ISS a Recolher",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "2.1.3",
            "aceita_lancamento": True,
        },
        # 2.2 PASSIVO NÃO CIRCULANTE
        {
            "codigo": "2.2",
            "descricao": "PASSIVO NÃO CIRCULANTE",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 2,
            "conta_pai_codigo": "2",
            "aceita_lancamento": False,
        },
        {
            "codigo": "2.2.1",
            "descricao": "Financiamentos",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 3,
            "conta_pai_codigo": "2.2",
            "aceita_lancamento": False,
        },
        {
            "codigo": "2.2.1.01",
            "descricao": "Financiamento de Equipamentos",
            "tipo": "PASSIVO",
            "natureza": "CREDORA",
            "nivel": 4,
            "conta_pai_codigo": "2.2.1",
            "aceita_lancamento": True,
        },

        # ========== 3. PATRIMÔNIO LÍQUIDO ==========
        {
            "codigo": "3",
            "descricao": "PATRIMÔNIO LÍQUIDO",
            "tipo": "PATRIMONIO_LIQUIDO",
            "natureza": "CREDORA",
            "nivel": 1,
            "conta_pai_id": None,
            "aceita_lancamento": False,
        },
        {
            "codigo": "3.1",
            "descricao": "Capital Social",
            "tipo": "PATRIMONIO_LIQUIDO",
            "natureza": "CREDORA",
            "nivel": 2,
            "conta_pai_codigo": "3",
            "aceita_lancamento": True,
        },
        {
            "codigo": "3.2",
            "descricao": "Lucros Acumulados",
            "tipo": "PATRIMONIO_LIQUIDO",
            "natureza": "CREDORA",
            "nivel": 2,
            "conta_pai_codigo": "3",
            "aceita_lancamento": True,
        },

        # ========== 4. RECEITAS ==========
        {
            "codigo": "4",
            "descricao": "RECEITAS",
            "tipo": "RECEITA",
            "natureza": "CREDORA",
            "nivel": 1,
            "conta_pai_id": None,
            "aceita_lancamento": False,
        },
        {
            "codigo": "4.1",
            "descricao": "Receitas Operacionais",
            "tipo": "RECEITA",
            "natureza": "CREDORA",
            "nivel": 2,
            "conta_pai_codigo": "4",
            "aceita_lancamento": False,
        },
        {
            "codigo": "4.1.1",
            "descricao": "Receitas de Locação",
            "tipo": "RECEITA",
            "natureza": "CREDORA",
            "nivel": 3,
            "conta_pai_codigo": "4.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "4.1.2",
            "descricao": "Receitas de Serviços",
            "tipo": "RECEITA",
            "natureza": "CREDORA",
            "nivel": 3,
            "conta_pai_codigo": "4.1",
            "aceita_lancamento": True,
        },

        # ========== 5. DESPESAS ==========
        {
            "codigo": "5",
            "descricao": "DESPESAS",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 1,
            "conta_pai_id": None,
            "aceita_lancamento": False,
        },
        # 5.1 DESPESAS OPERACIONAIS
        {
            "codigo": "5.1",
            "descricao": "Despesas Operacionais",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 2,
            "conta_pai_codigo": "5",
            "aceita_lancamento": False,
        },
        # 5.1.1 PESSOAL
        {
            "codigo": "5.1.1",
            "descricao": "Despesas com Pessoal",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "5.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "5.1.1.01",
            "descricao": "Salários",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.1.02",
            "descricao": "Encargos Sociais",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.1",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.1.03",
            "descricao": "Férias e 13º",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.1",
            "aceita_lancamento": True,
        },
        # 5.1.2 EQUIPAMENTOS
        {
            "codigo": "5.1.2",
            "descricao": "Despesas com Equipamentos",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "5.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "5.1.2.01",
            "descricao": "Combustível",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.2",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.2.02",
            "descricao": "Manutenção de Equipamentos",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.2",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.2.03",
            "descricao": "Peças e Acessórios",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.2",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.2.04",
            "descricao": "Depreciação",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.2",
            "aceita_lancamento": True,
        },
        # 5.1.3 ADMINISTRATIVAS
        {
            "codigo": "5.1.3",
            "descricao": "Despesas Administrativas",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "5.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "5.1.3.01",
            "descricao": "Aluguel",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.3",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.3.02",
            "descricao": "Energia Elétrica",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.3",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.3.03",
            "descricao": "Telefone e Internet",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.3",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.3.04",
            "descricao": "Material de Escritório",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.3",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.3.05",
            "descricao": "Contador",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.3",
            "aceita_lancamento": True,
        },
        # 5.1.4 TRIBUTÁRIAS
        {
            "codigo": "5.1.4",
            "descricao": "Despesas Tributárias",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "5.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "5.1.4.01",
            "descricao": "Impostos sobre Faturamento",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.4",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.4.02",
            "descricao": "IPVA",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.4",
            "aceita_lancamento": True,
        },
        # 5.1.5 FINANCEIRAS
        {
            "codigo": "5.1.5",
            "descricao": "Despesas Financeiras",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 3,
            "conta_pai_codigo": "5.1",
            "aceita_lancamento": False,
        },
        {
            "codigo": "5.1.5.01",
            "descricao": "Juros sobre Empréstimos",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.5",
            "aceita_lancamento": True,
        },
        {
            "codigo": "5.1.5.02",
            "descricao": "Tarifas Bancárias",
            "tipo": "DESPESA",
            "natureza": "DEVEDORA",
            "nivel": 4,
            "conta_pai_codigo": "5.1.5",
            "aceita_lancamento": True,
        },
    ]

    # Mapear códigos para IDs (para resolver conta_pai_codigo)
    codigo_to_id = {}

    # Primeira passagem: criar todas as contas sem conta_pai
    for conta_data in contas:
        if "conta_pai_codigo" not in conta_data:
            conta = PlanoContas(
                codigo=conta_data["codigo"],
                descricao=conta_data["descricao"],
                tipo=conta_data["tipo"],
                natureza=conta_data["natureza"],
                nivel=conta_data["nivel"],
                conta_pai_id=conta_data.get("conta_pai_id"),
                aceita_lancamento=conta_data["aceita_lancamento"],
                ativo=True
            )
            db.add(conta)
            db.flush()
            codigo_to_id[conta.codigo] = conta.id

    # Segunda passagem: criar contas com conta_pai
    for conta_data in contas:
        if "conta_pai_codigo" in conta_data:
            pai_codigo = conta_data["conta_pai_codigo"]
            conta = PlanoContas(
                codigo=conta_data["codigo"],
                descricao=conta_data["descricao"],
                tipo=conta_data["tipo"],
                natureza=conta_data["natureza"],
                nivel=conta_data["nivel"],
                conta_pai_id=codigo_to_id.get(pai_codigo),
                aceita_lancamento=conta_data["aceita_lancamento"],
                ativo=True
            )
            db.add(conta)
            db.flush()
            codigo_to_id[conta.codigo] = conta.id

    db.commit()

    total_criadas = len(contas)
    total_aceitam = sum(1 for c in contas if c["aceita_lancamento"])

    print(f"OK - {total_criadas} contas criadas")
    print(f"   - {total_aceitam} contas aceitam lancamento")
    return total_criadas


def main():
    print("=" * 80)
    print("RECRIAR PLANO DE CONTAS - LOCADORA DE EQUIPAMENTOS")
    print("=" * 80)

    db = SessionLocal()

    try:
        # Confirmar
        resposta = input("\n!! ATENCAO: Isso vai DELETAR lancamentos e contas existentes. Continuar? (s/n): ")
        if resposta.lower() != 's':
            print("Operacao cancelada.")
            return

        # Limpar lançamentos primeiro (por causa das foreign keys)
        limpar_lancamentos(db)

        # Limpar plano antigo
        limpar_plano_contas(db)

        # Criar novo plano
        criar_plano_contas_locadora(db)

        print("\n" + "=" * 80)
        print("SUCESSO! Plano de Contas recriado.")
        print("=" * 80)

    except Exception as e:
        print(f"\nERRO: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
