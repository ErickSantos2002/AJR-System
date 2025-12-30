from sqlalchemy import Column, Integer, String, Date, Time, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Viagem(Base):
    __tablename__ = "viagens"

    id = Column(Integer, primary_key=True, index=True)
    equipamento_id = Column(Integer, ForeignKey("equipamentos.id"), nullable=False)
    motorista_id = Column(Integer, ForeignKey("motoristas.id"), nullable=False)
    data_viagem = Column(Date, nullable=False, index=True)
    hora_saida = Column(Time, nullable=True)
    hora_chegada = Column(Time, nullable=True)
    origem = Column(String(255), nullable=False)
    destino = Column(String(255), nullable=False)
    km_inicial = Column(Numeric(10, 2), nullable=True)
    km_final = Column(Numeric(10, 2), nullable=True)
    km_percorrido = Column(Numeric(10, 2), nullable=True)
    observacoes = Column(String(1000), nullable=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    equipamento = relationship("Equipamento", back_populates="viagens")
    motorista = relationship("Motorista", back_populates="viagens")
    lancamento = relationship("Lancamento")
