from pydantic import BaseModel, Field
from typing import Optional


class HistoricoBase(BaseModel):
    codigo: str = Field(..., max_length=10)
    descricao: str = Field(..., max_length=255)
    ativo: bool = True


class HistoricoCreate(HistoricoBase):
    pass


class HistoricoUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=255)
    ativo: Optional[bool] = None


class HistoricoResponse(HistoricoBase):
    id: int

    class Config:
        from_attributes = True
