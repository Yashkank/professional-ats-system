"""
AI Resume Matching endpoints for FastAPI
Handles both manual file uploads and automatic job-based matching
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import io
import os
import requests
from datetime import datetime
from uuid import UUID

from app.core.auth import get_current_recruiter_user
from app.models.database import get_db
from app.models.models import User, Job, Application, MatchingResult
from app.schemas.schemas import (
    MatchingResultResponse, MatchingRequest, JobBasedMatchingRequest, 
    JobBasedMatchingResponse, CandidateMatchingResult, JobBasedMatchingSummary,
    ProcessingInfo
)
from app.services.ai_matching import get_ai_matching_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Global AI matching service instance
_ai_matching_service = None

def get_ai_matching_service():
    """Get or create AI matching service instance"""
    global _ai_matching_service
    if _ai_matching_service is None:
        from app.services.ai_matching import AIMatchingService
        _ai_matching_service = AIMatchingService()
    return _ai_matching_service

@router.post("/match-resume", response_model=MatchingResultResponse)
async def match_resume(
    job_description_text: Optional[str] = Form(None),
    job_description_file: Optional[UploadFile] = File(None),
    resume_files: List[UploadFile] = File(...),
    similarity_threshold: float = Form(0.7),
    skills_weight: float = Form(0.6),
    save_results: bool = Form(True),
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """
    Manual resume matching with file uploads
    """
    try:
        # Validate inputs
        if not job_description_text and not job_description_file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either job description text or file must be provided"
            )
        
        if not resume_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one resume file must be provided"
            )
        
        # Get AI matching service
        ai_service = get_ai_matching_service()
        
        # Process job description
        jd_text = job_description_text
        jd_file_bytes = None
        
        if job_description_file:
            jd_file_bytes = await job_description_file.read()
        
        # Process resumes
        # Process resume files
        resume_files_bytes = []
        filenames = []
        for resume_file in resume_files:
            file_bytes = await resume_file.read()
            resume_files_bytes.append(file_bytes)
            filenames.append(resume_file.filename)
        
        # Process resume files using AI service
        resume_data = ai_service.process_resume_files(resume_files_bytes, filenames)
        
        # Process job description using AI service
        job_data = ai_service.process_job_description(jd_text=jd_text, jd_file=jd_file_bytes)
        
        # Run AI matching
        result = ai_service.match_resumes_to_job(
            job_data=job_data,
            resume_data=resume_data,
            similarity_threshold=similarity_threshold,
            skills_weight=skills_weight
        )
        
        # Save results to database if requested
        matching_result_id = None
        if save_results:
            matching_result = MatchingResult(
                user_id=current_user.id,
                job_description_text=result['job_description']['text'],
                job_description_skills=result['job_description']['skills'],
                total_resumes_processed=result['summary']['total_resumes'],
                average_score=result['summary']['average_score'],
                highest_score=result['summary']['highest_score'],
                lowest_score=result['summary']['lowest_score'],
                strong_matches_count=result['summary']['strong_matches'],
                moderate_matches_count=result['summary']['moderate_matches'],
                weak_matches_count=result['summary']['weak_matches'],
                results_data=result,
                similarity_threshold=similarity_threshold,
                skills_weight=skills_weight
            )
            db.add(matching_result)
            db.commit()
            db.refresh(matching_result)
            matching_result_id = str(matching_result.id)
        
        return MatchingResultResponse(
            matching_result_id=matching_result_id,
            **result
        )
        
    except Exception as e:
        logger.error(f"Error in manual resume matching: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume matching: {str(e)}"
        )

@router.post("/match-resumes/{job_id}", response_model=JobBasedMatchingResponse)
async def match_resumes_for_job(
    job_id: UUID = Path(..., description="Job ID to match resumes for"),
    request: JobBasedMatchingRequest = None,
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """
    Automatic resume matching for a specific job using existing applications
    """
    try:
        # Get job details
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Get applications for this job
        applications = db.query(Application).filter(
            Application.job_id == job_id,
            Application.resume_url.isnot(None)
        ).all()
        
        if not applications:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No applications with resumes found for this job"
            )
        
        # Get AI matching service
        ai_service = get_ai_matching_service()
        
        # Prepare job description text
        job_description_text = f"{job.title}\n\n{job.description}"
        if job.requirements:
            job_description_text += f"\n\nRequirements:\n{job.requirements}"
        
        # Process resumes from applications
        resume_files = []
        filenames = []
        application_map = {}  # Map filename to application for later reference
        
        for application in applications:
            try:
                # Download resume file
                if application.resume_url.startswith('http'):
                    response = requests.get(application.resume_url, timeout=30)
                    if response.status_code == 200:
                        file_content = response.content
                    else:
                        logger.warning(f"Failed to download resume for application {application.id}")
                        continue
                else:
                    # Local file path
                    if os.path.exists(application.resume_url):
                        with open(application.resume_url, 'rb') as f:
                            file_content = f.read()
                    else:
                        logger.warning(f"Resume file not found: {application.resume_url}")
                        continue
                
                filename = f"{application.candidate_name.replace(' ', '_').lower()}_resume.pdf"
                resume_files.append(file_content)
                filenames.append(filename)
                application_map[filename] = application
                
            except Exception as e:
                logger.warning(f"Error processing resume for application {application.id}: {e}")
                continue
        
        # Process resume files using AI service
        resume_data = ai_service.process_resume_files(resume_files, filenames)
        
        if not resume_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid resume files could be processed"
            )
        
        # Process job description using AI service
        job_data = ai_service.process_job_description(jd_text=job_description_text)
        
        # Run AI matching
        result = ai_service.match_resumes_to_job(
            job_data=job_data,
            resume_data=resume_data,
            similarity_threshold=request.similarity_threshold,
            skills_weight=request.skills_weight
        )
        
        # Convert results to candidate-based format
        candidates = []
        for i, resume_result in enumerate(result['results']):
            filename = resume_result['filename']
            application = application_map.get(filename)
            
            if application:
                candidate = CandidateMatchingResult(
                    candidate_id=application.user_id,
                    candidate_name=application.candidate_name,
                    candidate_email=application.user.email if application.user else "N/A",
                    application_id=application.id,
                    resume_url=application.resume_url,
                    text_similarity=resume_result['text_similarity'],
                    skills_similarity=resume_result['skills_similarity'],
                    final_score=resume_result['final_score'],
                    match_status=resume_result['match_status'],
                    skills_found=resume_result['skills_found'],
                    skills_matched=resume_result['skills_matched'],
                    matched_skills=resume_result['matched_skills'],
                    missing_skills=resume_result['missing_skills'],
                    additional_skills=resume_result['additional_skills'],
                    rank=resume_result['rank']
                )
                candidates.append(candidate)
        
        # Create job summary
        job_summary = JobBasedMatchingSummary(
            job_id=job.id,
            job_title=job.title,
            company=job.company_name if hasattr(job, 'company_name') else (job.company.name if job.company else 'Unknown Company'),
            total_applications=len(applications),
            total_candidates=len(candidates),
            average_score=result['summary']['average_score'],
            highest_score=result['summary']['highest_score'],
            lowest_score=result['summary']['lowest_score'],
            strong_matches=result['summary']['strong_matches'],
            moderate_matches=result['summary']['moderate_matches'],
            weak_matches=result['summary']['weak_matches'],
            average_skills_found=result['summary']['average_skills_found'],
            average_skills_matched=result['summary']['average_skills_matched'],
            job_skills_count=result['summary']['job_skills_count']
        )
        
        # Save results to database if requested
        matching_result_id = None
        if False:  # Temporarily disable saving to avoid UUID serialization issues
            matching_result = MatchingResult(
                user_id=str(current_user.id),
                job_description_text=job_description_text,
                job_description_skills=result['job_description']['skills'],
                total_resumes_processed=len(candidates),
                average_score=result['summary']['average_score'],
                highest_score=result['summary']['highest_score'],
                lowest_score=result['summary']['lowest_score'],
                strong_matches_count=result['summary']['strong_matches'],
                moderate_matches_count=result['summary']['moderate_matches'],
                weak_matches_count=result['summary']['weak_matches'],
                results_data={
                    'job_id': str(job_id),
                    'job_title': job.title,
                    'company': job.company_name if hasattr(job, 'company_name') else (job.company.name if job.company else 'Unknown Company'),
                    'candidates': [candidate.dict() for candidate in candidates],
                    'original_result': result
                },
                similarity_threshold=request.similarity_threshold,
                skills_weight=request.skills_weight
            )
            db.add(matching_result)
            db.commit()
            db.refresh(matching_result)
            matching_result_id = str(matching_result.id)
        
        return JobBasedMatchingResponse(
            matching_result_id=matching_result_id,
            job_info=job_summary,
            candidates=candidates,
            processing_info={
                'total_resumes_uploaded': len(applications),
                'valid_resumes_processed': len(candidates),
                'similarity_threshold': request.similarity_threshold,
                'skills_weight': request.skills_weight,
                'model_used': 'all-MiniLM-L6-v2',
                'processed_at': result['processed_at']
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in job-based resume matching: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing job-based resume matching: {str(e)}"
        )

@router.get("/jobs/available")
async def get_available_jobs_for_matching(
    current_user: User = Depends(get_current_recruiter_user),
    db: Session = Depends(get_db)
):
    """
    Get list of jobs that have applications with resumes for matching
    """
    try:
        # Get jobs that have applications with resumes
        jobs_with_applications = db.query(Job).join(Application).filter(
            Application.resume_url.isnot(None),
            Job.status == "active"
        ).distinct().all()
        
        job_list = []
        for job in jobs_with_applications:
            application_count = db.query(Application).filter(
                Application.job_id == job.id,
                Application.resume_url.isnot(None)
            ).count()
            
            job_list.append({
                "id": str(job.id),
                "title": job.title,
                "company": job.company_name if hasattr(job, 'company_name') else (job.company.name if job.company else 'Unknown Company'),
                "location": job.location,
                "application_count": application_count,
                "created_at": job.created_at.isoformat() if job.created_at else None
            })
        
        return {
            "jobs": job_list,
            "total": len(job_list)
        }
        
    except Exception as e:
        logger.error(f"Error getting available jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving available jobs: {str(e)}"
        )












