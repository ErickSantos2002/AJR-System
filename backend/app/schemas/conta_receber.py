from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.conta_receber import StatusContaReceber


class ContaReceberBase(BaseModel):
    descricao: str = Field(..., max_length=200)
    valor: Decimal = Field(..., ge=0, decimal_places=2)
    data_vencimento: date
    categoria: Optional[str] = Field(None, max_length=50)
    cliente_id: Optional[int] = None
    cliente_nome: Optional[str] = Field(None, max_length=200)
    numero_documento: Optional[str] = Field(None, max_length=50)
    observacoes: Optional[str] = Field(None, max_length=500)


class ContaReceberCreate(ContaReceberBase):
    # Campos opcionais para parcelamento
    parcela_numero: Optional[int] = None
    parcela_total: Optional[int] = None
    grupo_parcelamento: Optional[str] = Field(None, max_length=100)

    usuario_id: Optional[int] = None


class ContaReceberUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=200)
    valor: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    data_vencimento: Optional[date] = None
    data_recebimento: Optional[date] = None
    status: Optional[StatusContaReceber] = None
    categoria: Optional[str] = Field(None, max_length=50)
    cliente_id: Optional[int] = None
    cliente_nome: Optional[str] = Field(None, max_length=200)
    numero_documento: Optional[str] = Field(None, max_length=50)
    observacoes: Optional[str] = Field(None, max_length=500)


class ContaReceberResponse(ContaReceberBase):
    id: int
    data_recebimento: Optional[date] = None
    status: StatusContaReceber
    parcela_numero: Optional[int] = None
    parcela_total: Optional[int] = None
    grupo_parcelamento: Optional[str] = None
    lancamento_id: Optional[int] = None
    usuario_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
