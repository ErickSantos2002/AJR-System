from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class MotoristaBase(BaseModel):
    nome: str = Field(..., max_length=255)
    cpf: str = Field(..., max_length=14)
    cnh: str = Field(..., max_length=20)
    categoria_cnh: str = Field(..., max_length=2)
    validade_cnh: date
    telefone: Optional[str] = Field(None, max_length=20)
    endereco: Optional[str] = Field(None, max_length=500)
    data_nascimento: Optional[date] = None
    data_admissao: Optional[date] = None
    ativo: bool = True


class MotoristaCreate(MotoristaBase):
    pass


class MotoristaUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=255)
    cnh: Optional[str] = Field(None, max_length=20)
    categoria_cnh: Optional[str] = Field(None, max_length=2)
    validade_cnh: Optional[date] = None
    telefone: Optional[str] = Field(None, max_length=20)
    endereco: Optional[str] = Field(None, max_length=500)
    data_nascimento: Optional[date] = None
    data_admissao: Optional[date] = None
    ativo: Optional[bool] = None


class MotoristaResponse(MotoristaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
