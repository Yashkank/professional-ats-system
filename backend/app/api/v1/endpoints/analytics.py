"""
Analytics endpoints for historical data and insights
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.models.database import get_db
from app.models.models import User, JobDescription, Resume, MatchingResult
from app.schemas.schemas import HistoricalResultsResponse, DashboardStats, SkillAnalytics
from app.core.auth import get_current_user, get_current_admin_user

router = APIRouter()

@router.get("/historical-results", response_model=HistoricalResultsResponse)
async def get_historical_results(
    days: int = 30,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get historical matching results for the specified number of days
    """
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Build query based on user role
    if current_user.role == "admin":
        query = db.query(MatchingResult).filter(
            MatchingResult.created_at >= start_date,
            MatchingResult.created_at <= end_date
        )
    else:
        query = db.query(MatchingResult).filter(
            MatchingResult.user_id == current_user.id,
            MatchingResult.created_at >= start_date,
            MatchingResult.created_at <= end_date
        )
    
    # Get total count and average score
    total_results = query.count()
    if total_results > 0:
        average_score = query.with_entities(func.avg(MatchingResult.overall_score)).scalar()
    else:
        average_score = 0.0
    
    # Get recent trends (daily averages for the last 7 days)
    recent_trends = []
    for i in range(7):
        trend_date = end_date - timedelta(days=i)
        trend_start = trend_date.replace(hour=0, minute=0, second=0, microsecond=0)
        trend_end = trend_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        if current_user.role == "admin":
            daily_avg = db.query(func.avg(MatchingResult.overall_score)).filter(
                MatchingResult.created_at >= trend_start,
                MatchingResult.created_at <= trend_end
            ).scalar()
        else:
            daily_avg = db.query(func.avg(MatchingResult.overall_score)).filter(
                MatchingResult.user_id == current_user.id,
                MatchingResult.created_at >= trend_start,
                MatchingResult.created_at <= trend_end
            ).scalar()
        
        recent_trends.append({
            "date": trend_date.strftime("%Y-%m-%d"),
            "average_score": float(daily_avg) if daily_avg else 0.0
        })
    
    # Get results with pagination
    results = query.order_by(desc(MatchingResult.created_at)).offset(skip).limit(limit).all()
    
    return HistoricalResultsResponse(
        total_results=total_results,
        average_score=float(average_score) if average_score else 0.0,
        recent_trends=recent_trends,
        results=results
    )

@router.get("/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics
    """
    if current_user.role == "admin":
        # Admin sees all data
        total_jobs = db.query(JobDescription).count()
        total_resumes = db.query(Resume).count()
        total_matches = db.query(MatchingResult).count()
        
        if total_matches > 0:
            average_match_score = db.query(func.avg(MatchingResult.overall_score)).scalar()
        else:
            average_match_score = 0.0
        
        # Recent activity (last 10 matching results)
        recent_activity = db.query(MatchingResult).order_by(
            desc(MatchingResult.created_at)
        ).limit(10).all()
        
    else:
        # Regular users see only their data
        total_jobs = db.query(JobDescription).filter(
            JobDescription.user_id == current_user.id
        ).count()
        
        total_resumes = db.query(Resume).filter(
            Resume.user_id == current_user.id
        ).count()
        
        total_matches = db.query(MatchingResult).filter(
            MatchingResult.user_id == current_user.id
        ).count()
        
        if total_matches > 0:
            average_match_score = db.query(func.avg(MatchingResult.overall_score)).filter(
                MatchingResult.user_id == current_user.id
            ).scalar()
        else:
            average_match_score = 0.0
        
        # Recent activity (last 10 matching results for user)
        recent_activity = db.query(MatchingResult).filter(
            MatchingResult.user_id == current_user.id
        ).order_by(desc(MatchingResult.created_at)).limit(10).all()
    
    # Format recent activity
    formatted_activity = []
    for activity in recent_activity:
        # Get job and resume details
        job = db.query(JobDescription).filter(
            JobDescription.id == activity.job_description_id
        ).first()
        resume = db.query(Resume).filter(
            Resume.id == activity.resume_id
        ).first()
        
        formatted_activity.append({
            "id": str(activity.id),
            "job_title": job.title if job else "Unknown",
            "company": job.company if job else "Unknown",
            "candidate_name": resume.candidate_name if resume else "Unknown",
            "score": activity.overall_score,
            "created_at": activity.created_at.isoformat()
        })
    
    return DashboardStats(
        total_jobs=total_jobs,
        total_resumes=total_resumes,
        total_matches=total_matches,
        average_match_score=float(average_match_score) if average_match_score else 0.0,
        recent_activity=formatted_activity
    )

@router.get("/skill-analytics", response_model=SkillAnalytics)
async def get_skill_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get skill analytics and insights
    """
    # Get most common skills from job descriptions
    if current_user.role == "admin":
        # Admin sees all skills
        most_common_skills = db.query(
            func.jsonb_array_elements(JobDescription.skills_required).label('skill'),
            func.count().label('count')
        ).filter(
            JobDescription.skills_required.isnot(None)
        ).group_by('skill').order_by(desc('count')).limit(10).all()
    else:
        # Regular users see only their job skills
        most_common_skills = db.query(
            func.jsonb_array_elements(JobDescription.skills_required).label('skill'),
            func.count().label('count')
        ).filter(
            JobDescription.user_id == current_user.id,
            JobDescription.skills_required.isnot(None)
        ).group_by('skill').order_by(desc('count')).limit(10).all()
    
    # Get skill gaps analysis
    skill_gaps = []
    if current_user.role == "admin":
        # Analyze missing skills across all matches
        matches_with_gaps = db.query(MatchingResult).filter(
            MatchingResult.missing_skills.isnot(None)
        ).limit(20).all()
    else:
        # Analyze missing skills for user's matches
        matches_with_gaps = db.query(MatchingResult).filter(
            MatchingResult.user_id == current_user.id,
            MatchingResult.missing_skills.isnot(None)
        ).limit(20).all()
    
    for match in matches_with_gaps:
        if match.missing_skills:
            job = db.query(JobDescription).filter(
                JobDescription.id == match.job_description_id
            ).first()
            resume = db.query(Resume).filter(
                Resume.id == match.resume_id
            ).first()
            
            skill_gaps.append({
                "job_title": job.title if job else "Unknown",
                "company": job.company if job else "Unknown",
                "candidate_name": resume.candidate_name if resume else "Unknown",
                "missing_skills": match.missing_skills,
                "match_score": match.overall_score
            })
    
    # Get trending skills (skills that appear in recent job postings)
    trending_skills = []
    recent_date = datetime.utcnow() - timedelta(days=7)
    
    if current_user.role == "admin":
        recent_jobs = db.query(JobDescription).filter(
            JobDescription.created_at >= recent_date
        ).all()
    else:
        recent_jobs = db.query(JobDescription).filter(
            JobDescription.user_id == current_user.id,
            JobDescription.created_at >= recent_date
        ).all()
    
    skill_counts = {}
    for job in recent_jobs:
        if job.skills_required:
            for skill in job.skills_required:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
    
    # Sort by frequency and get top 10
    trending_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    trending_skills = [{"skill": skill, "count": count} for skill, count in trending_skills]
    
    return SkillAnalytics(
        most_common_skills=[{"skill": skill, "count": count} for skill, count in most_common_skills],
        skill_gaps=skill_gaps,
        trending_skills=trending_skills
    )

@router.get("/performance-metrics")
async def get_performance_metrics(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get performance metrics (admin only)
    """
    # Total users
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # User role distribution
    role_distribution = db.query(
        User.role,
        func.count().label('count')
    ).group_by(User.role).all()
    
    # Matching performance over time
    monthly_stats = db.query(
        func.date_trunc('month', MatchingResult.created_at).label('month'),
        func.count().label('total_matches'),
        func.avg(MatchingResult.overall_score).label('avg_score')
    ).group_by('month').order_by('month').limit(12).all()
    
    # Processing time statistics
    processing_stats = db.query(
        func.avg(MatchingResult.processing_time).label('avg_processing_time'),
        func.min(MatchingResult.processing_time).label('min_processing_time'),
        func.max(MatchingResult.processing_time).label('max_processing_time')
    ).filter(MatchingResult.processing_time.isnot(None)).first()
    
    return {
        "user_metrics": {
            "total_users": total_users,
            "active_users": active_users,
            "role_distribution": [{"role": role, "count": count} for role, count in role_distribution]
        },
        "monthly_stats": [
            {
                "month": month.strftime("%Y-%m"),
                "total_matches": total_matches,
                "avg_score": float(avg_score) if avg_score else 0.0
            }
            for month, total_matches, avg_score in monthly_stats
        ],
        "processing_stats": {
            "avg_processing_time": float(processing_stats.avg_processing_time) if processing_stats.avg_processing_time else 0.0,
            "min_processing_time": float(processing_stats.min_processing_time) if processing_stats.min_processing_time else 0.0,
            "max_processing_time": float(processing_stats.max_processing_time) if processing_stats.max_processing_time else 0.0
        }
    }
