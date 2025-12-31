"""
Script para criar um usuário administrador inicial de forma não-interativa.
Execute: python criar_admin_direto.py
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.usuario import Usuario
from app.auth import get_password_hash
from app.config import settings

# Criar engine e sessão
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def criar_usuario_admin():
    """Cria um usuário administrador padrão."""
    db = SessionLocal()

    try:
        # Dados do admin padrão
        nome = "Admin"
        email = "admin@ajr.com"
        senha = "admin123"

        # Verificar se já existe algum usuário com este email
        existing_user = db.query(Usuario).filter(Usuario.email == email).first()
        if existing_user:
            print(f"[AVISO] Usuário com email '{email}' já existe!")
            print(f"   ID: {existing_user.id}")
            print(f"   Nome: {existing_user.nome}")
            print(f"   Email: {existing_user.email}")
            print(f"   Admin: {existing_user.is_admin}")
            print(f"   Ativo: {existing_user.ativo}")
            return

        # Criar o usuário admin
        senha_hash = get_password_hash(senha)
        admin = Usuario(
            nome=nome,
            email=email,
            senha_hash=senha_hash,
            ativo=True,
            is_admin=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("[SUCESSO] Usuário administrador criado com sucesso!")
        print(f"   ID: {admin.id}")
        print(f"   Nome: {admin.nome}")
        print(f"   Email: {admin.email}")
        print(f"   Senha: {senha}")
        print(f"   Admin: {admin.is_admin}")
        print(f"   Ativo: {admin.ativo}")
        print("\n[OK] Você já pode fazer login no sistema!")

    except Exception as e:
        print(f"[ERRO] Erro ao criar usuário admin: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    criar_usuario_admin()
