from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UsuarioBase(BaseModel):
    email: EmailStr
    nome: str = Field(..., min_length=3, max_length=255)


class UsuarioCreate(UsuarioBase):
    senha: str = Field(..., min_length=6, max_length=100)


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=6, max_length=100)
    ativo: Optional[bool] = None


class UsuarioResponse(UsuarioBase):
    id: int
    ativo: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str
