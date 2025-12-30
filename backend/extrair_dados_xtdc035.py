"""
Parser especializado para extrair entidades do XTDC035.DAT
Extrai: clientes, equipamentos, motoristas e centros de custo
"""
from pathlib import Path
import re
from typing import List, Dict


class ParserXTDC035:
    def __init__(self, arquivo_texto: str):
        self.texto = arquivo_texto
        self.linhas = arquivo_texto.split('\n')

    def extrair_clientes(self) -> List[Dict]:
        """Extrai clientes/fornecedores do texto"""
        clientes = set()

        # Padrões conhecidos de clientes
        clientes_conhecidos = [
            'AGR Ambiental', 'Dalla Nora', 'BCEI', 'Supermix', 'JMA',
            'Breno Campos', 'Chemical', 'Coqueiral Park', 'HBR Engenharia',
            'Igreja Adventista', 'Inconcal', 'Quartzolit', 'RELOC',
            'Rodolfo Aguiar', 'Rodrigo Campos', 'Universo', 'Barbosa Pinto',
            'CTI', 'Lira Junior', 'Monteplan', 'Amintas', 'Dr. Boia',
            'Edielson', 'Lojo dos Presentes', 'LM Saraiva', 'JMA Construes',
            'Luiz - So Judas Tadeu', 'Max Plural', 'Prisma', 'Conlusa',
            'Poupec', 'Precisa Engenharia', 'Tondello', 'Moreira', 'New Home',
            'Consenco', 'Carlos Gilberto', 'Tibagi', 'AF Construoes',
            'Betel', 'Maring', 'Ceasa', 'Vizir Engenharia', 'Menezes',
            'Vaga Engenharia', 'Baptista Leal', 'Domini', 'GJ Engenharia',
            'Santo Antonio', 'Fokus', 'Recibom', 'Contrel', 'Parvi',
            'Navera', 'Reforma Recife', 'NorteSul', 'Giros', 'Disnove',
            'LQM Engenharia', 'MXN Engenharia', 'UTR Paulista', 'Stil Terraplenagem',
            'Brooks Engenharia', 'Marsou Eng', 'ABTEC Eng', 'CTM Colegio',
            'Luciano Resende', 'Everton FPS', 'Centerloc', 'Portico Locaes'
        ]

        # Procurar no texto
        for cliente in clientes_conhecidos:
            if cliente.upper() in self.texto.upper():
                # Limpar nome
                nome_limpo = cliente.strip()
                if len(nome_limpo) > 2:
                    clientes.add(nome_limpo)

        # Converter para lista de dicionários
        resultado = []
        for nome in sorted(clientes):
            resultado.append({
                'nome': nome,
                'tipo': 'CLIENTE' if any(x in nome.upper() for x in ['SUPERMIX', 'DALLA', 'AGR', 'JMA', 'BRENO']) else 'FORNECEDOR',
                'email': '',
                'telefone': '',
                'documento': '',
                'endereco': '',
                'ativo': True
            })

        return resultado

    def extrair_equipamentos(self) -> List[Dict]:
        """Extrai equipamentos do texto"""
        equipamentos = set()

        # Padrões de regex para equipamentos
        padroes = [
            r'RE - CAT - \d+',  # Retroescavadeiras
            r'RE-CAT-\d+',
            r'EH - CAT - \d+',  # Escavadeiras
            r'EH-CAT-\d+',
            r'CB Iveco',  # Caminhões
            r'CM 25370',
            r'PB - 01',
            r'PB-01',
            r'GM Montana',
            r'Gran Siena',
            r'VW Nivus',
            r'VW NIVUS',
            r'VW Saveiro',
            r'VW SAVEIRO',
            r'CB Mercedes',
            r'CB Santos Lins',
            r'RE JCB - \d+',
            r'RE-JCB-\d+',
            r'MB \d+',
            r'VW Caminho',
            r'Rompedor - GB3 - \d+',
        ]

        for padrao in padroes:
            matches = re.findall(padrao, self.texto, re.IGNORECASE)
            equipamentos.update(matches)

        # Mapear tipos de equipamento
        tipo_map = {
            'RE': 'RETROESCAVADEIRA',
            'EH': 'ESCAVADEIRA',
            'CB': 'CAMINHAO',
            'CM': 'CAMINHAO',
            'PB': 'CAMINHAO',
            'GM': 'CAMINHAO',
            'MB': 'CAMINHAO',
            'VW': 'CAMINHAO',
            'Gran': 'CAMINHAO',
            'Rompedor': 'OUTRO'
        }

        resultado = []
        for equip in sorted(equipamentos):
            # Normalizar nome
            nome_normalizado = equip.strip().replace(' - ', '-')

            # Determinar tipo
            tipo = 'OUTRO'
            for prefix, tipo_equip in tipo_map.items():
                if equip.upper().startswith(prefix.upper()):
                    tipo = tipo_equip
                    break

            resultado.append({
                'identificacao': nome_normalizado,
                'tipo': tipo,
                'marca': '',
                'modelo': '',
                'ano_fabricacao': None,
                'placa': '',
                'chassi': '',
                'status': 'ATIVO',
                'observacoes': f'Importado do XTDC - {equip}'
            })

        return resultado

    def extrair_motoristas(self) -> List[Dict]:
        """Extrai motoristas/operadores do texto"""
        motoristas = set()

        # Padrões para motoristas (geralmente CB = Caçamba/Caminhão operador)
        padroes = [
            r'CB [A-Za-zÀ-ÿ\s]+(?=\s{2,}|\.|\n|ª)',
            r'Retro - [A-Za-zÀ-ÿ]+',
        ]

        for padrao in padroes:
            matches = re.findall(padrao, self.texto)
            motoristas.update(matches)

        resultado = []
        for nome in sorted(motoristas):
            # Limpar nome
            nome_limpo = nome.strip()
            nome_limpo = re.sub(r'\s+', ' ', nome_limpo)

            if len(nome_limpo) > 3 and not any(x in nome_limpo.upper() for x in ['IVECO', 'MERCEDES', 'WV', 'WOSKVAGEM']):
                resultado.append({
                    'nome': nome_limpo,
                    'cpf': '',
                    'rg': '',
                    'cnh': '',
                    'categoria_cnh': 'D',
                    'telefone': '',
                    'email': '',
                    'endereco': '',
                    'data_admissao': None,
                    'status': 'ATIVO'
                })

        return resultado

    def extrair_centros_custo(self) -> List[Dict]:
        """Extrai centros de custo do texto"""
        centros = []

        # Procurar por padrões de centro de custo
        # Exemplo: "Combustiveis - RE CAT - 01"
        padroes = [
            r'(Combustiveis|Lubrificantes|Manuteno|Servios Prestados|Mo de obra|Produo|Diversos|Encargos Sociais) - (RE CAT|EH CAT|CB|CM|PB|GM|VW|Gran) - ?\d+',
            r'(Combustiveis|Lubrificantes|Manuteno|Servios Prestados|Mo de obra|Produo|Diversos|Encargos Sociais) - (Iveco|Mercedes|Santos Lins|Montana|Siena|Nivus|Saveiro)',
        ]

        centros_encontrados = set()
        for padrao in padroes:
            matches = re.findall(padrao, self.texto, re.IGNORECASE)
            for match in matches:
                descricao = f"{match[0]} - {match[1]}"
                centros_encontrados.add(descricao)

        # Adicionar centros administrativos
        centros_admin = [
            'Despesas Administrativas',
            'Salários',
            'Impostos Federais',
            'FGTS',
            'INSS',
            'Material de Expediente'
        ]

        for desc in centros_admin:
            if desc in self.texto:
                centros_encontrados.add(desc)

        # Converter para lista
        for idx, desc in enumerate(sorted(centros_encontrados), start=1):
            codigo = f"CC{idx:04d}"
            centros.append({
                'codigo': codigo,
                'descricao': desc,
                'ativo': True
            })

        return centros


def main():
    print("=" * 80)
    print("EXTRAÇÃO DE DADOS DO XTDC035.DAT")
    print("=" * 80)
    print()

    # Ler arquivo de texto extraído
    temp_path = Path(__file__).parent / "temp"
    arquivo_texto = temp_path / "xtdc035_texto_completo.txt"

    if not arquivo_texto.exists():
        print(f"ERRO - Arquivo nao encontrado: {arquivo_texto}")
        print("Execute primeiro: python extrair_xtdc035.py")
        return

    print(f"Lendo: {arquivo_texto}")
    with open(arquivo_texto, 'r', encoding='utf-8') as f:
        texto = f.read()

    parser = ParserXTDC035(texto)

    # Extrair clientes
    print("\nExtraindo clientes...")
    clientes = parser.extrair_clientes()
    print(f"OK - {len(clientes)} clientes encontrados")

    with open(temp_path / "xtdc035_clientes.txt", 'w', encoding='utf-8') as f:
        f.write("CLIENTES EXTRAÍDOS\n")
        f.write("=" * 80 + "\n\n")
        for c in clientes:
            f.write(f"{c['nome']} - {c['tipo']}\n")
    print(f"   Salvo em: temp/xtdc035_clientes.txt")

    # Extrair equipamentos
    print("\nExtraindo equipamentos...")
    equipamentos = parser.extrair_equipamentos()
    print(f"OK - {len(equipamentos)} equipamentos encontrados")

    with open(temp_path / "xtdc035_equipamentos.txt", 'w', encoding='utf-8') as f:
        f.write("EQUIPAMENTOS EXTRAÍDOS\n")
        f.write("=" * 80 + "\n\n")
        for e in equipamentos:
            f.write(f"{e['identificacao']} - {e['tipo']}\n")
    print(f"   Salvo em: temp/xtdc035_equipamentos.txt")

    # Extrair motoristas
    print("\nExtraindo motoristas...")
    motoristas = parser.extrair_motoristas()
    print(f"OK - {len(motoristas)} motoristas encontrados")

    with open(temp_path / "xtdc035_motoristas.txt", 'w', encoding='utf-8') as f:
        f.write("MOTORISTAS EXTRAÍDOS\n")
        f.write("=" * 80 + "\n\n")
        for m in motoristas:
            f.write(f"{m['nome']}\n")
    print(f"   Salvo em: temp/xtdc035_motoristas.txt")

    # Extrair centros de custo
    print("\nExtraindo centros de custo...")
    centros = parser.extrair_centros_custo()
    print(f"OK - {len(centros)} centros de custo encontrados")

    with open(temp_path / "xtdc035_centros.txt", 'w', encoding='utf-8') as f:
        f.write("CENTROS DE CUSTO EXTRAÍDOS\n")
        f.write("=" * 80 + "\n\n")
        for cc in centros:
            f.write(f"{cc['codigo']} - {cc['descricao']}\n")
    print(f"   Salvo em: temp/xtdc035_centros.txt")

    # Resumo final
    print("\n" + "=" * 80)
    print("RESUMO DA EXTRACAO")
    print("=" * 80)
    print(f"  Clientes:        {len(clientes)}")
    print(f"  Equipamentos:    {len(equipamentos)}")
    print(f"  Motoristas:      {len(motoristas)}")
    print(f"  Centros Custo:   {len(centros)}")
    print()
    print(f"OK - Todos os dados extraidos para: {temp_path}")
    print("\nProximo passo: Importar dados para o banco")


if __name__ == "__main__":
    main()
