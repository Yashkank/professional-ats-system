"""
Enhanced authentication endpoints for production-level session management
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.core.auth import (
    verify_password, get_password_hash, create_access_token, create_refresh_token,
    authenticate_user, get_current_user, set_cookies, clear_cookies, 
    refresh_access_token, blacklist_token, get_client_info
)
try:
    from app.core.rate_limiter import limiter
except ImportError:
    from app.core.rate_limiter_simple import get_rate_limiter
    limiter = get_rate_limiter()
from app.core.config import settings
from app.models.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, Token, Login
try:
    from app.core.redis_client import redis_client
except ImportError:
    from app.core.redis_client_simple import redis_client
from typing import List, Dict, Any
import uuid

router = APIRouter()

@router.post("/signup", response_model=Token)
async def signup(
    request: Request,
    response: Response,
    user_data: UserCreate, 
    db: Session = Depends(get_db)
):
    """Enhanced signup with session management"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Validate that recruiters must have a company assigned
    if user_data.role == "recruiter" and not user_data.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiters must be assigned to a company"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        company_id=user_data.company_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create tokens with session management
    session_id = str(uuid.uuid4())
    access_token = create_access_token(
        data={"sub": db_user.email}, 
        session_id=session_id
    )
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    
    # Store refresh token in Redis
    redis_client.store_refresh_token(
        refresh_token, 
        str(db_user.id), 
        settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    # Store session data
    client_info = get_client_info(request)
    session_data = {
        "user_id": str(db_user.id),
        "email": db_user.email,
        "created_at": client_info,
        "last_activity": client_info,
        "client_info": client_info
    }
    redis_client.store_session(
        f"{db_user.id}:{session_id}", 
        session_data, 
        settings.IDLE_TIMEOUT_MINUTES * 60
    )
    
    # Set secure cookies
    set_cookies(response, access_token, refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user,
        "session_id": session_id
    }

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    login_data: Login, 
    db: Session = Depends(get_db)
):
    """Enhanced login with session management and concurrent session control"""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Check concurrent session limit
    existing_sessions = redis_client.get_user_sessions(str(user.id))
    if len(existing_sessions) >= settings.MAX_CONCURRENT_SESSIONS:
        # Remove oldest session
        oldest_session = min(existing_sessions, key=lambda x: x.get('last_activity', ''))
        redis_client.delete_session(f"{user.id}:{oldest_session.get('session_id')}")
    
    # Create tokens with session management
    session_id = str(uuid.uuid4())
    access_token = create_access_token(
        data={"sub": user.email}, 
        session_id=session_id
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Store refresh token in Redis
    redis_client.store_refresh_token(
        refresh_token, 
        str(user.id), 
        settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    # Store session data
    client_info = get_client_info(request)
    session_data = {
        "user_id": str(user.id),
        "email": user.email,
        "created_at": client_info,
        "last_activity": client_info,
        "client_info": client_info
    }
    redis_client.store_session(
        f"{user.id}:{session_id}", 
        session_data, 
        settings.IDLE_TIMEOUT_MINUTES * 60
    )
    
    # Set secure cookies
    set_cookies(response, access_token, refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
        "session_id": session_id
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token from cookie"""
    # Get refresh token from cookie
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    # Refresh the token
    token_data = refresh_access_token(refresh_token, db)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Set new cookies
    set_cookies(response, token_data["access_token"], token_data["refresh_token"])
    
    return {
        "access_token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "token_type": "bearer",
        "session_id": token_data["session_id"]
    }

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user)
):
    """Enhanced logout with token blacklisting"""
    # Get tokens from cookies
    access_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    
    # Blacklist tokens
    if access_token:
        blacklist_token(access_token, settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    if refresh_token:
        redis_client.delete_refresh_token(refresh_token)
    
    # Clear session data
    redis_client.delete_session(f"{current_user.id}:*")
    
    # Clear cookies
    clear_cookies(response)
    
    return {"message": "Successfully logged out"}

@router.post("/logout-all")
async def logout_all_devices(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    """Logout from all devices"""
    # Delete all user sessions
    redis_client.delete_all_user_sessions(str(current_user.id))
    
    # Clear cookies
    clear_cookies(response)
    
    return {"message": "Successfully logged out from all devices"}

@router.get("/sessions", response_model=List[Dict[str, Any]])
async def get_active_sessions(current_user: User = Depends(get_current_user)):
    """Get list of active sessions for the user"""
    sessions = redis_client.get_user_sessions(str(current_user.id))
    
    # Format session data for frontend
    formatted_sessions = []
    for session in sessions:
        formatted_sessions.append({
            "session_id": session.get("session_id"),
            "created_at": session.get("created_at"),
            "last_activity": session.get("last_activity"),
            "client_info": session.get("client_info", {}),
            "is_current": False  # Will be set by frontend
        })
    
    return formatted_sessions

@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Revoke a specific session"""
    redis_client.delete_session(f"{current_user.id}:{session_id}")
    return {"message": f"Session {session_id} revoked successfully"}