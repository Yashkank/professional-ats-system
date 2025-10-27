"""
Candidate-specific features API endpoints
Includes job recommendations, saved jobs, job alerts, and profile analysis
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.core.auth import get_current_user
from app.models.database import get_db
from app.models.models import User, Job, Application, SavedJob, JobAlert
from app.schemas.schemas import (
    JobRecommendation, SavedJobCreate, SavedJobResponse, 
    JobAlertCreate, JobAlertResponse, ProfileAnalysis
)

router = APIRouter()

@router.get("/recommendations", response_model=List[JobRecommendation])
async def get_job_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered job recommendations for the candidate
    """
    try:
        # Get candidate's applied jobs to understand preferences
        applied_jobs = db.query(Application).filter(
            Application.user_id == current_user.id
        ).all()
        
        applied_job_ids = [app.job_id for app in applied_jobs]
        
        # Get candidate's skills from profile (mock for now)
        candidate_skills = [
            "Python", "JavaScript", "React", "Node.js", "SQL", 
            "AWS", "Docker", "Git", "HTML", "CSS"
        ]
        
        # Find jobs that match candidate's skills and haven't been applied to
        available_jobs = db.query(Job).filter(
            Job.status == "active",
            Job.id.notin_(applied_job_ids)
        ).limit(10).all()
        
        recommendations = []
        for job in available_jobs:
            # Extract skills from job description and requirements
            job_text = f"{job.description or ''} {job.requirements or ''}".lower()
            job_skills = []
            for skill in candidate_skills:
                if skill.lower() in job_text:
                    job_skills.append(skill)
            
            # Calculate match score based on skills found in job description
            skills_match = len(set(candidate_skills) & set(job_skills))
            total_skills = len(job_skills) if job_skills else 1
            match_score = min(95, 60 + (skills_match / max(total_skills, 1)) * 35)
            
            # Determine missing skills (skills in job but not in candidate)
            missing_skills = list(set(job_skills) - set(candidate_skills))[:3]  # Limit to 3
            matched_skills = list(set(candidate_skills) & set(job_skills))
            
            recommendation = JobRecommendation(
                id=str(job.id),
                title=job.title,
                company=job.company.name if job.company else "Unknown Company",
                location=job.location or "Location not specified",
                type=job.experience_level or "Full-time",
                salary=job.salary_range or "Salary not specified",
                posted=job.created_at.strftime("%Y-%m-%d"),
                match_score=round(match_score, 1),
                skills=matched_skills,
                missing_skills=missing_skills,
                description=job.description or "No description available",
                requirements=job.requirements or "No requirements specified",
                benefits=["Health Insurance", "401k", "Remote Work", "Learning Budget"],
                urgency="high" if match_score > 85 else "medium"
            )
            recommendations.append(recommendation)
        
        # Sort by match score
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        
        return recommendations[:5]  # Return top 5 recommendations
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating job recommendations: {str(e)}"
        )

@router.get("/saved-jobs", response_model=List[SavedJobResponse])
async def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get candidate's saved jobs
    """
    try:
        saved_jobs = db.query(SavedJob).filter(
            SavedJob.candidate_id == current_user.id
        ).all()
        
        result = []
        for saved_job in saved_jobs:
            job = db.query(Job).filter(Job.id == saved_job.job_id).first()
            if job:
                result.append(SavedJobResponse(
                    id=str(saved_job.id),
                    job_id=str(job.id),
                    title=job.title,
                    company=job.company.name if job.company else "Unknown Company",
                    location=job.location or "Location not specified",
                    type=job.experience_level or "Full-time",
                    salary=job.salary_range or "Salary not specified",
                    saved_at=saved_job.saved_at,
                    match_score=saved_job.match_score or 0,
                    status="active" if job.status == "active" else "expired"
                ))
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving saved jobs: {str(e)}"
        )

@router.post("/saved-jobs", response_model=SavedJobResponse)
async def save_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a job for the candidate
    """
    try:
        # Check if job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if already saved
        existing = db.query(SavedJob).filter(
            SavedJob.candidate_id == current_user.id,
            SavedJob.job_id == job_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job already saved"
            )
        
        # Calculate match score (mock for now)
        match_score = 85.0  # In real implementation, use AI matching
        
        # Create saved job
        saved_job = SavedJob(
            candidate_id=current_user.id,
            job_id=job_id,
            match_score=match_score,
            saved_at=datetime.utcnow()
        )
        
        db.add(saved_job)
        db.commit()
        db.refresh(saved_job)
        
        return SavedJobResponse(
            id=str(saved_job.id),
            job_id=str(job.id),
            title=job.title,
            company=job.company.name if job.company else "Unknown Company",
            location=job.location or "Location not specified",
            type=job.experience_level or "Full-time",
            salary=job.salary_range or "Salary not specified",
            saved_at=saved_job.saved_at,
            match_score=match_score,
            status="active"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving job: {str(e)}"
        )

@router.delete("/saved-jobs/{job_id}")
async def unsave_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a saved job
    """
    try:
        saved_job = db.query(SavedJob).filter(
            SavedJob.candidate_id == current_user.id,
            SavedJob.job_id == job_id
        ).first()
        
        if not saved_job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Saved job not found"
            )
        
        db.delete(saved_job)
        db.commit()
        
        return {"message": "Job removed from saved jobs"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing saved job: {str(e)}"
        )

@router.get("/job-alerts", response_model=List[JobAlertResponse])
async def get_job_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get candidate's job alerts
    """
    try:
        alerts = db.query(JobAlert).filter(
            JobAlert.candidate_id == current_user.id
        ).all()
        
        result = []
        for alert in alerts:
            result.append(JobAlertResponse(
                id=str(alert.id),
                name=alert.name,
                keywords=alert.keywords,
                location=alert.location,
                job_type=alert.job_type,
                experience_level=alert.experience_level,
                salary_range=alert.salary_range,
                frequency=alert.frequency,
                is_active=alert.is_active,
                last_sent=alert.last_sent,
                matches_found=alert.matches_found or 0,
                created_at=alert.created_at
            ))
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving job alerts: {str(e)}"
        )

@router.post("/job-alerts", response_model=JobAlertResponse)
async def create_job_alert(
    alert_data: JobAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new job alert
    """
    try:
        alert = JobAlert(
            candidate_id=current_user.id,
            name=alert_data.name,
            keywords=alert_data.keywords,
            location=alert_data.location,
            job_type=alert_data.job_type,
            experience_level=alert_data.experience_level,
            salary_range=alert_data.salary_range,
            frequency=alert_data.frequency,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        return JobAlertResponse(
            id=str(alert.id),
            name=alert.name,
            keywords=alert.keywords,
            location=alert.location,
            job_type=alert.job_type,
            experience_level=alert.experience_level,
            salary_range=alert.salary_range,
            frequency=alert.frequency,
            is_active=alert.is_active,
            last_sent=alert.last_sent,
            matches_found=0,
            created_at=alert.created_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating job alert: {str(e)}"
        )

@router.put("/job-alerts/{alert_id}/toggle")
async def toggle_job_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle job alert active status
    """
    try:
        alert = db.query(JobAlert).filter(
            JobAlert.id == alert_id,
            JobAlert.candidate_id == current_user.id
        ).first()
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job alert not found"
            )
        
        alert.is_active = not alert.is_active
        db.commit()
        
        return {"message": f"Job alert {'activated' if alert.is_active else 'deactivated'}"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error toggling job alert: {str(e)}"
        )

@router.delete("/job-alerts/{alert_id}")
async def delete_job_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a job alert
    """
    try:
        alert = db.query(JobAlert).filter(
            JobAlert.id == alert_id,
            JobAlert.candidate_id == current_user.id
        ).first()
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job alert not found"
            )
        
        db.delete(alert)
        db.commit()
        
        return {"message": "Job alert deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job alert: {str(e)}"
        )

@router.get("/profile-analysis", response_model=ProfileAnalysis)
async def get_profile_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get candidate's profile strength analysis
    """
    try:
        # Calculate profile completeness
        profile_data = {
            "name": current_user.full_name,
            "email": current_user.email,
            "phone": getattr(current_user, 'phone', None),
            "location": getattr(current_user, 'location', None),
            "resume_url": getattr(current_user, 'resume_url', None),
            "skills": getattr(current_user, 'skills', []),
            "experience": getattr(current_user, 'experience', []),
            "education": getattr(current_user, 'education', []),
            "certifications": getattr(current_user, 'certifications', [])
        }
        
        # Calculate scores
        basic_info_score = 0
        if profile_data["name"]: basic_info_score += 5
        if profile_data["email"]: basic_info_score += 5
        if profile_data["phone"]: basic_info_score += 5
        if profile_data["location"]: basic_info_score += 5
        
        resume_score = 25 if profile_data["resume_url"] else 0
        skills_score = min(len(profile_data["skills"]) * 2, 20)
        experience_score = 20 if profile_data["experience"] else 0
        education_score = 10 if profile_data["education"] else 0
        cert_score = 5 if profile_data["certifications"] else 0
        
        total_score = basic_info_score + resume_score + skills_score + experience_score + education_score + cert_score
        max_score = 100
        percentage = round((total_score / max_score) * 100)
        
        # Generate recommendations
        recommendations = []
        if basic_info_score < 20:
            recommendations.append("Complete your basic information")
        if resume_score == 0:
            recommendations.append("Upload your resume")
        if skills_score < 10:
            recommendations.append("Add more skills to your profile")
        if experience_score == 0:
            recommendations.append("Add your work experience")
        if education_score == 0:
            recommendations.append("Add your education details")
        if cert_score == 0:
            recommendations.append("Add your certifications")
        
        return ProfileAnalysis(
            total_score=total_score,
            max_score=max_score,
            percentage=percentage,
            basic_info_score=basic_info_score,
            resume_score=resume_score,
            skills_score=skills_score,
            experience_score=experience_score,
            education_score=education_score,
            certifications_score=cert_score,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing profile: {str(e)}"
        )
