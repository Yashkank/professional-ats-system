"""
Configuration settings for the application
"""
from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./ats.db"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-here-make-it-long-and-random-ats-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Reduced for better security
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SLIDING_SESSION_EXTEND_HOURS: int = 24  # Extend session on activity
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # Session Management
    IDLE_TIMEOUT_MINUTES: int = 30  # Logout after inactivity
    MAX_CONCURRENT_SESSIONS: int = 3  # Allow multiple sessions
    SESSION_COOKIE_NAME: str = "ats_session"
    REFRESH_COOKIE_NAME: str = "ats_refresh"
    
    # Cookie Security
    COOKIE_SECURE: bool = False  # Set to True in production with HTTPS
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3002,http://127.0.0.1:3002,http://localhost:8501"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    # Rate Limiting
    LOGIN_RATE_LIMIT: str = "5/minute"
    REFRESH_RATE_LIMIT: str = "10/minute"
    
    # App
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()


