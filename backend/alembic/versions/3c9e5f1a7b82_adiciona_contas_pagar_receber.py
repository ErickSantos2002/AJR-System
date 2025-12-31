"""adiciona contas pagar receber

Revision ID: 3c9e5f1a7b82
Revises: 2f0808ed0429
Create Date: 2025-12-30 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3c9e5f1a7b82'
down_revision = '2f0808ed0429'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Criar tabela contas_pagar
    op.create_table('contas_pagar',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('descricao', sa.String(length=200), nullable=False),
        sa.Column('valor', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('data_vencimento', sa.Date(), nullable=False),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.Column('status', sa.Enum('A_VENCER', 'VENCIDO', 'PAGO', 'CANCELADO', name='statuscontapagar'), nullable=False),
        sa.Column('categoria', sa.String(length=50), nullable=True),
        sa.Column('fornecedor_id', sa.Integer(), nullable=True),
        sa.Column('fornecedor_nome', sa.String(length=200), nullable=True),
        sa.Column('parcela_numero', sa.Integer(), nullable=True),
        sa.Column('parcela_total', sa.Integer(), nullable=True),
        sa.Column('grupo_parcelamento', sa.String(length=100), nullable=True),
        sa.Column('recorrente', sa.Boolean(), nullable=True),
        sa.Column('dia_vencimento_recorrente', sa.Integer(), nullable=True),
        sa.Column('observacoes', sa.String(length=500), nullable=True),
        sa.Column('lancamento_id', sa.Integer(), nullable=True),
        sa.Column('usuario_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['lancamento_id'], ['lancamentos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_contas_pagar_id'), 'contas_pagar', ['id'], unique=False)
    op.create_index(op.f('ix_contas_pagar_data_vencimento'), 'contas_pagar', ['data_vencimento'], unique=False)
    op.create_index(op.f('ix_contas_pagar_status'), 'contas_pagar', ['status'], unique=False)
    op.create_index(op.f('ix_contas_pagar_categoria'), 'contas_pagar', ['categoria'], unique=False)

    # Criar tabela contas_receber
    op.create_table('contas_receber',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('descricao', sa.String(length=200), nullable=False),
        sa.Column('valor', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('data_vencimento', sa.Date(), nullable=False),
        sa.Column('data_recebimento', sa.Date(), nullable=True),
        sa.Column('status', sa.Enum('A_RECEBER', 'RECEBIDO', 'ATRASADO', 'CANCELADO', name='statuscontareceber'), nullable=False),
        sa.Column('categoria', sa.String(length=50), nullable=True),
        sa.Column('cliente_id', sa.Integer(), nullable=True),
        sa.Column('cliente_nome', sa.String(length=200), nullable=True),
        sa.Column('parcela_numero', sa.Integer(), nullable=True),
        sa.Column('parcela_total', sa.Integer(), nullable=True),
        sa.Column('grupo_parcelamento', sa.String(length=100), nullable=True),
        sa.Column('numero_documento', sa.String(length=50), nullable=True),
        sa.Column('observacoes', sa.String(length=500), nullable=True),
        sa.Column('lancamento_id', sa.Integer(), nullable=True),
        sa.Column('usuario_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
        sa.ForeignKeyConstraint(['lancamento_id'], ['lancamentos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_contas_receber_id'), 'contas_receber', ['id'], unique=False)
    op.create_index(op.f('ix_contas_receber_data_vencimento'), 'contas_receber', ['data_vencimento'], unique=False)
    op.create_index(op.f('ix_contas_receber_status'), 'contas_receber', ['status'], unique=False)
    op.create_index(op.f('ix_contas_receber_categoria'), 'contas_receber', ['categoria'], unique=False)
    op.create_index(op.f('ix_contas_receber_numero_documento'), 'contas_receber', ['numero_documento'], unique=False)


def downgrade() -> None:
    # Remover tabelas na ordem inversa
    op.drop_index(op.f('ix_contas_receber_numero_documento'), table_name='contas_receber')
    op.drop_index(op.f('ix_contas_receber_categoria'), table_name='contas_receber')
    op.drop_index(op.f('ix_contas_receber_status'), table_name='contas_receber')
    op.drop_index(op.f('ix_contas_receber_data_vencimento'), table_name='contas_receber')
    op.drop_index(op.f('ix_contas_receber_id'), table_name='contas_receber')
    op.drop_table('contas_receber')

    op.drop_index(op.f('ix_contas_pagar_categoria'), table_name='contas_pagar')
    op.drop_index(op.f('ix_contas_pagar_status'), table_name='contas_pagar')
    op.drop_index(op.f('ix_contas_pagar_data_vencimento'), table_name='contas_pagar')
    op.drop_index(op.f('ix_contas_pagar_id'), table_name='contas_pagar')
    op.drop_table('contas_pagar')
