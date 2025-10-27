"""
Admin Analytics endpoints - Real-time data from database
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, cast, Date, extract
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging

from app.models.database import get_db
from app.models.models import User, Job, Application, Company, MatchingResult
from app.core.auth import get_current_admin_user

router = APIRouter()
logger = logging.getLogger(__name__)


def get_date_range(time_range: str, custom_start: Optional[str] = None, custom_end: Optional[str] = None):
    """Calculate date range based on time_range parameter"""
    end_date = datetime.utcnow()
    
    if time_range == "7d":
        start_date = end_date - timedelta(days=7)
    elif time_range == "30d":
        start_date = end_date - timedelta(days=30)
    elif time_range == "90d":
        start_date = end_date - timedelta(days=90)
    elif time_range == "1y":
        start_date = end_date - timedelta(days=365)
    elif time_range == "custom" and custom_start and custom_end:
        start_date = datetime.fromisoformat(custom_start.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(custom_end.replace('Z', '+00:00'))
    else:
        # Default to 30 days
        start_date = end_date - timedelta(days=30)
    
    return start_date, end_date


@router.get("/overview")
async def get_overview_metrics(
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d, 1y, custom"),
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get overview metrics for admin dashboard"""
    try:
        start_date, end_date = get_date_range(time_range, custom_start, custom_end)
        
        # Total users (all time)
        total_users = db.query(func.count(User.id)).scalar() or 0
        
        # Active users (in time range)
        active_users = db.query(func.count(User.id)).filter(
            User.is_active == True
        ).scalar() or 0
        
        # New users in time range
        new_users = db.query(func.count(User.id)).filter(
            User.created_at >= start_date,
            User.created_at <= end_date
        ).scalar() or 0
        
        # Calculate growth rate
        prev_start = start_date - (end_date - start_date)
        prev_users = db.query(func.count(User.id)).filter(
            User.created_at >= prev_start,
            User.created_at < start_date
        ).scalar() or 0
        
        if prev_users > 0:
            growth_rate = ((new_users - prev_users) / prev_users) * 100
        else:
            growth_rate = 100.0 if new_users > 0 else 0.0
        
        # Total jobs
        total_jobs = db.query(func.count(Job.id)).scalar() or 0
        
        # Active jobs
        active_jobs = db.query(func.count(Job.id)).filter(
            Job.status == "active"
        ).scalar() or 0
        
        # New jobs in time range
        new_jobs = db.query(func.count(Job.id)).filter(
            Job.created_at >= start_date,
            Job.created_at <= end_date
        ).scalar() or 0
        
        # Total applications
        total_applications = db.query(func.count(Application.id)).scalar() or 0
        
        # Applications in time range
        period_applications = db.query(func.count(Application.id)).filter(
            Application.created_at >= start_date,
            Application.created_at <= end_date
        ).scalar() or 0
        
        # Application status breakdown
        pending_applications = db.query(func.count(Application.id)).filter(
            Application.status == "pending"
        ).scalar() or 0
        
        accepted_applications = db.query(func.count(Application.id)).filter(
            Application.status.in_(["accepted", "hired"])
        ).scalar() or 0
        
        rejected_applications = db.query(func.count(Application.id)).filter(
            Application.status == "rejected"
        ).scalar() or 0
        
        # Total companies
        total_companies = db.query(func.count(Company.id)).scalar() or 0
        
        # Average applications per job
        if active_jobs > 0:
            avg_applications_per_job = total_applications / active_jobs
        else:
            avg_applications_per_job = 0.0
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "new_users": new_users,
            "growth_rate": round(growth_rate, 2),
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "new_jobs": new_jobs,
            "total_applications": total_applications,
            "period_applications": period_applications,
            "pending_applications": pending_applications,
            "accepted_applications": accepted_applications,
            "rejected_applications": rejected_applications,
            "total_companies": total_companies,
            "avg_applications_per_job": round(avg_applications_per_job, 2),
            "time_range": time_range,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching overview metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching overview metrics: {str(e)}")


@router.get("/users")
async def get_user_metrics(
    time_range: str = Query("30d"),
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get user-specific metrics and charts"""
    try:
        start_date, end_date = get_date_range(time_range, custom_start, custom_end)
        
        # User growth over time (daily)
        days_diff = (end_date - start_date).days
        user_growth = []
        
        for i in range(min(days_diff, 90)):  # Limit to 90 days for performance
            day = start_date + timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            daily_count = db.query(func.count(User.id)).filter(
                User.created_at >= day_start,
                User.created_at <= day_end
            ).scalar() or 0
            
            user_growth.append({
                "date": day.strftime("%Y-%m-%d"),
                "count": daily_count
            })
        
        # User role distribution
        role_distribution = db.query(
            User.role,
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        role_data = [{"role": role, "count": count} for role, count in role_distribution]
        
        # User retention (active vs inactive)
        active_count = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
        inactive_count = db.query(func.count(User.id)).filter(User.is_active == False).scalar() or 0
        
        # Recent users
        recent_users = db.query(User).order_by(desc(User.created_at)).limit(10).all()
        recent_users_data = [{
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat()
        } for user in recent_users]
        
        return {
            "user_growth": user_growth,
            "role_distribution": role_data,
            "active_count": active_count,
            "inactive_count": inactive_count,
            "recent_users": recent_users_data
        }
    except Exception as e:
        logger.error(f"Error fetching user metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user metrics: {str(e)}")


@router.get("/jobs")
async def get_job_metrics(
    time_range: str = Query("30d"),
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get job-specific metrics and charts"""
    try:
        start_date, end_date = get_date_range(time_range, custom_start, custom_end)
        
        # Job postings over time
        days_diff = (end_date - start_date).days
        job_postings = []
        
        for i in range(min(days_diff, 90)):
            day = start_date + timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            daily_count = db.query(func.count(Job.id)).filter(
                Job.created_at >= day_start,
                Job.created_at <= day_end
            ).scalar() or 0
            
            job_postings.append({
                "date": day.strftime("%Y-%m-%d"),
                "count": daily_count
            })
        
        # Job status distribution
        status_distribution = db.query(
            Job.status,
            func.count(Job.id).label('count')
        ).group_by(Job.status).all()
        
        status_data = [{"status": status, "count": count} for status, count in status_distribution]
        
        # Jobs by experience level
        experience_distribution = db.query(
            Job.experience_level,
            func.count(Job.id).label('count')
        ).filter(
            Job.experience_level.isnot(None)
        ).group_by(Job.experience_level).all()
        
        experience_data = [{"level": level or "Not Specified", "count": count} for level, count in experience_distribution]
        
        # Top companies by job count
        top_companies = db.query(
            Company.name,
            func.count(Job.id).label('job_count')
        ).join(Job, Job.company_id == Company.id).group_by(
            Company.name
        ).order_by(desc('job_count')).limit(10).all()
        
        top_companies_data = [{"company": name, "job_count": count} for name, count in top_companies]
        
        # Applications per job stats
        jobs_with_apps = db.query(
            Job.id,
            Job.title,
            func.count(Application.id).label('app_count')
        ).outerjoin(
            Application, Application.job_id == Job.id
        ).group_by(Job.id, Job.title).order_by(desc('app_count')).limit(10).all()
        
        top_jobs = [{"job_title": title, "application_count": count} for _, title, count in jobs_with_apps]
        
        return {
            "job_postings": job_postings,
            "status_distribution": status_data,
            "experience_distribution": experience_data,
            "top_companies": top_companies_data,
            "top_jobs_by_applications": top_jobs
        }
    except Exception as e:
        logger.error(f"Error fetching job metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching job metrics: {str(e)}")


@router.get("/applications")
async def get_application_metrics(
    time_range: str = Query("30d"),
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get application-specific metrics and charts"""
    try:
        start_date, end_date = get_date_range(time_range, custom_start, custom_end)
        
        # Applications over time
        days_diff = (end_date - start_date).days
        application_trends = []
        
        for i in range(min(days_diff, 90)):
            day = start_date + timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            daily_count = db.query(func.count(Application.id)).filter(
                Application.created_at >= day_start,
                Application.created_at <= day_end
            ).scalar() or 0
            
            application_trends.append({
                "date": day.strftime("%Y-%m-%d"),
                "count": daily_count
            })
        
        # Application status distribution
        status_distribution = db.query(
            Application.status,
            func.count(Application.id).label('count')
        ).group_by(Application.status).all()
        
        status_data = [{"status": status, "count": count} for status, count in status_distribution]
        
        # Conversion rate (accepted/total)
        total_apps = db.query(func.count(Application.id)).scalar() or 0
        accepted_apps = db.query(func.count(Application.id)).filter(
            Application.status.in_(["accepted", "hired"])
        ).scalar() or 0
        
        conversion_rate = (accepted_apps / total_apps * 100) if total_apps > 0 else 0.0
        
        # Average time to process (using created_at and updated_at as proxy)
        # This is a simplified metric - in production you'd track status change timestamps
        recent_applications = db.query(Application).filter(
            Application.created_at >= start_date,
            Application.created_at <= end_date,
            Application.updated_at.isnot(None)
        ).all()
        
        processing_times = []
        for app in recent_applications:
            if app.updated_at and app.created_at:
                time_diff = (app.updated_at - app.created_at).total_seconds() / 3600  # hours
                processing_times.append(time_diff)
        
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0.0
        
        return {
            "application_trends": application_trends,
            "status_distribution": status_data,
            "conversion_rate": round(conversion_rate, 2),
            "avg_processing_time_hours": round(avg_processing_time, 2)
        }
    except Exception as e:
        logger.error(f"Error fetching application metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching application metrics: {str(e)}")


@router.get("/system")
async def get_system_metrics(
    time_range: str = Query("30d"),
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get system performance metrics"""
    try:
        start_date, end_date = get_date_range(time_range, custom_start, custom_end)
        
        # Database stats
        db_stats = {
            "total_records": {
                "users": db.query(func.count(User.id)).scalar() or 0,
                "jobs": db.query(func.count(Job.id)).scalar() or 0,
                "applications": db.query(func.count(Application.id)).scalar() or 0,
                "companies": db.query(func.count(Company.id)).scalar() or 0,
                "matching_results": db.query(func.count(MatchingResult.id)).scalar() or 0
            }
        }
        
        # Activity trends
        activity_by_hour = []
        for hour in range(24):
            count = db.query(func.count(Application.id)).filter(
                extract('hour', Application.created_at) == hour,
                Application.created_at >= start_date,
                Application.created_at <= end_date
            ).scalar() or 0
            
            activity_by_hour.append({
                "hour": hour,
                "count": count
            })
        
        # Most active users (by application count)
        active_users = db.query(
            User.full_name,
            User.email,
            User.role,
            func.count(Application.id).label('activity_count')
        ).join(
            Application, Application.user_id == User.id
        ).filter(
            Application.created_at >= start_date,
            Application.created_at <= end_date
        ).group_by(User.id, User.full_name, User.email, User.role).order_by(
            desc('activity_count')
        ).limit(10).all()
        
        active_users_data = [{
            "name": name,
            "email": email,
            "role": role,
            "activity_count": count
        } for name, email, role, count in active_users]
        
        return {
            "database_stats": db_stats,
            "activity_by_hour": activity_by_hour,
            "most_active_users": active_users_data
        }
    except Exception as e:
        logger.error(f"Error fetching system metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching system metrics: {str(e)}")


@router.get("/geographic")
async def get_geographic_metrics(
    time_range: str = Query("30d"),
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get geographic distribution metrics"""
    try:
        start_date, end_date = get_date_range(time_range, custom_start, custom_end)
        
        # Jobs by location
        jobs_by_location = db.query(
            Job.location,
            func.count(Job.id).label('job_count')
        ).filter(
            Job.location.isnot(None),
            Job.location != ''
        ).group_by(Job.location).order_by(desc('job_count')).limit(20).all()
        
        location_data = [{"location": loc or "Remote", "job_count": count} for loc, count in jobs_by_location]
        
        # Applications by job location
        applications_by_location = db.query(
            Job.location,
            func.count(Application.id).label('app_count')
        ).join(
            Application, Application.job_id == Job.id
        ).filter(
            Job.location.isnot(None),
            Application.created_at >= start_date,
            Application.created_at <= end_date
        ).group_by(Job.location).order_by(desc('app_count')).limit(20).all()
        
        app_location_data = [{"location": loc or "Remote", "application_count": count} for loc, count in applications_by_location]
        
        return {
            "jobs_by_location": location_data,
            "applications_by_location": app_location_data
        }
    except Exception as e:
        logger.error(f"Error fetching geographic metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching geographic metrics: {str(e)}")


@router.get("/performance")
async def get_performance_metrics(
    time_range: str = Query("30d"),
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get platform performance metrics"""
    try:
        start_date, end_date = get_date_range(time_range, custom_start, custom_end)
        
        # Average matching scores (if available)
        matching_stats = db.query(
            func.avg(MatchingResult.average_score).label('avg_score'),
            func.count(MatchingResult.id).label('total_matches')
        ).filter(
            MatchingResult.created_at >= start_date,
            MatchingResult.created_at <= end_date
        ).first()
        
        # Job fill rate (jobs with accepted applications / total jobs)
        jobs_with_hires = db.query(func.count(func.distinct(Application.job_id))).filter(
            Application.status.in_(["accepted", "hired"]),
            Application.created_at >= start_date,
            Application.created_at <= end_date
        ).scalar() or 0
        
        total_jobs_period = db.query(func.count(Job.id)).filter(
            Job.created_at >= start_date,
            Job.created_at <= end_date
        ).scalar() or 0
        
        fill_rate = (jobs_with_hires / total_jobs_period * 100) if total_jobs_period > 0 else 0.0
        
        # Time to hire (simplified - days from job post to first acceptance)
        hiring_times = []
        jobs_with_accepted = db.query(Job).join(
            Application, Application.job_id == Job.id
        ).filter(
            Application.status.in_(["accepted", "hired"]),
            Job.created_at >= start_date
        ).all()
        
        for job in jobs_with_accepted:
            first_acceptance = db.query(Application).filter(
                Application.job_id == job.id,
                Application.status.in_(["accepted", "hired"])
            ).order_by(Application.updated_at).first()
            
            if first_acceptance and first_acceptance.updated_at:
                days_diff = (first_acceptance.updated_at - job.created_at).days
                hiring_times.append(days_diff)
        
        avg_time_to_hire = sum(hiring_times) / len(hiring_times) if hiring_times else 0.0
        
        return {
            "avg_match_score": round(float(matching_stats.avg_score or 0), 2),
            "total_matches": matching_stats.total_matches or 0,
            "job_fill_rate": round(fill_rate, 2),
            "avg_time_to_hire_days": round(avg_time_to_hire, 1)
        }
    except Exception as e:
        logger.error(f"Error fetching performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching performance metrics: {str(e)}")

