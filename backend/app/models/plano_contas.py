from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class TipoConta(str, enum.Enum):
    ATIVO = "ATIVO"
    PASSIVO = "PASSIVO"
    PATRIMONIO_LIQUIDO = "PATRIMONIO_LIQUIDO"
    RECEITA = "RECEITA"
    DESPESA = "DESPESA"


class NaturezaConta(str, enum.Enum):
    DEVEDORA = "DEVEDORA"
    CREDORA = "CREDORA"


class PlanoContas(Base):
    __tablename__ = "plano_contas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    descricao = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoConta), nullable=False)
    natureza = Column(Enum(NaturezaConta), nullable=False)
    nivel = Column(Integer, nullable=False)
    conta_pai_id = Column(Integer, ForeignKey("plano_contas.id"), nullable=True)
    aceita_lancamento = Column(Boolean, default=True, nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)

    # Relationships
    conta_pai = relationship("PlanoContas", remote_side=[id], backref="subcontas")
    partidas = relationship("Partida", back_populates="conta")
