"""
Parser para arquivos de balancete do XTDC (.LST)
Extrai o plano de contas com estrutura hierárquica
"""
import re
from typing import List, Dict, Optional
from decimal import Decimal


class ContaXTDC:
    """Representa uma conta do plano de contas do XTDC"""

    def __init__(self, codigo: str, nome: str, saldo_anterior: Decimal = None,
                 debitos: Decimal = None, creditos: Decimal = None, saldo_atual: Decimal = None):
        self.codigo = codigo
        self.nome = nome
        self.saldo_anterior = saldo_anterior or Decimal('0')
        self.debitos = debitos or Decimal('0')
        self.creditos = creditos or Decimal('0')
        self.saldo_atual = saldo_atual or Decimal('0')

    @property
    def nivel(self) -> int:
        """Calcula o nível hierárquico baseado no código"""
        # 1 = nível 1, 1.1 = nível 2, 1.1.01 = nível 3, etc
        return len([p for p in self.codigo.split('.') if p])

    @property
    def tipo_conta(self) -> str:
        """Determina o tipo de conta baseado no primeiro dígito"""
        primeiro_digito = self.codigo[0]
        tipos = {
            '1': 'ATIVO',
            '2': 'PASSIVO',
            '3': 'PATRIMONIO_LIQUIDO',
            '4': 'RECEITA',
            '5': 'DESPESA',
            '6': 'DESPESA',
            '7': 'RECEITA'
        }
        return tipos.get(primeiro_digito, 'ATIVO')

    @property
    def natureza(self) -> str:
        """Determina a natureza baseado no tipo"""
        tipo = self.tipo_conta
        if tipo in ['ATIVO', 'DESPESA']:
            return 'DEVEDORA'
        return 'CREDORA'

    @property
    def aceita_lancamento(self) -> bool:
        """Contas analíticas (com mais níveis) aceitam lançamento"""
        # Se tem saldo_atual diferente de zero ou movimentação, é analítica
        return self.nivel >= 3 or self.saldo_atual != 0 or self.debitos != 0 or self.creditos != 0

    def __repr__(self):
        return f"<Conta {self.codigo} - {self.nome}>"


class BalanceteXTDCParser:
    """Parser para arquivos de balancete do XTDC"""

    def __init__(self, arquivo_path: str):
        self.arquivo_path = arquivo_path
        self.contas: List[ContaXTDC] = []

    def parse(self) -> List[ContaXTDC]:
        """Processa o arquivo e extrai as contas"""
        with open(self.arquivo_path, 'r', encoding='latin1', errors='ignore') as f:
            linhas = f.readlines()

        for linha in linhas:
            conta = self._extrair_conta(linha)
            if conta:
                self.contas.append(conta)

        return self.contas

    def _extrair_conta(self, linha: str) -> Optional[ContaXTDC]:
        """Extrai dados de uma conta de uma linha do balancete"""
        # Padrão esperado: CODIGO NOME SALDO_ANT DEBITOS CREDITOS SALDO_ATUAL
        # Exemplo: 1.1.01.01.01      Caixa                               3.450,00     1.230.737,43       130.498,74      1.103.688,69

        # Remove espaços extras e tenta extrair
        linha = linha.strip()

        # Ignorar linhas vazias, cabeçalhos e separadores
        if not linha or 'NOME' in linha or '---' in linha or 'BALANCETE' in linha:
            return None

        # Regex para capturar código (pode ter pontos e números)
        # Formato: 1.1.01.01.01 ou 1 ou 1.1
        match = re.match(r'^(\d+(?:\.\d+)*)\s+(.+?)(?:\s+([\d.,\-\(\)]+))?(?:\s+([\d.,\-\(\)]+))?(?:\s+([\d.,\-\(\)]+))?(?:\s+([\d.,\-\(\)]+))?$', linha)

        if not match:
            return None

        codigo = match.group(1).strip()
        nome = match.group(2).strip()

        # Extrair valores (podem estar ausentes)
        try:
            saldo_anterior = self._parse_valor(match.group(3)) if match.group(3) else Decimal('0')
            debitos = self._parse_valor(match.group(4)) if match.group(4) else Decimal('0')
            creditos = self._parse_valor(match.group(5)) if match.group(5) else Decimal('0')
            saldo_atual = self._parse_valor(match.group(6)) if match.group(6) else Decimal('0')
        except:
            saldo_anterior = debitos = creditos = saldo_atual = Decimal('0')

        return ContaXTDC(
            codigo=codigo,
            nome=nome,
            saldo_anterior=saldo_anterior,
            debitos=debitos,
            creditos=creditos,
            saldo_atual=saldo_atual
        )

    def _parse_valor(self, valor_str: str) -> Decimal:
        """Converte string de valor para Decimal"""
        if not valor_str:
            return Decimal('0')

        # Remove espaços, pontos de milhar e substitui vírgula por ponto
        valor_str = valor_str.strip()
        valor_str = valor_str.replace('.', '').replace(',', '.')

        # Trata valores negativos (entre parênteses)
        if '(' in valor_str:
            valor_str = '-' + valor_str.replace('(', '').replace(')', '')

        try:
            return Decimal(valor_str)
        except:
            return Decimal('0')

    def get_estatisticas(self) -> Dict:
        """Retorna estatísticas das contas extraídas"""
        return {
            'total_contas': len(self.contas),
            'por_tipo': {
                'ATIVO': len([c for c in self.contas if c.tipo_conta == 'ATIVO']),
                'PASSIVO': len([c for c in self.contas if c.tipo_conta == 'PASSIVO']),
                'PATRIMONIO_LIQUIDO': len([c for c in self.contas if c.tipo_conta == 'PATRIMONIO_LIQUIDO']),
                'RECEITA': len([c for c in self.contas if c.tipo_conta == 'RECEITA']),
                'DESPESA': len([c for c in self.contas if c.tipo_conta == 'DESPESA']),
            },
            'por_nivel': {
                f'Nível {i}': len([c for c in self.contas if c.nivel == i])
                for i in range(1, 6)
            },
            'analiticas': len([c for c in self.contas if c.aceita_lancamento]),
            'sinteticas': len([c for c in self.contas if not c.aceita_lancamento]),
        }
