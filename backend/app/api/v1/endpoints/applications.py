from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.auth import get_current_user, get_current_recruiter_user
from app.models.database import get_db
from app.models.models import User, Job, Application
from app.schemas.schemas import ApplicationCreate, ApplicationUpdate, Application as ApplicationSchema

router = APIRouter()

@router.post("/", response_model=ApplicationSchema)
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new application"""
    # Check if job exists
    job = db.query(Job).filter(Job.id == application_data.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if job is active
    if job.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot apply to inactive job"
        )
    
    # Check if user already applied to this job
    existing_application = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == application_data.job_id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Create application
    db_application = Application(
        **application_data.dict(),
        user_id=current_user.id,
        candidate_name=current_user.full_name
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.get("/", response_model=list[ApplicationSchema])
async def get_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get applications based on user role"""
    if current_user.role == "candidate":
        # Candidates see their own applications
        applications = db.query(Application).options(
            joinedload(Application.job).joinedload(Job.company)
        ).filter(Application.user_id == current_user.id).all()
    elif current_user.role in ["recruiter", "admin"]:
        # Recruiters see applications for jobs from their company, admins see all
        if current_user.role == "recruiter" and current_user.company_id:
            applications = db.query(Application).options(
                joinedload(Application.job).joinedload(Job.company)
            ).join(Job).filter(Job.company_id == current_user.company_id).all()
        else:
            applications = db.query(Application).options(
                joinedload(Application.job).joinedload(Job.company)
            ).all()
    else:
        applications = []
    
    return applications

@router.get("/{application_id}", response_model=ApplicationSchema)
async def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application by ID"""
    application = db.query(Application).options(
        joinedload(Application.job).joinedload(Job.company)
    ).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.role == "candidate" and application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this application"
        )
    
    if current_user.role == "recruiter":
        if not current_user.company_id or application.job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view this application"
            )
    
    return application

@router.put("/{application_id}", response_model=ApplicationSchema)
async def update_application(
    application_id: str,
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application"""
    application = db.query(Application).options(
        joinedload(Application.job).joinedload(Job.company)
    ).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.role == "candidate" and application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this application"
        )
    
    if current_user.role == "recruiter":
        if not current_user.company_id or application.job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update this application"
            )
    
    update_data = application_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    db.commit()
    db.refresh(application)
    return application

@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete application"""
    application = db.query(Application).options(
        joinedload(Application.job).joinedload(Job.company)
    ).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.role == "candidate" and application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this application"
        )
    
    if current_user.role == "recruiter":
        if not current_user.company_id or application.job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete this application"
            )
    
    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}

@router.get("/job/{job_id}", response_model=list[ApplicationSchema])
async def get_applications_for_job(
    job_id: str,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """Get all applications for a specific job (recruiter/admin only)"""
    # Check if job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check permissions: admin can view all, recruiter can only view jobs from their company
    if current_user.role == "admin":
        # Admin can view applications for any job
        pass
    elif current_user.role == "recruiter":
        if not current_user.company_id or job.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view applications for this job"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view applications for this job"
        )
    
    applications = db.query(Application).options(
        joinedload(Application.job).joinedload(Job.company)
    ).filter(Application.job_id == job_id).all()
    return applications





















