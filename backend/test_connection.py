"""
Script para testar a conexão com o banco de dados PostgreSQL
"""
from sqlalchemy import text
from app.database import engine
from app.config import settings


def test_connection():
    print("=" * 60)
    print("TESTE DE CONEXÃO COM O BANCO DE DADOS")
    print("=" * 60)
    print(f"\nHost: {settings.DATABASE_HOST}")
    print(f"Porta: {settings.DATABASE_PORT}")
    print(f"Banco: {settings.DATABASE_NAME}")
    print(f"Usuário: {settings.DATABASE_USER}")
    print("\nTestando conexão...")

    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print("\n✅ CONEXÃO ESTABELECIDA COM SUCESSO!")
            print(f"\nVersão do PostgreSQL:")
            print(f"{version}")

            result = connection.execute(
                text("SELECT current_database(), current_user")
            )
            db, user = result.fetchone()
            print(f"\nBanco atual: {db}")
            print(f"Usuário atual: {user}")

            result = connection.execute(
                text("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)
            )
            tables = result.fetchall()

            print(f"\nTabelas existentes ({len(tables)}):")
            if tables:
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print("  (nenhuma tabela criada ainda)")

            print("\n" + "=" * 60)
            print("✅ TESTE CONCLUÍDO COM SUCESSO!")
            print("=" * 60)

    except Exception as e:
        print("\n❌ ERRO NA CONEXÃO!")
        print(f"\nDetalhes do erro:")
        print(f"{type(e).__name__}: {e}")
        print("\n" + "=" * 60)
        print("❌ TESTE FALHOU")
        print("=" * 60)
        raise


if __name__ == "__main__":
    test_connection()
