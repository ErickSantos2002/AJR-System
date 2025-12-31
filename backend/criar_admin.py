"""
Script para criar um usuário administrador inicial.
Execute: python criar_admin.py
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
        # Verificar se já existe algum usuário admin
        admin_exists = db.query(Usuario).filter(Usuario.is_admin == True).first()
        if admin_exists:
            print(f"[AVISO] Já existe um usuário admin: {admin_exists.email}")
            resposta = input("Deseja criar outro admin? (s/n): ")
            if resposta.lower() != 's':
                print("[CANCELADO] Operação cancelada.")
                return

        # Dados do admin
        print("\n=== Criar Novo Usuário Administrador ===\n")
        nome = input("Nome completo: ").strip()
        email = input("Email: ").strip()

        # Verificar se email já existe
        existing_user = db.query(Usuario).filter(Usuario.email == email).first()
        if existing_user:
            print(f"[ERRO] Email '{email}' já está cadastrado!")
            return

        senha = input("Senha (mínimo 6 caracteres): ").strip()

        if len(senha) < 6:
            print("[ERRO] A senha deve ter no mínimo 6 caracteres!")
            return

        if not nome or not email:
            print("[ERRO] Nome e email são obrigatórios!")
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

        print("\n[SUCESSO] Usuário administrador criado com sucesso!")
        print(f"   ID: {admin.id}")
        print(f"   Nome: {admin.nome}")
        print(f"   Email: {admin.email}")
        print(f"   Admin: {admin.is_admin}")
        print(f"   Ativo: {admin.ativo}")
        print("\n[OK] Você já pode fazer login no sistema!")

    except Exception as e:
        print(f"[ERRO] Erro ao criar usuário admin: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    criar_usuario_admin()
