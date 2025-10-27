"""
Simple rate limiter fallback for development without Redis
"""
from datetime import datetime, timedelta
from typing import Dict, Tuple
from fastapi import Request
from app.core.config import settings

class SimpleRateLimiter:
    """In-memory rate limiter fallback for development"""
    
    def __init__(self):
        self.requests: Dict[str, list] = {}
        print("⚠️ Using in-memory rate limiter fallback")
    
    def is_allowed(self, key: str, limit: str) -> Tuple[bool, int]:
        """Check if request is allowed based on rate limit"""
        try:
            # Parse limit (e.g., "5/minute")
            count, period = limit.split('/')
            count = int(count)
            
            if period == 'minute':
                window = timedelta(minutes=1)
            elif period == 'hour':
                window = timedelta(hours=1)
            elif period == 'day':
                window = timedelta(days=1)
            else:
                return True, 0
            
            now = datetime.utcnow()
            cutoff = now - window
            
            # Clean old requests
            if key in self.requests:
                self.requests[key] = [
                    req_time for req_time in self.requests[key] 
                    if req_time > cutoff
                ]
            else:
                self.requests[key] = []
            
            # Check if under limit
            if len(self.requests[key]) < count:
                self.requests[key].append(now)
                return True, 0
            else:
                return False, len(self.requests[key])
                
        except Exception as e:
            print(f"Rate limiter error: {e}")
            return True, 0

# Global rate limiter instance
simple_rate_limiter = SimpleRateLimiter()

def get_rate_limiter():
    """Get rate limiter instance"""
    return simple_rate_limiter

def rate_limit_exceeded_handler(request: Request, exc):
    """Custom rate limit exceeded handler"""
    return {
        "detail": f"Rate limit exceeded: {exc.detail if hasattr(exc, 'detail') else 'Too many requests'}",
        "retry_after": 60
    }
