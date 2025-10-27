"""
Main API router that includes all endpoint routers
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, jobs, applications, matching, companies, candidate_features, admin_analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(matching.router, prefix="/ai", tags=["ai-matching"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(candidate_features.router, prefix="/candidate", tags=["candidate-features"])
api_router.include_router(admin_analytics.router, prefix="/admin/analytics", tags=["admin-analytics"])
