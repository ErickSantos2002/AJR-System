from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    tipo_pessoa = Column(String(1), nullable=False)  # F=Física, J=Jurídica
    cpf_cnpj = Column(String(18), unique=True, nullable=False, index=True)
    telefone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    endereco = Column(String(500), nullable=True)
    cidade = Column(String(100), nullable=True)
    estado = Column(String(2), nullable=True)
    cep = Column(String(10), nullable=True)
    ativo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    contratos = relationship("ContratoLocacao", back_populates="cliente")
