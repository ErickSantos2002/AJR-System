"""
Corrige emails vazios nos clientes
"""
from app.database import SessionLocal
from app.models.cliente import Cliente

db = SessionLocal()

try:
    # Atualizar todos os clientes com email vazio para None
    clientes = db.query(Cliente).filter(Cliente.email == '').all()

    print(f"Corrigindo {len(clientes)} clientes com email vazio...")

    for cliente in clientes:
        cliente.email = None

    db.commit()
    print("OK - Emails corrigidos!")

except Exception as e:
    print(f"Erro: {e}")
    db.rollback()
finally:
    db.close()
