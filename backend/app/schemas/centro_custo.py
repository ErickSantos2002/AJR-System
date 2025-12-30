from pydantic import BaseModel, Field
from typing import Optional


class CentroCustoBase(BaseModel):
    codigo: str = Field(..., max_length=10)
    descricao: str = Field(..., max_length=255)
    ativo: bool = True


class CentroCustoCreate(CentroCustoBase):
    pass


class CentroCustoUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=255)
    ativo: Optional[bool] = None


class CentroCustoResponse(CentroCustoBase):
    id: int

    class Config:
        from_attributes = True
