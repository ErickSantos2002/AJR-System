from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.manutencao import TipoManutencao, StatusManutencao


class ManutencaoBase(BaseModel):
    equipamento_id: int
    tipo: TipoManutencao
    status: StatusManutencao = StatusManutencao.AGENDADA
    data_agendada: Optional[date] = None
    data_realizada: Optional[date] = None
    km_hodometro: Optional[Decimal] = None
    descricao: str
    oficina: Optional[str] = Field(None, max_length=255)
    mecanico: Optional[str] = Field(None, max_length=255)
    valor_mao_obra: Optional[Decimal] = Field(None, ge=0)
    valor_pecas: Optional[Decimal] = Field(None, ge=0)
    valor_total: Optional[Decimal] = Field(None, ge=0)
    numero_nota: Optional[str] = Field(None, max_length=50)
    observacoes: Optional[str] = Field(None, max_length=1000)
    lancamento_id: Optional[int] = None


class ManutencaoCreate(ManutencaoBase):
    pass


class ManutencaoUpdate(BaseModel):
    tipo: Optional[TipoManutencao] = None
    status: Optional[StatusManutencao] = None
    data_agendada: Optional[date] = None
    data_realizada: Optional[date] = None
    km_hodometro: Optional[Decimal] = None
    descricao: Optional[str] = None
    oficina: Optional[str] = Field(None, max_length=255)
    mecanico: Optional[str] = Field(None, max_length=255)
    valor_mao_obra: Optional[Decimal] = Field(None, ge=0)
    valor_pecas: Optional[Decimal] = Field(None, ge=0)
    valor_total: Optional[Decimal] = Field(None, ge=0)
    numero_nota: Optional[str] = Field(None, max_length=50)
    observacoes: Optional[str] = Field(None, max_length=1000)
    lancamento_id: Optional[int] = None


class ManutencaoResponse(ManutencaoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
