"""
Input sanitization utilities to prevent XSS, SQL injection, and other attacks
"""
import bleach
from html import escape, unescape
import re
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


# ============================================================
# HTML SANITIZATION
# ============================================================

# Allowed HTML tags for rich text (job descriptions, cover letters)
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre',
    'a'  # Links (with restricted attributes)
]

# Allowed HTML attributes
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    '*': ['class']  # Allow class on all tags (for styling)
}

# Allowed protocols for links
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']


def sanitize_html(text: str, allowed_tags: Optional[List[str]] = None) -> str:
    """
    Remove potentially dangerous HTML while preserving safe formatting.
    
    Args:
        text: HTML text to sanitize
        allowed_tags: Optional list of allowed tags (uses default if None)
    
    Returns:
        Sanitized HTML string
    
    Example:
        >>> sanitize_html("<script>alert('xss')</script><p>Hello</p>")
        "<p>Hello</p>"
    """
    if not text:
        return ""
    
    tags = allowed_tags if allowed_tags is not None else ALLOWED_TAGS
    
    cleaned = bleach.clean(
        text,
        tags=tags,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,  # Strip disallowed tags instead of escaping
    )
    
    # Additional cleaning: remove javascript: protocol
    cleaned = re.sub(r'javascript:', '', cleaned, flags=re.IGNORECASE)
    
    return cleaned


def sanitize_text(text: str) -> str:
    """
    Escape all HTML entities for plain text storage.
    Use this for text that should never contain HTML.
    
    Args:
        text: Plain text to escape
    
    Returns:
        HTML-escaped string
    
    Example:
        >>> sanitize_text("<script>alert('xss')</script>")
        "&lt;script&gt;alert('xss')&lt;/script&gt;"
    """
    if not text:
        return ""
    
    return escape(text)


def strip_all_tags(text: str) -> str:
    """
    Remove ALL HTML tags, leaving only plain text.
    
    Args:
        text: HTML text
    
    Returns:
        Plain text with all HTML removed
    
    Example:
        >>> strip_all_tags("<p>Hello <strong>World</strong></p>")
        "Hello World"
    """
    if not text:
        return ""
    
    return bleach.clean(text, tags=[], strip=True)


# ============================================================
# SQL INJECTION PREVENTION
# ============================================================

def sanitize_sql_like_pattern(pattern: str) -> str:
    """
    Escape special characters in SQL LIKE patterns.
    
    Note: SQLAlchemy ORM already prevents SQL injection via parameterized queries,
    but this is useful for raw SQL or additional safety.
    
    Args:
        pattern: Search pattern for SQL LIKE
    
    Returns:
        Escaped pattern safe for LIKE queries
    """
    if not pattern:
        return ""
    
    # Escape special LIKE characters
    pattern = pattern.replace('\\', '\\\\')  # Escape backslash first
    pattern = pattern.replace('%', '\\%')
    pattern = pattern.replace('_', '\\_')
    pattern = pattern.replace('[', '\\[')
    
    return pattern


# ============================================================
# FILE PATH SANITIZATION
# ============================================================

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal attacks.
    
    Args:
        filename: Original filename
    
    Returns:
        Safe filename
    
    Example:
        >>> sanitize_filename("../../etc/passwd")
        "passwd"
        >>> sanitize_filename("resume<script>.pdf")
        "resume.pdf"
    """
    if not filename:
        return "unnamed_file"
    
    # Remove path separators
    filename = filename.replace('/', '_').replace('\\', '_')
    
    # Remove potentially dangerous characters
    filename = re.sub(r'[<>:"|?*]', '', filename)
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    
    # Ensure filename is not empty after cleaning
    if not filename:
        return "unnamed_file"
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    
    return filename


# ============================================================
# EMAIL SANITIZATION
# ============================================================

def sanitize_email(email: str) -> str:
    """
    Sanitize and validate email address.
    
    Args:
        email: Email address
    
    Returns:
        Lowercase, trimmed email
    
    Raises:
        ValueError: If email format is invalid
    """
    if not email:
        raise ValueError("Email cannot be empty")
    
    email = email.strip().lower()
    
    # Basic email regex validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValueError(f"Invalid email format: {email}")
    
    return email


# ============================================================
# URL SANITIZATION
# ============================================================

def sanitize_url(url: str, allowed_protocols: Optional[List[str]] = None) -> str:
    """
    Sanitize URL to prevent XSS via javascript: protocol.
    
    Args:
        url: URL to sanitize
        allowed_protocols: List of allowed protocols (default: http, https)
    
    Returns:
        Sanitized URL
    
    Raises:
        ValueError: If URL protocol is not allowed
    """
    if not url:
        return ""
    
    url = url.strip()
    protocols = allowed_protocols or ['http', 'https']
    
    # Check protocol
    if '://' in url:
        protocol = url.split('://')[0].lower()
        if protocol not in protocols:
            raise ValueError(f"Protocol '{protocol}' not allowed. Allowed: {protocols}")
    else:
        # Add https:// if no protocol specified
        url = f"https://{url}"
    
    # Remove javascript: and data: protocols
    url = re.sub(r'javascript:', '', url, flags=re.IGNORECASE)
    url = re.sub(r'data:', '', url, flags=re.IGNORECASE)
    
    return url


# ============================================================
# JSON SANITIZATION
# ============================================================

def sanitize_json_strings(data: Dict[str, Any], sanitize_func=sanitize_text) -> Dict[str, Any]:
    """
    Recursively sanitize all string values in a dictionary.
    
    Args:
        data: Dictionary to sanitize
        sanitize_func: Function to use for sanitization (default: sanitize_text)
    
    Returns:
        Dictionary with sanitized strings
    """
    if not isinstance(data, dict):
        return data
    
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_func(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_json_strings(value, sanitize_func)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_json_strings(item, sanitize_func) if isinstance(item, dict)
                else sanitize_func(item) if isinstance(item, str)
                else item
                for item in value
            ]
        else:
            sanitized[key] = value
    
    return sanitized


# ============================================================
# PYDANTIC VALIDATORS
# ============================================================

def create_html_validator(allowed_tags: Optional[List[str]] = None):
    """
    Create a Pydantic validator for HTML fields.
    
    Usage:
        class JobCreate(BaseModel):
            description: str
            
            _sanitize_description = validator('description', allow_reuse=True)(
                create_html_validator(['p', 'br', 'strong', 'em'])
            )
    """
    def validator(cls, v):
        if v is None:
            return v
        return sanitize_html(v, allowed_tags)
    return validator


def create_text_validator():
    """
    Create a Pydantic validator for plain text fields.
    
    Usage:
        class UserCreate(BaseModel):
            full_name: str
            
            _sanitize_name = validator('full_name', allow_reuse=True)(create_text_validator())
    """
    def validator(cls, v):
        if v is None:
            return v
        return sanitize_text(v)
    return validator


# ============================================================
# SECURITY LOGGING
# ============================================================

def log_suspicious_input(field_name: str, original_value: str, sanitized_value: str, user_id: str = None):
    """Log when potentially malicious input is detected"""
    if original_value != sanitized_value:
        logger.warning(
            f"Suspicious input detected in field '{field_name}' | User: {user_id or 'unknown'}",
            extra={
                "security": True,
                "field": field_name,
                "original": original_value[:100],  # Truncate
                "sanitized": sanitized_value[:100],
                "user_id": user_id
            }
        )


# ============================================================
# CONVENIENCE FUNCTIONS
# ============================================================

class InputSanitizer:
    """
    Fluent API for input sanitization.
    
    Example:
        sanitizer = InputSanitizer(user_input)
        clean = sanitizer.html().max_length(1000).get()
    """
    
    def __init__(self, value: str):
        self.value = value
    
    def html(self, allowed_tags: Optional[List[str]] = None):
        """Sanitize HTML"""
        self.value = sanitize_html(self.value, allowed_tags)
        return self
    
    def text(self):
        """Escape all HTML"""
        self.value = sanitize_text(self.value)
        return self
    
    def strip_tags(self):
        """Remove all HTML tags"""
        self.value = strip_all_tags(self.value)
        return self
    
    def max_length(self, length: int):
        """Truncate to maximum length"""
        if len(self.value) > length:
            self.value = self.value[:length]
        return self
    
    def trim(self):
        """Remove leading/trailing whitespace"""
        self.value = self.value.strip()
        return self
    
    def get(self) -> str:
        """Get sanitized value"""
        return self.value


# Export main functions
__all__ = [
    'sanitize_html',
    'sanitize_text',
    'strip_all_tags',
    'sanitize_filename',
    'sanitize_email',
    'sanitize_url',
    'sanitize_json_strings',
    'create_html_validator',
    'create_text_validator',
    'InputSanitizer',
]

