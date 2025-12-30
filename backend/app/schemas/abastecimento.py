from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.abastecimento import TipoCombustivel


class AbastecimentoBase(BaseModel):
    equipamento_id: int
    data_abastecimento: date
    tipo_combustivel: TipoCombustivel
    litros: Decimal = Field(..., ge=0)
    valor_litro: Decimal = Field(..., ge=0)
    valor_total: Decimal = Field(..., ge=0)
    km_hodometro: Optional[Decimal] = None
    posto: Optional[str] = Field(None, max_length=255)
    numero_nota: Optional[str] = Field(None, max_length=50)
    observacoes: Optional[str] = Field(None, max_length=1000)
    lancamento_id: Optional[int] = None


class AbastecimentoCreate(AbastecimentoBase):
    pass


class AbastecimentoUpdate(BaseModel):
    data_abastecimento: Optional[date] = None
    tipo_combustivel: Optional[TipoCombustivel] = None
    litros: Optional[Decimal] = Field(None, ge=0)
    valor_litro: Optional[Decimal] = Field(None, ge=0)
    valor_total: Optional[Decimal] = Field(None, ge=0)
    km_hodometro: Optional[Decimal] = None
    posto: Optional[str] = Field(None, max_length=255)
    numero_nota: Optional[str] = Field(None, max_length=50)
    observacoes: Optional[str] = Field(None, max_length=1000)
    lancamento_id: Optional[int] = None


class AbastecimentoResponse(AbastecimentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
