from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.auth import (
    UsuarioCreate,
    UsuarioResponse,
    UsuarioUpdate,
    Token,
    LoginRequest
)
from app.auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
    get_current_admin_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_user_by_email
)

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário no sistema.
    """
    # Verifica se email já existe
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado no sistema"
        )

    # Cria o novo usuário
    hashed_password = get_password_hash(user_data.senha)
    new_user = Usuario(
        nome=user_data.nome,
        email=user_data.email,
        senha_hash=hashed_password,
        ativo=True,
        is_admin=False  # Por padrão, novos usuários não são admin
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica um usuário e retorna um token JWT.
    """
    user = authenticate_user(db, login_data.email, login_data.senha)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Cria o token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login (usado pelo Swagger UI).
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UsuarioResponse)
def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    """
    Retorna informações do usuário atualmente logado.
    """
    return current_user


@router.get("/users", response_model=List[UsuarioResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: Usuario = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos os usuários do sistema (apenas admin).
    """
    users = db.query(Usuario).offset(skip).limit(limit).all()
    return users


@router.patch("/users/{user_id}", response_model=UsuarioResponse)
def update_user(
    user_id: int,
    user_data: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza um usuário (apenas admin).
    """
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Atualiza apenas os campos fornecidos
    if user_data.nome is not None:
        user.nome = user_data.nome
    if user_data.email is not None:
        # Verifica se o novo email já existe
        existing_user = get_user_by_email(db, user_data.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado no sistema"
            )
        user.email = user_data.email
    if user_data.senha is not None:
        user.senha_hash = get_password_hash(user_data.senha)
    if user_data.ativo is not None:
        user.ativo = user_data.ativo

    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: Usuario = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Deleta um usuário (apenas admin).
    Na verdade, apenas desativa o usuário.
    """
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Não permite deletar a si mesmo
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode deletar sua própria conta"
        )

    # Desativa o usuário ao invés de deletar
    user.ativo = False
    db.commit()

    return None
