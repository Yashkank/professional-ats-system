"""
Security middleware for enterprise-grade HTTP security headers
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Callable
import logging

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all HTTP responses.
    
    Implements OWASP security best practices:
    - Prevents clickjacking attacks
    - Prevents MIME type sniffing
    - Enables XSS protection
    - Enforces HTTPS
    - Content Security Policy
    - Referrer policy
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # ============================================================
        # CORE SECURITY HEADERS
        # ============================================================
        
        # X-Content-Type-Options: Prevent MIME type sniffing
        # Stops browsers from interpreting files as a different MIME type
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # X-Frame-Options: Prevent clickjacking attacks
        # Prevents the page from being embedded in an iframe
        response.headers["X-Frame-Options"] = "DENY"
        
        # X-XSS-Protection: Enable browser XSS filter
        # Legacy header but still useful for older browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Strict-Transport-Security (HSTS): Enforce HTTPS
        # Forces browsers to use HTTPS for all future requests (1 year)
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        
        # ============================================================
        # CONTENT SECURITY POLICY (CSP)
        # ============================================================
        
        # CSP: Prevent XSS, injection attacks, and unauthorized resource loading
        # Adjust this based on your frontend needs
        csp_directives = [
            "default-src 'self'",                          # Only load resources from same origin
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Allow inline scripts (for React)
            "style-src 'self' 'unsafe-inline'",            # Allow inline styles (for Tailwind)
            "img-src 'self' data: https:",                 # Allow images from same origin, data URIs, HTTPS
            "font-src 'self' data:",                       # Allow fonts from same origin and data URIs
            "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*",  # API calls
            "frame-ancestors 'none'",                      # Prevent embedding (same as X-Frame-Options)
            "base-uri 'self'",                             # Restrict base tag URLs
            "form-action 'self'",                          # Restrict form submissions
            "upgrade-insecure-requests",                   # Upgrade HTTP to HTTPS automatically
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
        
        # ============================================================
        # REFERRER POLICY
        # ============================================================
        
        # Referrer-Policy: Control referrer information
        # Protects user privacy by limiting referrer information sent
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # ============================================================
        # PERMISSIONS POLICY (formerly Feature-Policy)
        # ============================================================
        
        # Permissions-Policy: Disable browser features for security
        # Prevents unauthorized access to device features
        permissions = [
            "geolocation=()",       # Disable geolocation
            "microphone=()",        # Disable microphone
            "camera=()",            # Disable camera
            "payment=()",           # Disable payment APIs
            "usb=()",               # Disable USB access
            "magnetometer=()",      # Disable magnetometer
            "gyroscope=()",         # Disable gyroscope
            "accelerometer=()",     # Disable accelerometer
        ]
        response.headers["Permissions-Policy"] = ", ".join(permissions)
        
        # ============================================================
        # ADDITIONAL SECURITY HEADERS
        # ============================================================
        
        # X-Permitted-Cross-Domain-Policies: Prevent Adobe Flash/PDF from loading content
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        
        # Clear-Site-Data: Allow clearing browser data on logout
        # (Only applied to specific routes, not globally)
        
        # Expect-CT: Certificate Transparency (deprecated but still useful)
        response.headers["Expect-CT"] = "max-age=86400, enforce"
        
        # ============================================================
        # CACHE CONTROL (for sensitive endpoints)
        # ============================================================
        
        # Disable caching for API endpoints to prevent sensitive data leakage
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        # ============================================================
        # SERVER IDENTIFICATION
        # ============================================================
        
        # Remove Server header to prevent information disclosure
        if "Server" in response.headers:
            del response.headers["Server"]
        
        # Custom server header (optional)
        response.headers["X-Powered-By"] = "ATS-Professional"
        
        # ============================================================
        # LOGGING
        # ============================================================
        
        # Log security-sensitive requests
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            logger.info(
                f"Security: {request.method} {request.url.path} "
                f"from {request.client.host if request.client else 'unknown'}"
            )
        
        return response


class RateLimitInfo:
    """Add rate limit information to response headers"""
    
    def __init__(self, limit: int, remaining: int, reset: int):
        self.limit = limit
        self.remaining = remaining
        self.reset = reset
    
    def add_headers(self, response: Response):
        """Add X-RateLimit headers to response"""
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(self.remaining)
        response.headers["X-RateLimit-Reset"] = str(self.reset)


# Production CSP for stricter security (disable unsafe-inline/unsafe-eval)
PRODUCTION_CSP = {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
}


def format_csp(csp_dict: dict) -> str:
    """Format CSP dictionary into header string"""
    directives = []
    for key, values in csp_dict.items():
        directive = f"{key} {' '.join(values)}"
        directives.append(directive)
    return "; ".join(directives)

