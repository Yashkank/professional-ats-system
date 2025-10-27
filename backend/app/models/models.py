"""
Database models for the ATS application
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    website = Column(String(500))
    industry = Column(String(100))
    size = Column(String(50))  # e.g., "1-10", "11-50", "51-200", etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="company")
    jobs = relationship("Job", back_populates="company")

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="candidate")
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)  # Nullable for candidates
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="users")
    jobs = relationship("Job", back_populates="user")
    applications = relationship("Application", back_populates="user")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    title = Column(String(255), nullable=False)
    location = Column(String(255))
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    experience_level = Column(String(100))
    salary_range = Column(String(100))
    status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="jobs")
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
    
    # Computed property for backward compatibility
    @property
    def company_name(self):
        return self.company.name if self.company else None

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    candidate_name = Column(String(255), nullable=False)
    cover_letter = Column(Text)
    resume_url = Column(String(500))
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    
    # Computed properties for easier access
    @property
    def job_title(self):
        return self.job.title if self.job else None
    
    @property
    def company_name(self):
        return self.job.company_name if self.job else None

class MatchingResult(Base):
    __tablename__ = "matching_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_description_text = Column(Text, nullable=False)
    job_description_skills = Column(JSON)  # Store extracted skills as JSON
    total_resumes_processed = Column(Integer, nullable=False)
    average_score = Column(Float)
    highest_score = Column(Float)
    lowest_score = Column(Float)
    strong_matches_count = Column(Integer, default=0)
    moderate_matches_count = Column(Integer, default=0)
    weak_matches_count = Column(Integer, default=0)
    results_data = Column(JSON)  # Store full results as JSON
    similarity_threshold = Column(Float, default=0.7)
    skills_weight = Column(Float, default=0.6)
    model_used = Column(String(100), default="all-MiniLM-L6-v2")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    # Computed properties
    @property
    def user_name(self):
        return self.user.full_name if self.user else None
    
    @property
    def user_email(self):
        return self.user.email if self.user else None

class SavedJob(Base):
    __tablename__ = "saved_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    match_score = Column(Float, default=0.0)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    candidate = relationship("User", foreign_keys=[candidate_id])
    job = relationship("Job")

class JobAlert(Base):
    __tablename__ = "job_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    keywords = Column(Text, nullable=False)
    location = Column(String(255))
    job_type = Column(String(50), default="full-time")
    experience_level = Column(String(50), default="any")
    salary_range = Column(String(100))
    frequency = Column(String(20), default="daily")  # daily, weekly, monthly
    is_active = Column(Boolean, default=True)
    last_sent = Column(DateTime(timezone=True))
    matches_found = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    candidate = relationship("User", foreign_keys=[candidate_id])
