from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class StatusContrato(str, enum.Enum):
    ATIVO = "ATIVO"
    FINALIZADO = "FINALIZADO"
    CANCELADO = "CANCELADO"


class TipoCobranca(str, enum.Enum):
    DIARIA = "DIARIA"
    MENSAL = "MENSAL"
    HORA = "HORA"
    FECHADO = "FECHADO"


class ContratoLocacao(Base):
    __tablename__ = "contratos_locacao"

    id = Column(Integer, primary_key=True, index=True)
    numero_contrato = Column(String(50), unique=True, nullable=False, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    equipamento_id = Column(Integer, ForeignKey("equipamentos.id"), nullable=False)
    data_inicio = Column(Date, nullable=False)
    data_fim_prevista = Column(Date, nullable=True)
    data_fim_real = Column(Date, nullable=True)
    tipo_cobranca = Column(Enum(TipoCobranca), nullable=False)
    valor_cobranca = Column(Numeric(15, 2), nullable=False)
    valor_caucao = Column(Numeric(15, 2), nullable=True)
    status = Column(Enum(StatusContrato), default=StatusContrato.ATIVO, nullable=False)
    observacoes = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    cliente = relationship("Cliente", back_populates="contratos")
    equipamento = relationship("Equipamento", back_populates="contratos")
