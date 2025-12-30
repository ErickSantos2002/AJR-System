from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class CentroCusto(Base):
    __tablename__ = "centros_custo"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(10), unique=True, nullable=False, index=True)
    descricao = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)

    # Relationships
    partidas = relationship("Partida", back_populates="centro_custo")
