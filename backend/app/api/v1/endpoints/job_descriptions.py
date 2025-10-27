"""
Job descriptions endpoints for CRUD operations and file uploads
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path

from app.models.database import get_db
from app.models.models import User, JobDescription
from app.schemas.schemas import JobDescriptionCreate, JobDescriptionResponse, JobDescriptionUpdate
from app.core.auth import get_current_user, get_current_recruiter_user
from app.core.config import settings

router = APIRouter()

def save_upload_file(upload_file: UploadFile, user_id: str) -> tuple[str, str]:
    """Save uploaded file and return file path and name"""
    # Create user-specific upload directory
    user_upload_dir = Path(settings.UPLOAD_DIR) / "job_descriptions" / str(user_id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(upload_file.filename).suffix
    unique_filename = f"{user_id}_{upload_file.filename}"
    file_path = user_upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return str(file_path), unique_filename

@router.post("/", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_job_description(
    job_data: JobDescriptionCreate,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """
    Create a new job description
    """
    db_job = JobDescription(
        **job_data.dict(),
        user_id=current_user.id
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    return db_job

@router.post("/upload", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
async def upload_job_description(
    title: str,
    company: str,
    location: str = None,
    requirements: str = None,
    experience_level: str = None,
    salary_range: str = None,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """
    Upload job description with PDF file
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Validate file size
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Save file
    file_path, file_name = save_upload_file(file, str(current_user.id))
    
    # Create job description
    db_job = JobDescription(
        title=title,
        company=company,
        location=location,
        requirements=requirements,
        experience_level=experience_level,
        salary_range=salary_range,
        description="",  # Will be extracted from PDF
        user_id=current_user.id,
        file_path=file_path,
        file_name=file_name,
        file_size=file.size
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    return db_job

@router.get("/", response_model=List[JobDescriptionResponse])
async def get_job_descriptions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get job descriptions (users see their own, admins see all)
    """
    if current_user.role == "admin":
        jobs = db.query(JobDescription).offset(skip).limit(limit).all()
    else:
        jobs = db.query(JobDescription).filter(
            JobDescription.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return jobs

@router.get("/{job_id}", response_model=JobDescriptionResponse)
async def get_job_description(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get job description by ID
    """
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this job description"
        )
    
    return job

@router.put("/{job_id}", response_model=JobDescriptionResponse)
async def update_job_description(
    job_id: str,
    job_update: JobDescriptionUpdate,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """
    Update job description
    """
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this job description"
        )
    
    # Update job fields
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    return job

@router.delete("/{job_id}")
async def delete_job_description(
    job_id: str,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """
    Delete job description
    """
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this job description"
        )
    
    # Delete associated file if it exists
    if job.file_path and os.path.exists(job.file_path):
        try:
            os.remove(job.file_path)
        except Exception:
            pass  # Continue even if file deletion fails
    
    db.delete(job)
    db.commit()
    
    return {"message": "Job description deleted successfully"}

@router.get("/company/{company_name}", response_model=List[JobDescriptionResponse])
async def get_jobs_by_company(
    company_name: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get job descriptions by company name
    """
    if current_user.role == "admin":
        jobs = db.query(JobDescription).filter(
            JobDescription.company.ilike(f"%{company_name}%")
        ).offset(skip).limit(limit).all()
    else:
        jobs = db.query(JobDescription).filter(
            JobDescription.company.ilike(f"%{company_name}%"),
            JobDescription.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return jobs
