from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_user, get_current_admin_user
from app.models.database import get_db
from app.models.models import Company, User
from app.schemas.schemas import CompanyCreate, CompanyUpdate, Company as CompanySchema

router = APIRouter()

@router.post("/", response_model=CompanySchema)
async def create_company(
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new company (admin only)"""
    # Check if company with same name already exists
    existing_company = db.query(Company).filter(Company.name == company_data.name).first()
    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists"
        )
    
    db_company = Company(**company_data.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/", response_model=list[CompanySchema])
async def get_companies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all companies"""
    companies = db.query(Company).all()
    return companies

@router.get("/{company_id}", response_model=CompanySchema)
async def get_company(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company by ID"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return company

@router.put("/{company_id}", response_model=CompanySchema)
async def update_company(
    company_id: str,
    company_update: CompanyUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update company (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if new name conflicts with existing company
    if company_update.name and company_update.name != company.name:
        existing_company = db.query(Company).filter(Company.name == company_update.name).first()
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this name already exists"
            )
    
    update_data = company_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    return company

@router.delete("/{company_id}")
async def delete_company(
    company_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete company (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if company has users or jobs
    users_count = db.query(User).filter(User.company_id == company_id).count()
    if users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete company with associated users. Please reassign users first."
        )
    
    db.delete(company)
    db.commit()
    return {"message": "Company deleted successfully"}

