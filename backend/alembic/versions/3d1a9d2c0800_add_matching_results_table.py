"""Add matching_results table

Revision ID: 3d1a9d2c0800
Revises: 
Create Date: 2025-09-12 11:06:05.500362

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '3d1a9d2c0800'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create matching_results table
    op.create_table('matching_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_description_text', sa.Text(), nullable=False),
        sa.Column('job_description_skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('total_resumes_processed', sa.Integer(), nullable=False),
        sa.Column('average_score', sa.Float(), nullable=True),
        sa.Column('highest_score', sa.Float(), nullable=True),
        sa.Column('lowest_score', sa.Float(), nullable=True),
        sa.Column('strong_matches_count', sa.Integer(), nullable=True),
        sa.Column('moderate_matches_count', sa.Integer(), nullable=True),
        sa.Column('weak_matches_count', sa.Integer(), nullable=True),
        sa.Column('results_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('similarity_threshold', sa.Float(), nullable=True),
        sa.Column('skills_weight', sa.Float(), nullable=True),
        sa.Column('model_used', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop matching_results table
    op.drop_table('matching_results')




























