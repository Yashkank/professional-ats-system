from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.auth import get_current_user, get_current_recruiter_user
from app.models.database import get_db
from app.models.models import User, Job, Company
from app.schemas.schemas import JobCreate, JobUpdate, Job as JobSchema

router = APIRouter()

@router.post("/", response_model=JobSchema)
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """Create a new job (recruiter/admin only)"""
    # Ensure recruiter has a company assigned
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiter must be assigned to a company to create jobs"
        )
    
    # Create job with recruiter's company
    job_dict = job_data.dict()
    job_dict['user_id'] = current_user.id
    job_dict['company_id'] = current_user.company_id
    
    db_job = Job(**job_dict)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Load company relationship for response
    db_job = db.query(Job).options(joinedload(Job.company)).filter(Job.id == db_job.id).first()
    return db_job

@router.get("/", response_model=list[JobSchema])
async def get_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get jobs - filtered by company for recruiters, all active jobs for candidates"""
    query = db.query(Job).options(joinedload(Job.company)).filter(Job.status == "active")
    
    # If user is a recruiter, only show jobs from their company
    if current_user.role == "recruiter" and current_user.company_id:
        query = query.filter(Job.company_id == current_user.company_id)
    
    jobs = query.all()
    return jobs

@router.get("/{job_id}", response_model=JobSchema)
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job by ID"""
    job = db.query(Job).options(joinedload(Job.company)).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # If user is a recruiter, ensure they can only access jobs from their company
    if current_user.role == "recruiter" and current_user.company_id:
        if job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this job"
            )
    
    return job

@router.put("/{job_id}", response_model=JobSchema)
async def update_job(
    job_id: str,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """Update job (recruiter/admin only)"""
    job = db.query(Job).options(joinedload(Job.company)).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions: admin can update any job, recruiter can only update jobs from their company
    if current_user.role == "admin":
        # Admin can update any job
        pass
    elif current_user.role == "recruiter":
        if not current_user.company_id or job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update this job"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this job"
        )
    
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """Delete job (recruiter/admin only)"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions: admin can delete any job, recruiter can only delete jobs from their company
    if current_user.role == "admin":
        # Admin can delete any job
        pass
    elif current_user.role == "recruiter":
        if not current_user.company_id or job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete this job"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this job"
        )
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.get("/my-jobs", response_model=list[JobSchema])
async def get_my_jobs(
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """Get jobs created by current user"""
    jobs = db.query(Job).options(joinedload(Job.company)).filter(Job.user_id == current_user.id).all()
    return jobs





















