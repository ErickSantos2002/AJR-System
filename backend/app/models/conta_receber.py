from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class StatusContaReceber(str, enum.Enum):
    A_RECEBER = "A_RECEBER"
    RECEBIDO = "RECEBIDO"
    ATRASADO = "ATRASADO"
    CANCELADO = "CANCELADO"


class ContaReceber(Base):
    __tablename__ = "contas_receber"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(200), nullable=False)
    valor = Column(Numeric(15, 2), nullable=False)
    data_vencimento = Column(Date, nullable=False, index=True)
    data_recebimento = Column(Date, nullable=True)
    status = Column(SQLEnum(StatusContaReceber), nullable=False, default=StatusContaReceber.A_RECEBER, index=True)

    # Categorização
    categoria = Column(String(50), nullable=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=True)
    cliente_nome = Column(String(200), nullable=True)  # Nome do cliente quando não tem ID

    # Parcelamento (vendas parceladas)
    parcela_numero = Column(Integer, nullable=True)
    parcela_total = Column(Integer, nullable=True)
    grupo_parcelamento = Column(String(100), nullable=True)

    # Número da Nota Fiscal / Documento
    numero_documento = Column(String(50), nullable=True, index=True)

    # Observações e relacionamentos
    observacoes = Column(String(500), nullable=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=True)  # Lançamento contábil relacionado
    usuario_id = Column(Integer, nullable=True)

    # Auditoria
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    cliente = relationship("Cliente", foreign_keys=[cliente_id])
    lancamento = relationship("Lancamento", foreign_keys=[lancamento_id])
