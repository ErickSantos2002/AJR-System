from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.equipamento import TipoEquipamento


class EquipamentoBase(BaseModel):
    tipo: TipoEquipamento
    placa: Optional[str] = Field(None, max_length=10)
    identificador: str = Field(..., max_length=50)
    modelo: str = Field(..., max_length=100)
    marca: str = Field(..., max_length=100)
    ano_fabricacao: Optional[int] = None
    numero_serie: Optional[str] = Field(None, max_length=100)
    valor_aquisicao: Optional[Decimal] = None
    hodometro_inicial: Optional[Decimal] = None
    hodometro_atual: Optional[Decimal] = None
    ativo: bool = True
    observacoes: Optional[str] = Field(None, max_length=1000)


class EquipamentoCreate(EquipamentoBase):
    pass


class EquipamentoUpdate(BaseModel):
    tipo: Optional[TipoEquipamento] = None
    placa: Optional[str] = Field(None, max_length=10)
    modelo: Optional[str] = Field(None, max_length=100)
    marca: Optional[str] = Field(None, max_length=100)
    ano_fabricacao: Optional[int] = None
    numero_serie: Optional[str] = Field(None, max_length=100)
    valor_aquisicao: Optional[Decimal] = None
    hodometro_atual: Optional[Decimal] = None
    ativo: Optional[bool] = None
    observacoes: Optional[str] = Field(None, max_length=1000)


class EquipamentoResponse(EquipamentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
