"""add notification preferences to users

Revision ID: cd499a761d65
Revises: bee5587faeab
Create Date: 2026-02-09 11:15:48.709557

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cd499a761d65'
down_revision: Union[str, Sequence[str], None] = 'bee5587faeab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add notification preference columns to users table
    op.add_column('users', sa.Column('email_notifications_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('reminder_hours_before', sa.Integer(), nullable=False, server_default='24'))
    op.add_column('users', sa.Column('reminder_time_preference', sa.String(), nullable=False, server_default='09:00'))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove notification preference columns from users table
    op.drop_column('users', 'reminder_time_preference')
    op.drop_column('users', 'reminder_hours_before')
    op.drop_column('users', 'email_notifications_enabled')
