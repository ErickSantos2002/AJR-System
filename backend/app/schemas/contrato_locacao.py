from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.contrato_locacao import StatusContrato, TipoCobranca


class ContratoLocacaoBase(BaseModel):
    numero_contrato: str = Field(..., max_length=50)
    cliente_id: int
    equipamento_id: int
    data_inicio: date
    data_fim_prevista: Optional[date] = None
    data_fim_real: Optional[date] = None
    tipo_cobranca: TipoCobranca
    valor_cobranca: Decimal = Field(..., ge=0)
    valor_caucao: Optional[Decimal] = Field(None, ge=0)
    status: StatusContrato = StatusContrato.ATIVO
    observacoes: Optional[str] = Field(None, max_length=1000)


class ContratoLocacaoCreate(ContratoLocacaoBase):
    pass


class ContratoLocacaoUpdate(BaseModel):
    data_fim_prevista: Optional[date] = None
    data_fim_real: Optional[date] = None
    tipo_cobranca: Optional[TipoCobranca] = None
    valor_cobranca: Optional[Decimal] = Field(None, ge=0)
    valor_caucao: Optional[Decimal] = Field(None, ge=0)
    status: Optional[StatusContrato] = None
    observacoes: Optional[str] = Field(None, max_length=1000)


class ContratoLocacaoResponse(ContratoLocacaoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
