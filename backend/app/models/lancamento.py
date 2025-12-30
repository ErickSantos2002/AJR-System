from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Lancamento(Base):
    __tablename__ = "lancamentos"

    id = Column(Integer, primary_key=True, index=True)
    data_lancamento = Column(Date, nullable=False, index=True)
    numero_lote = Column(String(20), nullable=True, index=True)
    historico_id = Column(Integer, ForeignKey("historicos.id"), nullable=False)
    complemento = Column(String(500), nullable=True)
    usuario_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    historico = relationship("Historico", back_populates="lancamentos")
    partidas = relationship("Partida", back_populates="lancamento", cascade="all, delete-orphan")
