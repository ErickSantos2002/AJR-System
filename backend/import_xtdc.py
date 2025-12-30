"""
Script para importar dados do XTDC para o banco de dados

Uso:
    python import_xtdc.py

O script procura automaticamente pelos arquivos .LST na pasta AJRNEWS
"""
import os
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.services.import_xtdc import ImportadorXTDC


def main():
    print("=" * 70)
    print("IMPORTADOR DE DADOS DO XTDC")
    print("=" * 70)
    print()

    # Caminho para os arquivos do XTDC
    # __file__ = backend/import_xtdc.py
    # parent = backend/
    # parent.parent = AJR-System/
    base_path = Path(__file__).parent.parent / "AJRNEWS" / "AJRNEWS"
    trabalho_path = base_path / "TRABALHO"

    print(f"Procurando arquivos em: {trabalho_path}")
    print()

    if not trabalho_path.exists():
        print(f"❌ ERRO: Pasta não encontrada: {trabalho_path}")
        return

    # Procurar arquivos .LST
    arquivos_lst = list(trabalho_path.glob("*.LST"))

    if not arquivos_lst:
        print("❌ Nenhum arquivo .LST encontrado!")
        return

    print(f"✅ Encontrados {len(arquivos_lst)} arquivos .LST")
    print()

    # Confirmar importação de todos
    print(f"Deseja importar TODOS os {len(arquivos_lst)} arquivos? (s/n)")
    confirmacao = input("> ").strip().lower()

    if confirmacao != 's':
        print("❌ Importação cancelada!")
        return

    print()
    print("=" * 70)
    print("INICIANDO IMPORTAÇÃO...")
    print("=" * 70)
    print()

    # Criar sessão do banco
    db = SessionLocal()

    try:
        # Importar TODOS os arquivos
        importador = ImportadorXTDC(db)

        total_contas_criadas = 0
        total_contas_existentes = 0
        total_contas_erro = 0

        for i, arquivo in enumerate(arquivos_lst, 1):
            print(f"\n[{i}/{len(arquivos_lst)}] Processando: {arquivo.name}")
            print("-" * 70)

            try:
                stats = importador.importar_plano_contas_de_balancete(str(arquivo))

                total_contas_criadas += stats['importacao']['contas_criadas']
                total_contas_existentes += stats['importacao']['contas_existentes']
                total_contas_erro += stats['importacao']['contas_erro']

                print(f"  ✅ {stats['importacao']['contas_criadas']} contas criadas, "
                      f"{stats['importacao']['contas_existentes']} já existentes")

            except Exception as e:
                print(f"  ❌ Erro: {str(e)}")
                total_contas_erro += 1

        # Estatísticas finais consolidadas
        stats = {
            'importacao': {
                'contas_criadas': total_contas_criadas,
                'contas_existentes': total_contas_existentes,
                'contas_erro': total_contas_erro,
            }
        }

        print()
        print("=" * 70)
        print("IMPORTAÇÃO CONCLUÍDA!")
        print("=" * 70)
        print()

        # Mostrar estatísticas finais
        print("📊 ESTATÍSTICAS FINAIS:")
        print()
        print(f"  Arquivos processados: {len(arquivos_lst)}")
        print(f"  Contas criadas: {stats['importacao']['contas_criadas']}")
        print(f"  Contas já existentes: {stats['importacao']['contas_existentes']}")
        print(f"  Erros: {stats['importacao']['contas_erro']}")
        print()

        if importador.erros:
            print("⚠️  AVISOS/ERROS:")
            for erro in importador.erros:
                print(f"  - {erro}")
            print()

        print("✅ Dados importados com sucesso no PostgreSQL!")
        print()
        print("💡 Verifique no DBeaver ou acesse http://localhost:8000/docs")

    except Exception as e:
        print()
        print("=" * 70)
        print("❌ ERRO NA IMPORTAÇÃO!")
        print("=" * 70)
        print()
        print(f"Erro: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        db.close()


if __name__ == "__main__":
    main()
