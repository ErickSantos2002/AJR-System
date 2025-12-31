from sqlalchemy import Column, Integer, String, Date, Numeric, Boolean, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class StatusContaPagar(str, enum.Enum):
    A_VENCER = "A_VENCER"
    VENCIDO = "VENCIDO"
    PAGO = "PAGO"
    CANCELADO = "CANCELADO"


class ContaPagar(Base):
    __tablename__ = "contas_pagar"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(200), nullable=False)
    valor = Column(Numeric(15, 2), nullable=False)
    data_vencimento = Column(Date, nullable=False, index=True)
    data_pagamento = Column(Date, nullable=True)
    status = Column(SQLEnum(StatusContaPagar), nullable=False, default=StatusContaPagar.A_VENCER, index=True)

    # Categorização
    categoria = Column(String(50), nullable=True, index=True)
    fornecedor_id = Column(Integer, nullable=True)  # Pode ser NULL se for gasto sem fornecedor cadastrado
    fornecedor_nome = Column(String(200), nullable=True)  # Nome do fornecedor quando não tem ID

    # Parcelamento
    parcela_numero = Column(Integer, nullable=True)  # Ex: 1, 2, 3...
    parcela_total = Column(Integer, nullable=True)  # Ex: 60 (parcelas)
    grupo_parcelamento = Column(String(100), nullable=True)  # ID único para agrupar parcelas

    # Recorrência
    recorrente = Column(Boolean, default=False)  # True para gastos fixos mensais
    dia_vencimento_recorrente = Column(Integer, nullable=True)  # Dia do mês (1-31)

    # Observações e relacionamentos
    observacoes = Column(String(500), nullable=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=True)  # Lançamento contábil relacionado
    usuario_id = Column(Integer, nullable=True)

    # Auditoria
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    lancamento = relationship("Lancamento", foreign_keys=[lancamento_id])
