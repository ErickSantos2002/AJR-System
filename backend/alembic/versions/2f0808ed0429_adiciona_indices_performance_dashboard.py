"""adiciona_indices_performance_dashboard

Revision ID: 2f0808ed0429
Revises: a041aeb76664
Create Date: 2025-12-30 20:02:37.636978

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2f0808ed0429'
down_revision = 'a041aeb76664'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Índices para Partidas (tabela mais consultada)
    op.create_index('idx_partida_conta_id', 'partidas', ['conta_id'])
    op.create_index('idx_partida_tipo', 'partidas', ['tipo'])
    op.create_index('idx_partida_lancamento_id', 'partidas', ['lancamento_id'])

    # Índice composto para queries comuns
    op.create_index('idx_partida_conta_tipo', 'partidas', ['conta_id', 'tipo'])

    # Índices para Lançamentos
    op.create_index('idx_lancamento_data', 'lancamentos', ['data_lancamento'])
    op.create_index('idx_lancamento_historico', 'lancamentos', ['historico_id'])

    # Índices para Plano de Contas
    op.create_index('idx_plano_codigo', 'plano_contas', ['codigo'])
    op.create_index('idx_plano_tipo', 'plano_contas', ['tipo'])
    op.create_index('idx_plano_aceita_lanc', 'plano_contas', ['aceita_lancamento'])

    # Índice composto para queries comuns em plano de contas
    op.create_index('idx_plano_tipo_aceita', 'plano_contas', ['tipo', 'aceita_lancamento'])

    # Índices para tabelas auxiliares (para contagens)
    op.create_index('idx_cliente_ativo', 'clientes', ['ativo'])
    op.create_index('idx_equipamento_ativo', 'equipamentos', ['ativo'])
    op.create_index('idx_motorista_ativo', 'motoristas', ['ativo'])


def downgrade() -> None:
    # Remove índices na ordem inversa
    op.drop_index('idx_motorista_ativo', 'motoristas')
    op.drop_index('idx_equipamento_ativo', 'equipamentos')
    op.drop_index('idx_cliente_ativo', 'clientes')

    op.drop_index('idx_plano_tipo_aceita', 'plano_contas')
    op.drop_index('idx_plano_aceita_lanc', 'plano_contas')
    op.drop_index('idx_plano_tipo', 'plano_contas')
    op.drop_index('idx_plano_codigo', 'plano_contas')

    op.drop_index('idx_lancamento_historico', 'lancamentos')
    op.drop_index('idx_lancamento_data', 'lancamentos')

    op.drop_index('idx_partida_conta_tipo', 'partidas')
    op.drop_index('idx_partida_lancamento_id', 'partidas')
    op.drop_index('idx_partida_tipo', 'partidas')
    op.drop_index('idx_partida_conta_id', 'partidas')
