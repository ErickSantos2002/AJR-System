from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.conta_pagar import StatusContaPagar


class ContaPagarBase(BaseModel):
    descricao: str = Field(..., max_length=200)
    valor: Decimal = Field(..., ge=0, decimal_places=2)
    data_vencimento: date
    categoria: Optional[str] = Field(None, max_length=50)
    fornecedor_id: Optional[int] = None
    fornecedor_nome: Optional[str] = Field(None, max_length=200)
    observacoes: Optional[str] = Field(None, max_length=500)


class ContaPagarCreate(ContaPagarBase):
    # Campos opcionais para parcelamento
    parcela_numero: Optional[int] = None
    parcela_total: Optional[int] = None
    grupo_parcelamento: Optional[str] = Field(None, max_length=100)

    # Campos opcionais para recorrência
    recorrente: bool = False
    dia_vencimento_recorrente: Optional[int] = Field(None, ge=1, le=31)

    usuario_id: Optional[int] = None


class ContaPagarUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=200)
    valor: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    status: Optional[StatusContaPagar] = None
    categoria: Optional[str] = Field(None, max_length=50)
    fornecedor_id: Optional[int] = None
    fornecedor_nome: Optional[str] = Field(None, max_length=200)
    observacoes: Optional[str] = Field(None, max_length=500)


class ContaPagarResponse(ContaPagarBase):
    id: int
    data_pagamento: Optional[date] = None
    status: StatusContaPagar
    parcela_numero: Optional[int] = None
    parcela_total: Optional[int] = None
    grupo_parcelamento: Optional[str] = None
    recorrente: bool
    dia_vencimento_recorrente: Optional[int] = None
    lancamento_id: Optional[int] = None
    usuario_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
