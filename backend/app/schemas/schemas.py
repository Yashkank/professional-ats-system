"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# Company schemas
class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None

class Company(CompanyBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: str
    company_id: Optional[UUID] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[UUID] = None

class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    company: Optional[Company] = None

    class Config:
        from_attributes = True

# Job schemas
class JobBase(BaseModel):
    title: str
    location: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    experience_level: Optional[str] = None
    salary_range: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    experience_level: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None

class Job(JobBase):
    id: UUID
    user_id: UUID
    company_id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    company: Optional[Company] = None
    company_name: Optional[str] = None  # Computed property for backward compatibility

    class Config:
        from_attributes = True

# Application schemas
class ApplicationBase(BaseModel):
    candidate_name: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

class ApplicationCreate(BaseModel):
    job_id: UUID
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

class ApplicationUpdate(BaseModel):
    candidate_name: Optional[str] = None
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    status: Optional[str] = None

class Application(ApplicationBase):
    id: UUID
    user_id: UUID
    job_id: UUID
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None

    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None
    session_id: Optional[str] = None

class SessionInfo(BaseModel):
    session_id: str
    created_at: Dict[str, str]
    last_activity: Dict[str, str]
    client_info: Dict[str, str]
    is_current: bool = False

class Login(BaseModel):
    email: EmailStr
    password: str

# Response schemas
class Message(BaseModel):
    message: str

class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int

# AI Matching schemas
class MatchingRequest(BaseModel):
    job_description_text: Optional[str] = None
    similarity_threshold: float = 0.7
    skills_weight: float = 0.6
    save_results: bool = True

class JobDescriptionInfo(BaseModel):
    text: str
    skills: List[str]
    skills_count: int
    text_length: int

class MatchingSummary(BaseModel):
    total_resumes: int
    average_score: float
    highest_score: float
    lowest_score: float
    strong_matches: int
    moderate_matches: int
    weak_matches: int
    average_skills_found: float
    average_skills_matched: float
    job_skills_count: int

class MatchingResultItem(BaseModel):
    rank: int
    filename: str
    candidate_name: str
    email: str
    phone: str
    text_similarity: float
    skills_similarity: float
    final_score: float
    match_status: str
    skills_found: int
    skills_matched: int
    matched_skills: List[str]
    missing_skills: List[str]
    additional_skills: List[str]
    method_used: str

class ProcessingInfo(BaseModel):
    total_resumes_uploaded: int
    valid_resumes_processed: int
    similarity_threshold: float
    skills_weight: float
    model_used: str
    processed_at: str

class MatchingResultResponse(BaseModel):
    matching_result_id: Optional[str] = None
    job_description: JobDescriptionInfo
    summary: MatchingSummary
    results: List[MatchingResultItem]
    processing_info: ProcessingInfo

# Job-based matching schemas
class JobBasedMatchingRequest(BaseModel):
    similarity_threshold: float = 0.7
    skills_weight: float = 0.6
    save_results: bool = True

class CandidateMatchingResult(BaseModel):
    candidate_id: UUID
    candidate_name: str
    candidate_email: str
    application_id: UUID
    resume_url: str
    text_similarity: float
    skills_similarity: float
    final_score: float
    match_status: str  # "Strong", "Moderate", "Weak"
    skills_found: int
    skills_matched: int
    matched_skills: List[str]
    missing_skills: List[str]
    additional_skills: List[str]
    rank: int

class JobBasedMatchingSummary(BaseModel):
    job_id: UUID
    job_title: str
    company: str
    total_applications: int
    total_candidates: int
    average_score: float
    highest_score: float
    lowest_score: float
    strong_matches: int
    moderate_matches: int
    weak_matches: int
    average_skills_found: float
    average_skills_matched: float
    job_skills_count: int

class JobBasedMatchingResponse(BaseModel):
    matching_result_id: Optional[str] = None
    job_info: JobBasedMatchingSummary
    candidates: List[CandidateMatchingResult]
    processing_info: ProcessingInfo

# Candidate Features Schemas
class JobRecommendation(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str
    salary: str
    posted: str
    match_score: float
    skills: List[str]
    missing_skills: List[str]
    description: str
    requirements: str
    benefits: List[str]
    urgency: str

class SavedJobCreate(BaseModel):
    job_id: str

class SavedJobResponse(BaseModel):
    id: str
    job_id: str
    title: str
    company: str
    location: str
    type: str
    salary: str
    saved_at: datetime
    match_score: float
    status: str

class JobAlertCreate(BaseModel):
    name: str
    keywords: str
    location: Optional[str] = None
    job_type: str = "full-time"
    experience_level: str = "any"
    salary_range: Optional[str] = None
    frequency: str = "daily"

class JobAlertResponse(BaseModel):
    id: str
    name: str
    keywords: str
    location: str
    job_type: str
    experience_level: str
    salary_range: Optional[str] = None
    frequency: str
    is_active: bool
    last_sent: Optional[datetime] = None
    matches_found: int
    created_at: datetime

class ProfileAnalysis(BaseModel):
    total_score: int
    max_score: int
    percentage: int
    basic_info_score: int
    resume_score: int
    skills_score: int
    experience_score: int
    education_score: int
    certifications_score: int
    recommendations: List[str]
