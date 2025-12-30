"""
Script para extrair dados do XTDC035.DAT
Salva resultados em temp/
"""
from pathlib import Path
import re


def extrair_texto_legivel(arquivo_path):
    """Extrai texto legível do arquivo binário"""
    with open(arquivo_path, 'rb') as f:
        data = f.read()

    # Decodificar como latin1
    texto = data.decode('latin1', errors='ignore')

    # Filtrar apenas caracteres printáveis
    texto_limpo = ''.join(c for c in texto if c.isprintable() or c in '\n\r\t ')

    return texto_limpo


def extrair_historicos(texto):
    """Extrai históricos do texto"""
    historicos = []

    # Procurar padrões de histórico
    # Exemplo: "0001 Pagamento de fornecedor"
    linhas = texto.split('\n')

    for linha in linhas:
        linha = linha.strip()
        if not linha:
            continue

        # Procurar por códigos numéricos seguidos de descrição
        match = re.match(r'^(\d{3,4})\s+(.{10,}?)(?:\s{5,}|$)', linha)
        if match:
            codigo = match.group(1)
            descricao = match.group(2).strip()

            if descricao and len(descricao) > 3:
                historicos.append({
                    'codigo': codigo,
                    'descricao': descricao[:100]
                })

    return historicos


def extrair_centros_custo(texto):
    """Extrai centros de custo do texto"""
    centros = []

    linhas = texto.split('\n')

    for linha in linhas:
        linha = linha.strip()

        # Procurar por padrões de centro de custo
        if 'CUSTO' in linha.upper() or 'CENTRO' in linha.upper():
            # Tentar extrair código e descrição
            match = re.match(r'^(\w+)\s+(.{10,}?)(?:\s{5,}|$)', linha)
            if match:
                codigo = match.group(1)
                descricao = match.group(2).strip()

                if descricao and len(descricao) > 3:
                    centros.append({
                        'codigo': codigo,
                        'descricao': descricao[:100]
                    })

    return centros


def main():
    print("=" * 80)
    print("EXTRAÇÃO DE DADOS DO XTDC035.DAT")
    print("=" * 80)
    print()

    # Caminho do arquivo
    arquivo_path = Path(__file__).parent.parent / "AJRNEWS" / "AJRNEWS" / "DADOS" / "XTDC035.DAT"
    temp_path = Path(__file__).parent / "temp"
    temp_path.mkdir(exist_ok=True)

    if not arquivo_path.exists():
        print(f"❌ Arquivo não encontrado: {arquivo_path}")
        return

    print(f"📄 Lendo: {arquivo_path}")
    print(f"📁 Salvando em: {temp_path}")
    print()

    # Extrair texto
    texto = extrair_texto_legivel(arquivo_path)

    # Salvar texto completo
    with open(temp_path / "xtdc035_texto_completo.txt", 'w', encoding='utf-8') as f:
        f.write(texto)
    print(f"✅ Texto completo salvo em: temp/xtdc035_texto_completo.txt")

    # Extrair históricos
    print("\n🔍 Extraindo históricos...")
    historicos = extrair_historicos(texto)

    with open(temp_path / "xtdc035_historicos.txt", 'w', encoding='utf-8') as f:
        f.write("HISTÓRICOS EXTRAÍDOS\n")
        f.write("=" * 80 + "\n\n")
        for h in historicos:
            f.write(f"{h['codigo']} - {h['descricao']}\n")

    print(f"✅ {len(historicos)} históricos encontrados")
    print(f"   Salvo em: temp/xtdc035_historicos.txt")

    # Extrair centros de custo
    print("\n🔍 Extraindo centros de custo...")
    centros = extrair_centros_custo(texto)

    with open(temp_path / "xtdc035_centros_custo.txt", 'w', encoding='utf-8') as f:
        f.write("CENTROS DE CUSTO EXTRAÍDOS\n")
        f.write("=" * 80 + "\n\n")
        for c in centros:
            f.write(f"{c['codigo']} - {c['descricao']}\n")

    print(f"✅ {len(centros)} centros de custo encontrados")
    print(f"   Salvo em: temp/xtdc035_centros_custo.txt")

    # Amostra do texto
    print("\n📋 AMOSTRA DO TEXTO (primeiros 500 chars):")
    print("-" * 80)
    print(texto[:500])
    print("-" * 80)

    print(f"\n✅ Extração concluída!")
    print(f"\n💡 Verifique os arquivos em: {temp_path}")


if __name__ == "__main__":
    main()
