"""
Script para analisar arquivos do XTDC e identificar seu conteúdo
"""
import os
from pathlib import Path


def analisar_arquivo_dat(arquivo_path):
    """Analisa um arquivo .DAT e tenta identificar seu conteúdo"""
    try:
        with open(arquivo_path, 'rb') as f:
            data = f.read()

        tamanho = len(data)

        # Tentar ler como texto
        try:
            texto = data.decode('latin1', errors='ignore')
            texto_limpo = ''.join(c for c in texto if c.isprintable() or c in '\n\r\t')
        except:
            texto_limpo = ""

        # Procurar por palavras-chave
        keywords = {
            'historico': ['hist', 'lanç', 'lanca', 'pagamento', 'recebimento'],
            'centro_custo': ['custo', 'centro', 'depart'],
            'lancamento': ['debito', 'credito', 'saldo', 'valor'],
            'conta': ['ativo', 'passivo', 'receita', 'despesa'],
        }

        encontrados = {}
        for categoria, palavras in keywords.items():
            encontrados[categoria] = any(palavra in texto_limpo.lower() for palavra in palavras)

        return {
            'arquivo': arquivo_path.name,
            'tamanho': tamanho,
            'texto_legivel': len(texto_limpo) > 20,
            'categorias': encontrados,
            'amostra': texto_limpo[:200] if texto_limpo else data[:100].hex()
        }

    except Exception as e:
        return {
            'arquivo': arquivo_path.name,
            'erro': str(e)
        }


def main():
    dados_path = Path(__file__).parent.parent / "AJRNEWS" / "AJRNEWS" / "DADOS"

    print("=" * 80)
    print("ANÁLISE DE ARQUIVOS .DAT DO XTDC")
    print("=" * 80)
    print()

    arquivos_dat = sorted(dados_path.glob("*.DAT"), key=lambda x: x.stat().st_size)

    for arquivo in arquivos_dat:
        resultado = analisar_arquivo_dat(arquivo)

        print(f"\n📄 {resultado['arquivo']}")
        print(f"   Tamanho: {resultado.get('tamanho', 0):,} bytes")

        if 'erro' in resultado:
            print(f"   ❌ Erro: {resultado['erro']}")
            continue

        print(f"   Texto legível: {'✅' if resultado.get('texto_legivel') else '❌'}")

        if resultado.get('categorias'):
            print("   Possível conteúdo:")
            for cat, found in resultado['categorias'].items():
                if found:
                    print(f"     - {cat.replace('_', ' ').title()}")

        if resultado.get('amostra'):
            print(f"   Amostra: {resultado['amostra'][:100]}...")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
