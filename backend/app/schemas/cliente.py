from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class ClienteBase(BaseModel):
    nome: str = Field(..., max_length=255)
    tipo_pessoa: str = Field(..., pattern="^[FJ]$")
    cpf_cnpj: str = Field(..., max_length=18)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    endereco: Optional[str] = Field(None, max_length=500)
    cidade: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=2)
    cep: Optional[str] = Field(None, max_length=10)
    ativo: bool = True

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, v):
        if v and len(v) != 2:
            raise ValueError("Estado deve ter 2 caracteres")
        return v.upper() if v else v


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=255)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    endereco: Optional[str] = Field(None, max_length=500)
    cidade: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=2)
    cep: Optional[str] = Field(None, max_length=10)
    ativo: Optional[bool] = None


class ClienteResponse(ClienteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
