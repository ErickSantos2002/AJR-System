from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TipoManutencao(str, enum.Enum):
    PREVENTIVA = "PREVENTIVA"
    CORRETIVA = "CORRETIVA"
    PREDITIVA = "PREDITIVA"


class StatusManutencao(str, enum.Enum):
    AGENDADA = "AGENDADA"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDA = "CONCLUIDA"
    CANCELADA = "CANCELADA"


class Manutencao(Base):
    __tablename__ = "manutencoes"

    id = Column(Integer, primary_key=True, index=True)
    equipamento_id = Column(Integer, ForeignKey("equipamentos.id"), nullable=False)
    tipo = Column(Enum(TipoManutencao), nullable=False)
    status = Column(Enum(StatusManutencao), default=StatusManutencao.AGENDADA, nullable=False)
    data_agendada = Column(Date, nullable=True, index=True)
    data_realizada = Column(Date, nullable=True)
    km_hodometro = Column(Numeric(10, 2), nullable=True)
    descricao = Column(Text, nullable=False)
    oficina = Column(String(255), nullable=True)
    mecanico = Column(String(255), nullable=True)
    valor_mao_obra = Column(Numeric(15, 2), nullable=True)
    valor_pecas = Column(Numeric(15, 2), nullable=True)
    valor_total = Column(Numeric(15, 2), nullable=True)
    numero_nota = Column(String(50), nullable=True)
    observacoes = Column(String(1000), nullable=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    equipamento = relationship("Equipamento", back_populates="manutencoes")
    lancamento = relationship("Lancamento")
