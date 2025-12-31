"""
Script para popular o banco de dados com dados fictícios de contas a pagar e receber
"""
from datetime import date, timedelta
from decimal import Decimal
from app.database import SessionLocal
from app.models.conta_pagar import ContaPagar, StatusContaPagar
from app.models.conta_receber import ContaReceber, StatusContaReceber

def seed_contas():
    db = SessionLocal()

    try:
        hoje = date.today()

        # Limpar dados existentes (opcional)
        print("Limpando dados existentes...")
        db.query(ContaPagar).delete()
        db.query(ContaReceber).delete()
        db.commit()

        print("Criando contas a pagar...")

        # CONTAS A PAGAR
        contas_pagar = [
            # Contas vencidas
            ContaPagar(
                descricao="Aluguel do Galpão - Janeiro",
                valor=Decimal("5500.00"),
                data_vencimento=hoje - timedelta(days=15),
                status=StatusContaPagar.VENCIDO,
                categoria="Aluguel",
                fornecedor_nome="Imobiliária Costa Ltda",
                observacoes="Aluguel mensal do galpão"
            ),
            ContaPagar(
                descricao="Conta de Energia - Janeiro",
                valor=Decimal("1250.00"),
                data_vencimento=hoje - timedelta(days=8),
                status=StatusContaPagar.VENCIDO,
                categoria="Utilidades",
                fornecedor_nome="Companhia de Energia",
                observacoes="Conta de luz do galpão"
            ),
            ContaPagar(
                descricao="Manutenção Caminhão Placa ABC-1234",
                valor=Decimal("3800.00"),
                data_vencimento=hoje - timedelta(days=5),
                status=StatusContaPagar.VENCIDO,
                categoria="Manutenção",
                fornecedor_nome="Auto Mecânica Silva",
                observacoes="Troca de pneus e revisão"
            ),

            # Contas a vencer hoje
            ContaPagar(
                descricao="Combustível - Fevereiro",
                valor=Decimal("8500.00"),
                data_vencimento=hoje,
                status=StatusContaPagar.A_VENCER,
                categoria="Combustível",
                fornecedor_nome="Posto Rodoviário BR",
                observacoes="Abastecimento da frota"
            ),
            ContaPagar(
                descricao="Seguro DPVAT - Caminhão 001",
                valor=Decimal("650.00"),
                data_vencimento=hoje,
                status=StatusContaPagar.A_VENCER,
                categoria="Seguro",
                fornecedor_nome="Seguradora Nacional",
            ),

            # Contas a vencer esta semana
            ContaPagar(
                descricao="Salário Motorista - João Silva",
                valor=Decimal("4200.00"),
                data_vencimento=hoje + timedelta(days=3),
                status=StatusContaPagar.A_VENCER,
                categoria="Salários",
                observacoes="Pagamento mensal"
            ),
            ContaPagar(
                descricao="Salário Motorista - Maria Santos",
                valor=Decimal("4500.00"),
                data_vencimento=hoje + timedelta(days=3),
                status=StatusContaPagar.A_VENCER,
                categoria="Salários",
                observacoes="Pagamento mensal + horas extras"
            ),
            ContaPagar(
                descricao="IPVA - Caminhão Placa XYZ-9876",
                valor=Decimal("2800.00"),
                data_vencimento=hoje + timedelta(days=5),
                status=StatusContaPagar.A_VENCER,
                categoria="Impostos",
                fornecedor_nome="Secretaria da Fazenda",
            ),

            # Contas a vencer no mês
            ContaPagar(
                descricao="Telefonia e Internet",
                valor=Decimal("380.00"),
                data_vencimento=hoje + timedelta(days=10),
                status=StatusContaPagar.A_VENCER,
                categoria="Comunicação",
                fornecedor_nome="Telecom Brasil",
            ),
            ContaPagar(
                descricao="Licenciamento Anual - Frota",
                valor=Decimal("1500.00"),
                data_vencimento=hoje + timedelta(days=15),
                status=StatusContaPagar.A_VENCER,
                categoria="Licenciamento",
                fornecedor_nome="DETRAN",
            ),
            ContaPagar(
                descricao="Material de Escritório",
                valor=Decimal("450.00"),
                data_vencimento=hoje + timedelta(days=20),
                status=StatusContaPagar.A_VENCER,
                categoria="Escritório",
                fornecedor_nome="Papelaria Central",
            ),

            # Parcelamento - Financiamento do Caminhão (60 parcelas)
            ContaPagar(
                descricao="Financiamento Caminhão Mercedes Actros",
                valor=Decimal("12500.00"),
                data_vencimento=hoje + timedelta(days=8),
                status=StatusContaPagar.A_VENCER,
                categoria="Veículo",
                fornecedor_nome="Banco Financiador S.A.",
                parcela_numero=24,
                parcela_total=60,
                grupo_parcelamento="CAMINHAO-ACTROS-2024",
                observacoes="Parcela 24 de 60 - Financiamento caminhão novo"
            ),
            ContaPagar(
                descricao="Financiamento Caminhão Mercedes Actros",
                valor=Decimal("12500.00"),
                data_vencimento=hoje + timedelta(days=38),
                status=StatusContaPagar.A_VENCER,
                categoria="Veículo",
                fornecedor_nome="Banco Financiador S.A.",
                parcela_numero=25,
                parcela_total=60,
                grupo_parcelamento="CAMINHAO-ACTROS-2024",
                observacoes="Parcela 25 de 60 - Financiamento caminhão novo"
            ),

            # Contas pagas
            ContaPagar(
                descricao="Aluguel do Galpão - Dezembro",
                valor=Decimal("5500.00"),
                data_vencimento=hoje - timedelta(days=45),
                data_pagamento=hoje - timedelta(days=43),
                status=StatusContaPagar.PAGO,
                categoria="Aluguel",
                fornecedor_nome="Imobiliária Costa Ltda",
            ),
            ContaPagar(
                descricao="Combustível - Janeiro",
                valor=Decimal("7800.00"),
                data_vencimento=hoje - timedelta(days=30),
                data_pagamento=hoje - timedelta(days=30),
                status=StatusContaPagar.PAGO,
                categoria="Combustível",
                fornecedor_nome="Posto Rodoviário BR",
            ),

            # Conta recorrente
            ContaPagar(
                descricao="Sistema de Rastreamento - Mensalidade",
                valor=Decimal("890.00"),
                data_vencimento=hoje + timedelta(days=12),
                status=StatusContaPagar.A_VENCER,
                categoria="Tecnologia",
                fornecedor_nome="RastreaTech Soluções",
                recorrente=True,
                dia_vencimento_recorrente=15,
                observacoes="Cobrança mensal recorrente"
            ),
        ]

        db.add_all(contas_pagar)
        print(f"Adicionadas {len(contas_pagar)} contas a pagar")

        print("\nCriando contas a receber...")

        # CONTAS A RECEBER
        contas_receber = [
            # Contas atrasadas
            ContaReceber(
                descricao="Frete - São Paulo para Rio de Janeiro",
                valor=Decimal("8500.00"),
                data_vencimento=hoje - timedelta(days=12),
                status=StatusContaReceber.ATRASADO,
                categoria="Frete",
                cliente_nome="Transportadora Alpha Ltda",
                numero_documento="NF-001234",
                observacoes="Transporte de carga geral - 25 toneladas"
            ),
            ContaReceber(
                descricao="Frete - Campinas para Salvador",
                valor=Decimal("15800.00"),
                data_vencimento=hoje - timedelta(days=6),
                status=StatusContaReceber.ATRASADO,
                categoria="Frete",
                cliente_nome="Indústria Beta S.A.",
                numero_documento="NF-001245",
                observacoes="Transporte de equipamentos industriais"
            ),

            # Contas a receber hoje
            ContaReceber(
                descricao="Frete - Curitiba para Porto Alegre",
                valor=Decimal("6200.00"),
                data_vencimento=hoje,
                status=StatusContaReceber.A_RECEBER,
                categoria="Frete",
                cliente_nome="Comércio Gama ME",
                numero_documento="NF-001267",
                observacoes="Carga fracionada - 15 toneladas"
            ),
            ContaReceber(
                descricao="Locação de Caminhão - Diária",
                valor=Decimal("1800.00"),
                data_vencimento=hoje,
                status=StatusContaReceber.A_RECEBER,
                categoria="Locação",
                cliente_nome="Construtora Delta Ltda",
                numero_documento="NF-001270",
            ),

            # Contas a receber esta semana
            ContaReceber(
                descricao="Frete - Belo Horizonte para Brasília",
                valor=Decimal("9500.00"),
                data_vencimento=hoje + timedelta(days=4),
                status=StatusContaReceber.A_RECEBER,
                categoria="Frete",
                cliente_nome="Distribuidora Epsilon Ltda",
                numero_documento="NF-001278",
                observacoes="Mercadorias diversas - 20 toneladas"
            ),
            ContaReceber(
                descricao="Frete - Goiânia para Manaus",
                valor=Decimal("22500.00"),
                data_vencimento=hoje + timedelta(days=6),
                status=StatusContaReceber.A_RECEBER,
                categoria="Frete",
                cliente_nome="Indústria Zeta S.A.",
                numero_documento="NF-001280",
                observacoes="Carga perecível - transporte refrigerado"
            ),

            # Contas a receber no mês
            ContaReceber(
                descricao="Frete - Fortaleza para Recife",
                valor=Decimal("5800.00"),
                data_vencimento=hoje + timedelta(days=10),
                status=StatusContaReceber.A_RECEBER,
                categoria="Frete",
                cliente_nome="Comércio Eta ME",
                numero_documento="NF-001285",
            ),
            ContaReceber(
                descricao="Serviço de Movimentação - Porto de Santos",
                valor=Decimal("4200.00"),
                data_vencimento=hoje + timedelta(days=15),
                status=StatusContaReceber.A_RECEBER,
                categoria="Serviços",
                cliente_nome="Portos do Brasil S.A.",
                numero_documento="NF-001290",
                observacoes="Movimentação de containers"
            ),
            ContaReceber(
                descricao="Frete - Vitória para São Paulo",
                valor=Decimal("7300.00"),
                data_vencimento=hoje + timedelta(days=18),
                status=StatusContaReceber.A_RECEBER,
                categoria="Frete",
                cliente_nome="Transportadora Theta Ltda",
                numero_documento="NF-001295",
            ),
            ContaReceber(
                descricao="Locação de Retroescavadeira - Mensal",
                valor=Decimal("8500.00"),
                data_vencimento=hoje + timedelta(days=25),
                status=StatusContaReceber.A_RECEBER,
                categoria="Locação",
                cliente_nome="Construtora Mega Obras",
                numero_documento="NF-001300",
                observacoes="Aluguel mensal de equipamento"
            ),

            # Parcelamento - Venda de caminhão usado (12x)
            ContaReceber(
                descricao="Venda Caminhão Usado - Volvo FH 440",
                valor=Decimal("15000.00"),
                data_vencimento=hoje + timedelta(days=5),
                status=StatusContaReceber.A_RECEBER,
                categoria="Venda",
                cliente_nome="Transportes Kappa Ltda",
                numero_documento="NF-001305",
                parcela_numero=8,
                parcela_total=12,
                grupo_parcelamento="VENDA-VOLVO-FH440",
                observacoes="Parcela 8 de 12 - Venda de caminhão usado"
            ),
            ContaReceber(
                descricao="Venda Caminhão Usado - Volvo FH 440",
                valor=Decimal("15000.00"),
                data_vencimento=hoje + timedelta(days=35),
                status=StatusContaReceber.A_RECEBER,
                categoria="Venda",
                cliente_nome="Transportes Kappa Ltda",
                numero_documento="NF-001310",
                parcela_numero=9,
                parcela_total=12,
                grupo_parcelamento="VENDA-VOLVO-FH440",
                observacoes="Parcela 9 de 12 - Venda de caminhão usado"
            ),

            # Contas recebidas
            ContaReceber(
                descricao="Frete - Rio de Janeiro para São Paulo",
                valor=Decimal("7800.00"),
                data_vencimento=hoje - timedelta(days=20),
                data_recebimento=hoje - timedelta(days=18),
                status=StatusContaReceber.RECEBIDO,
                categoria="Frete",
                cliente_nome="Comércio Lambda ME",
                numero_documento="NF-001180",
            ),
            ContaReceber(
                descricao="Frete - Porto Alegre para Curitiba",
                valor=Decimal("5200.00"),
                data_vencimento=hoje - timedelta(days=15),
                data_recebimento=hoje - timedelta(days=15),
                status=StatusContaReceber.RECEBIDO,
                categoria="Frete",
                cliente_nome="Indústria Mi S.A.",
                numero_documento="NF-001190",
            ),
            ContaReceber(
                descricao="Frete - Brasília para Goiânia",
                valor=Decimal("3800.00"),
                data_vencimento=hoje - timedelta(days=10),
                data_recebimento=hoje - timedelta(days=8),
                status=StatusContaReceber.RECEBIDO,
                categoria="Frete",
                cliente_nome="Distribuidora Nu Ltda",
                numero_documento="NF-001200",
            ),
        ]

        db.add_all(contas_receber)
        print(f"Adicionadas {len(contas_receber)} contas a receber")

        db.commit()
        print("\n[OK] Dados ficticios criados com sucesso!")

        # Estatísticas
        print("\n=== RESUMO ===")
        print(f"\nContas a Pagar:")
        print(f"  - A Vencer: {db.query(ContaPagar).filter(ContaPagar.status == StatusContaPagar.A_VENCER).count()}")
        print(f"  - Vencidas: {db.query(ContaPagar).filter(ContaPagar.status == StatusContaPagar.VENCIDO).count()}")
        print(f"  - Pagas: {db.query(ContaPagar).filter(ContaPagar.status == StatusContaPagar.PAGO).count()}")
        print(f"  - Total: {db.query(ContaPagar).count()}")

        print(f"\nContas a Receber:")
        print(f"  - A Receber: {db.query(ContaReceber).filter(ContaReceber.status == StatusContaReceber.A_RECEBER).count()}")
        print(f"  - Atrasadas: {db.query(ContaReceber).filter(ContaReceber.status == StatusContaReceber.ATRASADO).count()}")
        print(f"  - Recebidas: {db.query(ContaReceber).filter(ContaReceber.status == StatusContaReceber.RECEBIDO).count()}")
        print(f"  - Total: {db.query(ContaReceber).count()}")

    except Exception as e:
        print(f"\n[ERRO] Erro ao criar dados: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Iniciando seed de dados ficticios...\n")
    seed_contas()
