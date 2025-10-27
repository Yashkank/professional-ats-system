"""
Resumes endpoints for CRUD operations and file uploads
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path

from app.models.database import get_db
from app.models.models import User, Resume
from app.schemas.schemas import ResumeCreate, ResumeResponse, ResumeUpdate
from app.core.auth import get_current_user
from app.core.config import settings

router = APIRouter()

def save_upload_file(upload_file: UploadFile, user_id: str) -> tuple[str, str]:
    """Save uploaded file and return file path and name"""
    # Create user-specific upload directory
    user_upload_dir = Path(settings.UPLOAD_DIR) / "resumes" / str(user_id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(upload_file.filename).suffix
    unique_filename = f"{user_id}_{upload_file.filename}"
    file_path = user_upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return str(file_path), unique_filename

@router.post("/", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume_data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new resume
    """
    db_resume = Resume(
        **resume_data.dict(),
        user_id=current_user.id
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    candidate_name: str,
    candidate_email: str = None,
    candidate_phone: str = None,
    summary: str = None,
    experience_years: float = None,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload resume with PDF file
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
    
    # Create resume
    db_resume = Resume(
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        candidate_phone=candidate_phone,
        summary=summary,
        experience_years=experience_years,
        user_id=current_user.id,
        file_path=file_path,
        file_name=file_name,
        file_size=file.size
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@router.get("/", response_model=List[ResumeResponse])
async def get_resumes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get resumes (users see their own, admins see all)
    """
    if current_user.role == "admin":
        resumes = db.query(Resume).offset(skip).limit(limit).all()
    else:
        resumes = db.query(Resume).filter(
            Resume.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return resumes

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get resume by ID
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this resume"
        )
    
    return resume

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    resume_update: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update resume
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this resume"
        )
    
    # Update resume fields
    update_data = resume_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)
    
    db.commit()
    db.refresh(resume)
    
    return resume

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete resume
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this resume"
        )
    
    # Delete associated file if it exists
    if resume.file_path and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass  # Continue even if file deletion fails
    
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}

@router.get("/candidate/{candidate_name}", response_model=List[ResumeResponse])
async def get_resumes_by_candidate(
    candidate_name: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get resumes by candidate name
    """
    if current_user.role == "admin":
        resumes = db.query(Resume).filter(
            Resume.candidate_name.ilike(f"%{candidate_name}%")
        ).offset(skip).limit(limit).all()
    else:
        resumes = db.query(Resume).filter(
            Resume.candidate_name.ilike(f"%{candidate_name}%"),
            Resume.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return resumes

@router.get("/experience/{min_years}", response_model=List[ResumeResponse])
async def get_resumes_by_experience(
    min_years: float,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get resumes with minimum experience years
    """
    if current_user.role == "admin":
        resumes = db.query(Resume).filter(
            Resume.experience_years >= min_years
        ).offset(skip).limit(limit).all()
    else:
        resumes = db.query(Resume).filter(
            Resume.experience_years >= min_years,
            Resume.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return resumes
