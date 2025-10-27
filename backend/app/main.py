"""
Main FastAPI application for the Professional ATS system
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.config import settings
from app.middleware.security import SecurityHeadersMiddleware
try:
    from app.core.rate_limiter import limiter, rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
except ImportError:
    from app.core.rate_limiter_simple import get_rate_limiter, rate_limit_exceeded_handler
    limiter = get_rate_limiter()
    class RateLimitExceeded(Exception):
        pass

app = FastAPI(
    title="Professional ATS API",
    description="""
## 🚀 Enterprise-Grade Applicant Tracking System API

### Overview
This API provides comprehensive endpoints for a full-featured ATS system with AI-powered resume matching.

### Key Features
* **🔐 Authentication** - JWT-based authentication with refresh tokens
* **👥 User Management** - Role-based access control (Admin, Recruiter, Candidate)
* **💼 Job Management** - Create, update, search, and manage job postings
* **📝 Application Tracking** - Complete candidate application lifecycle
* **🤖 AI Matching** - ML-powered resume-to-job matching using NLP
* **📊 Analytics** - Real-time metrics, reports, and dashboards
* **🏢 Multi-tenant** - Company-based data isolation
* **🔔 Notifications** - Real-time alerts and job recommendations
* **🔒 Security** - Enterprise-grade security with rate limiting

### Authentication
Most endpoints require authentication. Include your JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

To obtain a token, use the `/api/v1/auth/login` endpoint.

### Rate Limiting
- Login attempts: 5 per minute
- Token refresh: 10 per minute
- Other endpoints: Standard rate limiting applies

### Error Responses
All error responses follow this format:
```json
{
  "detail": "Error message here"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Support
For issues or questions, contact: support@yourcompany.com

### Version History
- **v1.0.0** (2025-01) - Initial release with full ATS features
    """,
    version="1.0.0",
    terms_of_service="https://yourcompany.com/terms",
    contact={
        "name": "ATS Support Team",
        "url": "https://yourcompany.com/support",
        "email": "support@yourcompany.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_tags=[
        {
            "name": "authentication",
            "description": "Authentication endpoints - login, signup, logout, token refresh",
        },
        {
            "name": "users",
            "description": "User management - CRUD operations, profile management",
        },
        {
            "name": "jobs",
            "description": "Job posting management - create, update, search jobs",
        },
        {
            "name": "applications",
            "description": "Application tracking - submit, review, update applications",
        },
        {
            "name": "ai-matching",
            "description": "AI-powered resume matching - upload resumes, get job recommendations",
        },
        {
            "name": "companies",
            "description": "Company management - multi-tenant organization features",
        },
        {
            "name": "candidate-features",
            "description": "Candidate-specific features - job alerts, saved jobs, recommendations",
        },
        {
            "name": "admin-analytics",
            "description": "Admin analytics - system metrics, reports, dashboards (admin only)",
        },
    ],
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Security headers middleware (MUST be first for all responses)
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware (order matters - after security headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "ATS API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
