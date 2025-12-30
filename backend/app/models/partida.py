from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class TipoPartida(str, enum.Enum):
    DEBITO = "DEBITO"
    CREDITO = "CREDITO"


class Partida(Base):
    __tablename__ = "partidas"

    id = Column(Integer, primary_key=True, index=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=False)
    conta_id = Column(Integer, ForeignKey("plano_contas.id"), nullable=False)
    tipo = Column(Enum(TipoPartida), nullable=False)
    valor = Column(Numeric(15, 2), nullable=False)
    centro_custo_id = Column(Integer, ForeignKey("centros_custo.id"), nullable=True)

    # Relationships
    lancamento = relationship("Lancamento", back_populates="partidas")
    conta = relationship("PlanoContas", back_populates="partidas")
    centro_custo = relationship("CentroCusto", back_populates="partidas")
