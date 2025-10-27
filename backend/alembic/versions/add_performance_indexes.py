"""Add performance indexes

Revision ID: add_performance_indexes
Revises: 
Create Date: 2025-01-15 10:00:00.000000

This migration adds database indexes to critical columns for 10-100x faster queries.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add indexes to improve query performance"""
    
    # ============================================================
    # USERS TABLE INDEXES
    # ============================================================
    
    # Index for user email lookups (login, user search)
    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    
    # Index for role-based queries (filter by admin/recruiter/candidate)
    op.create_index('idx_users_role', 'users', ['role'])
    
    # Index for company association (multi-tenant queries)
    op.create_index('idx_users_company_id', 'users', ['company_id'])
    
    # Index for active user queries
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    
    # Index for user creation date (recent users, analytics)
    op.create_index('idx_users_created_at', 'users', ['created_at'])
    
    # Composite index for company + role queries
    op.create_index('idx_users_company_role', 'users', ['company_id', 'role'])
    
    
    # ============================================================
    # JOBS TABLE INDEXES
    # ============================================================
    
    # Index for job status (active/closed/draft filtering)
    op.create_index('idx_jobs_status', 'jobs', ['status'])
    
    # Index for job creation date (recent jobs, sorting)
    op.create_index('idx_jobs_created_at', 'jobs', ['created_at'])
    
    # Index for company association (recruiter's job listings)
    op.create_index('idx_jobs_company_id', 'jobs', ['company_id'])
    
    # Index for job location (location-based search)
    op.create_index('idx_jobs_location', 'jobs', ['location'])
    
    # Index for experience level (filtering)
    op.create_index('idx_jobs_experience_level', 'jobs', ['experience_level'])
    
    # Composite index for company + status (active jobs per company)
    op.create_index('idx_jobs_company_status', 'jobs', ['company_id', 'status'])
    
    # Composite index for status + created (recent active jobs)
    op.create_index('idx_jobs_status_created', 'jobs', ['status', 'created_at'])
    
    
    # ============================================================
    # APPLICATIONS TABLE INDEXES
    # ============================================================
    
    # Index for user's applications (candidate dashboard)
    op.create_index('idx_applications_user_id', 'applications', ['user_id'])
    
    # Index for job's applications (recruiter view)
    op.create_index('idx_applications_job_id', 'applications', ['job_id'])
    
    # Index for application status (filter by pending/accepted/rejected)
    op.create_index('idx_applications_status', 'applications', ['status'])
    
    # Index for creation date (recent applications)
    op.create_index('idx_applications_created_at', 'applications', ['created_at'])
    
    # Composite index for user + status (user's pending applications)
    op.create_index('idx_applications_user_status', 'applications', ['user_id', 'status'])
    
    # Composite index for job + status (job's pending applications)
    op.create_index('idx_applications_job_status', 'applications', ['job_id', 'status'])
    
    # Composite index for user + created (user's recent applications)
    op.create_index('idx_applications_user_created', 'applications', ['user_id', 'created_at'])
    
    # Composite index for status + created (recent pending applications)
    op.create_index('idx_applications_status_created', 'applications', ['status', 'created_at'])
    
    
    # ============================================================
    # COMPANIES TABLE INDEXES
    # ============================================================
    
    # Index for company name (search, sorting)
    op.create_index('idx_companies_name', 'companies', ['name'])
    
    # Index for subscription status (active companies)
    op.create_index('idx_companies_subscription_status', 'companies', ['subscription_status'])
    
    # Index for creation date (recent companies)
    op.create_index('idx_companies_created_at', 'companies', ['created_at'])
    
    
    # ============================================================
    # MATCHING_RESULTS TABLE INDEXES (AI Matching)
    # ============================================================
    
    # Index for job matching results
    op.create_index('idx_matching_job_id', 'matching_results', ['job_id'])
    
    # Index for candidate matching results
    op.create_index('idx_matching_candidate_id', 'matching_results', ['candidate_id'])
    
    # Index for match score (top matches)
    op.create_index('idx_matching_score', 'matching_results', ['match_score'])
    
    # Index for creation date (recent matches)
    op.create_index('idx_matching_created_at', 'matching_results', ['created_at'])
    
    # Composite index for job + score (best matches for a job)
    op.create_index('idx_matching_job_score', 'matching_results', ['job_id', 'match_score'])
    
    
    # ============================================================
    # SAVED_JOBS TABLE INDEXES
    # ============================================================
    
    # Index for candidate's saved jobs
    op.create_index('idx_saved_jobs_candidate_id', 'saved_jobs', ['candidate_id'])
    
    # Index for specific job (how many saved this job)
    op.create_index('idx_saved_jobs_job_id', 'saved_jobs', ['job_id'])
    
    # Index for creation date (recently saved)
    op.create_index('idx_saved_jobs_created_at', 'saved_jobs', ['created_at'])
    
    # Composite index to prevent duplicate saves
    op.create_index('idx_saved_jobs_candidate_job', 'saved_jobs', ['candidate_id', 'job_id'], unique=True)
    
    
    # ============================================================
    # JOB_ALERTS TABLE INDEXES
    # ============================================================
    
    # Index for candidate's alerts
    op.create_index('idx_job_alerts_candidate_id', 'job_alerts', ['candidate_id'])
    
    # Index for active alerts
    op.create_index('idx_job_alerts_is_active', 'job_alerts', ['is_active'])
    
    # Index for alert frequency (daily/weekly alerts processing)
    op.create_index('idx_job_alerts_frequency', 'job_alerts', ['frequency'])
    
    # Composite index for active candidate alerts
    op.create_index('idx_job_alerts_candidate_active', 'job_alerts', ['candidate_id', 'is_active'])


def downgrade():
    """Remove all indexes"""
    
    # Users indexes
    op.drop_index('idx_users_email')
    op.drop_index('idx_users_role')
    op.drop_index('idx_users_company_id')
    op.drop_index('idx_users_is_active')
    op.drop_index('idx_users_created_at')
    op.drop_index('idx_users_company_role')
    
    # Jobs indexes
    op.drop_index('idx_jobs_status')
    op.drop_index('idx_jobs_created_at')
    op.drop_index('idx_jobs_company_id')
    op.drop_index('idx_jobs_location')
    op.drop_index('idx_jobs_experience_level')
    op.drop_index('idx_jobs_company_status')
    op.drop_index('idx_jobs_status_created')
    
    # Applications indexes
    op.drop_index('idx_applications_user_id')
    op.drop_index('idx_applications_job_id')
    op.drop_index('idx_applications_status')
    op.drop_index('idx_applications_created_at')
    op.drop_index('idx_applications_user_status')
    op.drop_index('idx_applications_job_status')
    op.drop_index('idx_applications_user_created')
    op.drop_index('idx_applications_status_created')
    
    # Companies indexes
    op.drop_index('idx_companies_name')
    op.drop_index('idx_companies_subscription_status')
    op.drop_index('idx_companies_created_at')
    
    # Matching results indexes
    op.drop_index('idx_matching_job_id')
    op.drop_index('idx_matching_candidate_id')
    op.drop_index('idx_matching_score')
    op.drop_index('idx_matching_created_at')
    op.drop_index('idx_matching_job_score')
    
    # Saved jobs indexes
    op.drop_index('idx_saved_jobs_candidate_id')
    op.drop_index('idx_saved_jobs_job_id')
    op.drop_index('idx_saved_jobs_created_at')
    op.drop_index('idx_saved_jobs_candidate_job')
    
    # Job alerts indexes
    op.drop_index('idx_job_alerts_candidate_id')
    op.drop_index('idx_job_alerts_is_active')
    op.drop_index('idx_job_alerts_frequency')
    op.drop_index('idx_job_alerts_candidate_active')

