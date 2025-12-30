from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, time, datetime
from decimal import Decimal


class ViagemBase(BaseModel):
    equipamento_id: int
    motorista_id: int
    data_viagem: date
    hora_saida: Optional[time] = None
    hora_chegada: Optional[time] = None
    origem: str = Field(..., max_length=255)
    destino: str = Field(..., max_length=255)
    km_inicial: Optional[Decimal] = None
    km_final: Optional[Decimal] = None
    km_percorrido: Optional[Decimal] = None
    observacoes: Optional[str] = Field(None, max_length=1000)
    lancamento_id: Optional[int] = None


class ViagemCreate(ViagemBase):
    pass


class ViagemUpdate(BaseModel):
    motorista_id: Optional[int] = None
    data_viagem: Optional[date] = None
    hora_saida: Optional[time] = None
    hora_chegada: Optional[time] = None
    origem: Optional[str] = Field(None, max_length=255)
    destino: Optional[str] = Field(None, max_length=255)
    km_inicial: Optional[Decimal] = None
    km_final: Optional[Decimal] = None
    km_percorrido: Optional[Decimal] = None
    observacoes: Optional[str] = Field(None, max_length=1000)
    lancamento_id: Optional[int] = None


class ViagemResponse(ViagemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
