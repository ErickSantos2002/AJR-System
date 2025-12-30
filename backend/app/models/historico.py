from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Historico(Base):
    __tablename__ = "historicos"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(10), unique=True, nullable=False, index=True)
    descricao = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)

    # Relationships
    lancamentos = relationship("Lancamento", back_populates="historico")
