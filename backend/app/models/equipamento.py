from sqlalchemy import Column, Integer, String, Boolean, Numeric, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TipoEquipamento(str, enum.Enum):
    CAMINHAO = "CAMINHAO"
    RETROESCAVADEIRA = "RETROESCAVADEIRA"
    TRATOR = "TRATOR"
    ESCAVADEIRA = "ESCAVADEIRA"
    PA_CARREGADEIRA = "PA_CARREGADEIRA"
    ROLO_COMPACTADOR = "ROLO_COMPACTADOR"
    OUTRO = "OUTRO"


class Equipamento(Base):
    __tablename__ = "equipamentos"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(Enum(TipoEquipamento), nullable=False)
    placa = Column(String(10), unique=True, nullable=True, index=True)
    identificador = Column(String(50), unique=True, nullable=False, index=True)
    modelo = Column(String(100), nullable=False)
    marca = Column(String(100), nullable=False)
    ano_fabricacao = Column(Integer, nullable=True)
    numero_serie = Column(String(100), nullable=True)
    valor_aquisicao = Column(Numeric(15, 2), nullable=True)
    hodometro_inicial = Column(Numeric(10, 2), nullable=True)
    hodometro_atual = Column(Numeric(10, 2), nullable=True)
    ativo = Column(Boolean, default=True, nullable=False)
    observacoes = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    contratos = relationship("ContratoLocacao", back_populates="equipamento")
    viagens = relationship("Viagem", back_populates="equipamento")
    abastecimentos = relationship("Abastecimento", back_populates="equipamento")
    manutencoes = relationship("Manutencao", back_populates="equipamento")
