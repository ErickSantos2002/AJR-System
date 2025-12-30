from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TipoCombustivel(str, enum.Enum):
    DIESEL = "DIESEL"
    GASOLINA = "GASOLINA"
    ETANOL = "ETANOL"
    GNV = "GNV"
    OUTRO = "OUTRO"


class Abastecimento(Base):
    __tablename__ = "abastecimentos"

    id = Column(Integer, primary_key=True, index=True)
    equipamento_id = Column(Integer, ForeignKey("equipamentos.id"), nullable=False)
    data_abastecimento = Column(Date, nullable=False, index=True)
    tipo_combustivel = Column(Enum(TipoCombustivel), nullable=False)
    litros = Column(Numeric(10, 2), nullable=False)
    valor_litro = Column(Numeric(10, 2), nullable=False)
    valor_total = Column(Numeric(15, 2), nullable=False)
    km_hodometro = Column(Numeric(10, 2), nullable=True)
    posto = Column(String(255), nullable=True)
    numero_nota = Column(String(50), nullable=True)
    observacoes = Column(String(1000), nullable=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    equipamento = relationship("Equipamento", back_populates="abastecimentos")
    lancamento = relationship("Lancamento")
