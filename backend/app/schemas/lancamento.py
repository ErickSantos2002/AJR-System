from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from app.models.partida import TipoPartida


class PartidaBase(BaseModel):
    conta_id: int
    tipo: TipoPartida
    valor: Decimal = Field(..., ge=0)
    centro_custo_id: Optional[int] = None


class PartidaCreate(PartidaBase):
    pass


class PartidaResponse(PartidaBase):
    id: int
    lancamento_id: int

    class Config:
        from_attributes = True


class LancamentoBase(BaseModel):
    data_lancamento: date
    numero_lote: Optional[str] = Field(None, max_length=20)
    historico_id: int
    complemento: Optional[str] = Field(None, max_length=500)
    usuario_id: Optional[int] = None


class LancamentoCreate(LancamentoBase):
    partidas: List[PartidaCreate] = Field(..., min_length=2)

    @field_validator("partidas")
    @classmethod
    def validate_partidas_dobradas(cls, v):
        debitos = sum(p.valor for p in v if p.tipo == TipoPartida.DEBITO)
        creditos = sum(p.valor for p in v if p.tipo == TipoPartida.CREDITO)

        if debitos != creditos:
            raise ValueError(
                f"Partidas dobradas inválidas: débitos ({debitos}) != créditos ({creditos})"
            )

        return v


class LancamentoResponse(LancamentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    partidas: List[PartidaResponse] = []

    class Config:
        from_attributes = True
