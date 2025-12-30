from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Motorista(Base):
    __tablename__ = "motoristas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    cnh = Column(String(20), nullable=False)
    categoria_cnh = Column(String(2), nullable=False)
    validade_cnh = Column(Date, nullable=False)
    telefone = Column(String(20), nullable=True)
    endereco = Column(String(500), nullable=True)
    data_nascimento = Column(Date, nullable=True)
    data_admissao = Column(Date, nullable=True)
    ativo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    viagens = relationship("Viagem", back_populates="motorista")
