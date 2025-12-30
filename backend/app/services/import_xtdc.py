"""
Serviço de importação de dados do XTDC para o banco de dados
"""
from sqlalchemy.orm import Session
from app.parsers.xtdc_balancete_parser import BalanceteXTDCParser
from app.models.plano_contas import PlanoContas
from typing import Dict, List


class ImportadorXTDC:
    """Importa dados do XTDC para o banco de dados"""

    def __init__(self, db: Session):
        self.db = db
        self.logs = []
        self.erros = []

    def importar_plano_contas_de_balancete(self, arquivo_balancete: str) -> Dict:
        """
        Importa plano de contas a partir de um arquivo de balancete LST

        Args:
            arquivo_balancete: Caminho para o arquivo .LST do balancete

        Returns:
            Dict com estatísticas da importação
        """
        self.log(f"Iniciando importação de {arquivo_balancete}")

        # 1. Parse do arquivo
        parser = BalanceteXTDCParser(arquivo_balancete)
        contas = parser.parse()

        self.log(f"Arquivo parseado: {len(contas)} contas encontradas")

        # 2. Ordenar contas por nível (sintéticas antes de analíticas)
        contas_ordenadas = sorted(contas, key=lambda c: (c.nivel, c.codigo))

        # 3. Importar para o banco
        contas_criadas = 0
        contas_existentes = 0
        contas_erro = 0

        for conta in contas_ordenadas:
            try:
                # Verificar se já existe
                conta_existente = self.db.query(PlanoContas).filter(
                    PlanoContas.codigo == conta.codigo
                ).first()

                if conta_existente:
                    contas_existentes += 1
                    self.log(f"Conta {conta.codigo} já existe, pulando...")
                    continue

                # Encontrar conta pai (se houver)
                conta_pai_id = self._encontrar_conta_pai(conta.codigo)

                # Criar nova conta
                nova_conta = PlanoContas(
                    codigo=conta.codigo,
                    descricao=conta.nome,
                    tipo=conta.tipo_conta,
                    natureza=conta.natureza,
                    nivel=conta.nivel,
                    conta_pai_id=conta_pai_id,
                    aceita_lancamento=conta.aceita_lancamento,
                    ativo=True
                )

                self.db.add(nova_conta)
                contas_criadas += 1

                if contas_criadas % 10 == 0:
                    self.db.flush()  # Flush a cada 10 contas
                    self.log(f"Progresso: {contas_criadas} contas criadas...")

            except Exception as e:
                contas_erro += 1
                self.erro(f"Erro ao importar conta {conta.codigo}: {str(e)}")

        # 4. Commit final
        try:
            self.db.commit()
            self.log("Importação concluída com sucesso!")
        except Exception as e:
            self.db.rollback()
            self.erro(f"Erro ao fazer commit: {str(e)}")
            raise

        # 5. Estatísticas
        stats = parser.get_estatisticas()
        stats['importacao'] = {
            'contas_criadas': contas_criadas,
            'contas_existentes': contas_existentes,
            'contas_erro': contas_erro,
        }

        return stats

    def _encontrar_conta_pai(self, codigo: str) -> int:
        """
        Encontra o ID da conta pai baseado no código

        Exemplo: 1.1.01.01 tem pai 1.1.01
        """
        partes = codigo.split('.')

        # Se tem só um nível, não tem pai
        if len(partes) <= 1:
            return None

        # Remove o último nível para obter o código do pai
        codigo_pai = '.'.join(partes[:-1])

        conta_pai = self.db.query(PlanoContas).filter(
            PlanoContas.codigo == codigo_pai
        ).first()

        return conta_pai.id if conta_pai else None

    def log(self, mensagem: str):
        """Adiciona mensagem ao log"""
        self.logs.append(mensagem)
        print(f"[INFO] {mensagem}")

    def erro(self, mensagem: str):
        """Adiciona mensagem de erro"""
        self.erros.append(mensagem)
        print(f"[ERRO] {mensagem}")

    def get_relatorio(self) -> str:
        """Retorna relatório da importação"""
        relatorio = "\n=== RELATÓRIO DE IMPORTAÇÃO ===\n\n"
        relatorio += "LOGS:\n"
        for log in self.logs:
            relatorio += f"  - {log}\n"

        if self.erros:
            relatorio += "\nERROS:\n"
            for erro in self.erros:
                relatorio += f"  - {erro}\n"

        return relatorio
