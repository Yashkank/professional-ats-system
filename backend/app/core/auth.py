"""
Enhanced authentication utilities for production-level session management
"""
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.database import get_db
from app.models.models import User
from app.schemas.schemas import TokenData
try:
    from app.core.redis_client import redis_client
except ImportError:
    from app.core.redis_client_simple import redis_client

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token handling
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None, session_id: str = None) -> str:
    """Create access token with session tracking"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "session_id": session_id or str(uuid.uuid4()),
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create refresh token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",
        "jti": str(uuid.uuid4())  # JWT ID for tracking
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify token and check blacklist"""
    try:
        # Check if token is blacklisted
        if redis_client.is_token_blacklisted(token):
            return None
            
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        session_id: str = payload.get("session_id")
        
        if email is None:
            return None
            
        token_data = TokenData(email=email, session_id=session_id)
        return token_data
    except JWTError:
        return None

def blacklist_token(token: str, expires_in: int) -> bool:
    """Add token to blacklist"""
    return redis_client.blacklist_token(token, expires_in)

def get_client_info(request: Request) -> Dict[str, str]:
    """Extract client information for session tracking"""
    return {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
        "host": request.headers.get("host", "unknown")
    }

def set_cookies(response: Response, access_token: str, refresh_token: str):
    """Set secure HttpOnly cookies"""
    # Access token cookie (short-lived)
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )
    
    # Refresh token cookie (long-lived)
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )

def clear_cookies(response: Response):
    """Clear authentication cookies"""
    response.delete_cookie(settings.SESSION_COOKIE_NAME, path="/")
    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path="/")

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Enhanced current user dependency with cookie and header support"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Try to get token from cookie first, then from Authorization header
    token = None
    
    # Check for token in cookie
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    
    # If no cookie, check Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise credentials_exception
    
    token_data = verify_token(token)
    if token_data is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    
    # Update session activity
    client_info = get_client_info(request)
    session_data = {
        "user_id": str(user.id),
        "email": user.email,
        "last_activity": datetime.utcnow().isoformat(),
        "client_info": client_info
    }
    
    # Store session data in Redis
    redis_client.store_session(
        f"{user.id}:{token_data.session_id}", 
        session_data, 
        settings.IDLE_TIMEOUT_MINUTES * 60
    )
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_current_recruiter_user(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in ["admin", "recruiter"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def refresh_access_token(refresh_token: str, db: Session) -> Optional[Dict[str, str]]:
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        jti: str = payload.get("jti")
        
        if email is None or jti is None:
            return None
        
        # Check if refresh token exists in Redis
        refresh_data = redis_client.get_refresh_token_data(refresh_token)
        if not refresh_data:
            return None
        
        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.is_active:
            return None
        
        # Create new tokens
        session_id = str(uuid.uuid4())
        new_access_token = create_access_token(
            data={"sub": user.email}, 
            session_id=session_id
        )
        new_refresh_token = create_refresh_token(data={"sub": user.email})
        
        # Store new refresh token and invalidate old one
        redis_client.store_refresh_token(
            new_refresh_token, 
            str(user.id), 
            settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )
        redis_client.delete_refresh_token(refresh_token)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "session_id": session_id
        }
        
    except JWTError:
        return None