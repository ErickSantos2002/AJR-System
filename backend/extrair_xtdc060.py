"""
Script para extrair lançamentos contábeis do XTDC060.DAT
Salva amostra em temp/ para análise
"""
from pathlib import Path


def extrair_texto_legivel(arquivo_path):
    """Extrai texto legível do arquivo binário"""
    with open(arquivo_path, 'rb') as f:
        data = f.read()

    # Decodificar como latin1
    texto = data.decode('latin1', errors='ignore')

    # Filtrar apenas caracteres printáveis
    texto_limpo = ''.join(c for c in texto if c.isprintable() or c in '\n\r\t ')

    return texto_limpo


def main():
    print("=" * 80)
    print("EXTRACAO DE LANCAMENTOS DO XTDC060.DAT")
    print("=" * 80)
    print()

    # Caminho do arquivo
    arquivo_path = Path(__file__).parent.parent / "AJRNEWS" / "AJRNEWS" / "DADOS" / "XTDC060.DAT"
    temp_path = Path(__file__).parent / "temp"
    temp_path.mkdir(exist_ok=True)

    if not arquivo_path.exists():
        print(f"ERRO - Arquivo nao encontrado: {arquivo_path}")
        return

    print(f"Lendo: {arquivo_path}")
    tamanho = arquivo_path.stat().st_size
    print(f"Tamanho: {tamanho:,} bytes ({tamanho / 1024 / 1024:.2f} MB)")
    print(f"Salvando em: {temp_path}")
    print()

    # Extrair texto
    print("Extraindo texto legivel...")
    texto = extrair_texto_legivel(arquivo_path)
    print(f"OK - {len(texto):,} caracteres extraidos")

    # Salvar texto completo
    arquivo_saida = temp_path / "xtdc060_texto_completo.txt"
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        f.write(texto)
    print(f"OK - Texto completo salvo em: temp/xtdc060_texto_completo.txt")

    # Salvar amostra para análise
    arquivo_amostra = temp_path / "xtdc060_amostra.txt"
    with open(arquivo_amostra, 'w', encoding='utf-8') as f:
        f.write("AMOSTRA DO XTDC060.DAT (primeiros 5000 caracteres)\n")
        f.write("=" * 80 + "\n\n")
        f.write(texto[:5000])
        f.write("\n\n" + "=" * 80 + "\n")
        f.write("AMOSTRA DO MEIO (caracteres 50000-55000)\n")
        f.write("=" * 80 + "\n\n")
        f.write(texto[50000:55000])
        f.write("\n\n" + "=" * 80 + "\n")
        f.write("AMOSTRA DO FINAL (ultimos 5000 caracteres)\n")
        f.write("=" * 80 + "\n\n")
        f.write(texto[-5000:])
    print(f"OK - Amostra salva em: temp/xtdc060_amostra.txt")

    # Estatísticas básicas
    print("\n" + "=" * 80)
    print("ESTATISTICAS")
    print("=" * 80)
    print(f"  Total de linhas: {texto.count(chr(10)):,}")
    print(f"  Total de caracteres: {len(texto):,}")

    # Procurar por padrões conhecidos
    padroes = {
        'data (DD/MM/YY)': r'\d{2}/\d{2}/\d{2}',
        'valor monetario': r'\d+,\d{2}',
        'codigo conta': r'^\d+\.',
    }

    import re
    print("\n  Padroes encontrados:")
    for nome, padrao in padroes.items():
        matches = re.findall(padrao, texto, re.MULTILINE)
        if matches:
            print(f"    {nome}: {len(matches):,} ocorrencias")
            if len(matches) <= 5:
                print(f"      Exemplos: {matches}")
            else:
                print(f"      Exemplos: {matches[:5]}")

    print("\nOK - Extracao concluida!")
    print("\nProximo passo: Analisar amostra e criar parser de lancamentos")


if __name__ == "__main__":
    main()
