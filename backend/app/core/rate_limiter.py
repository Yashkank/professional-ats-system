"""
Rate limiting utilities using slowapi
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from app.core.config import settings

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.LOGIN_RATE_LIMIT]
)

def get_rate_limiter():
    """Get rate limiter instance"""
    return limiter

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom rate limit exceeded handler"""
    return {
        "detail": f"Rate limit exceeded: {exc.detail}",
        "retry_after": exc.retry_after
    }
