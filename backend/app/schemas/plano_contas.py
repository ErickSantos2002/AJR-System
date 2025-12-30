from pydantic import BaseModel, Field
from typing import Optional
from app.models.plano_contas import TipoConta, NaturezaConta


class PlanoContasBase(BaseModel):
    codigo: str = Field(..., max_length=20)
    descricao: str = Field(..., max_length=255)
    tipo: TipoConta
    natureza: NaturezaConta
    nivel: int = Field(..., ge=1)
    conta_pai_id: Optional[int] = None
    aceita_lancamento: bool = True
    ativo: bool = True


class PlanoContasCreate(PlanoContasBase):
    pass


class PlanoContasUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=255)
    aceita_lancamento: Optional[bool] = None
    ativo: Optional[bool] = None


class PlanoContasResponse(PlanoContasBase):
    id: int

    class Config:
        from_attributes = True
