"""
Structured logging configuration with Loguru for production-grade logging
"""
from loguru import logger
import sys
import os
from pathlib import Path
import json
from datetime import datetime


# Create logs directory if it doesn't exist
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)


# ============================================================
# CUSTOM LOG FORMATS
# ============================================================

# Development format (colorful and detailed)
DEV_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<level>{message}</level> | "
    "{extra}"
)

# Production format (JSON structured logging for log aggregation)
PROD_FORMAT = (
    "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
    "{level: <8} | "
    "{name}:{function}:{line} | "
    "{message} | "
    "{extra}"
)

# JSON formatter for production log aggregation (ELK, Splunk, etc.)
def json_formatter(record):
    """Format log record as JSON for structured logging"""
    log_entry = {
        "timestamp": record["time"].isoformat(),
        "level": record["level"].name,
        "logger": record["name"],
        "function": record["function"],
        "line": record["line"],
        "message": record["message"],
        "extra": record["extra"],
    }
    
    # Add exception information if present
    if record["exception"]:
        log_entry["exception"] = {
            "type": record["exception"].type.__name__,
            "value": str(record["exception"].value),
            "traceback": record["exception"].traceback,
        }
    
    return json.dumps(log_entry)


# ============================================================
# CONFIGURE LOGURU
# ============================================================

def setup_logging(environment: str = "development"):
    """
    Configure Loguru logging for the application
    
    Args:
        environment: "development" or "production"
    """
    
    # Remove default handler
    logger.remove()
    
    # ============================================================
    # CONSOLE LOGGING
    # ============================================================
    
    if environment == "development":
        # Development: Colorful console output
        logger.add(
            sys.stdout,
            format=DEV_FORMAT,
            level="DEBUG",
            colorize=True,
            backtrace=True,
            diagnose=True,
        )
    else:
        # Production: Structured console output (for Docker logs)
        logger.add(
            sys.stdout,
            format=PROD_FORMAT,
            level="INFO",
            colorize=False,
            serialize=True,  # JSON output
        )
    
    # ============================================================
    # FILE LOGGING - ALL LOGS
    # ============================================================
    
    logger.add(
        LOGS_DIR / "app_{time:YYYY-MM-DD}.log",
        format=PROD_FORMAT,
        level="DEBUG",
        rotation="500 MB",      # Rotate when file reaches 500MB
        retention="10 days",     # Keep logs for 10 days
        compression="zip",       # Compress rotated logs
        enqueue=True,           # Async logging (better performance)
        backtrace=True,
        diagnose=True,
    )
    
    # ============================================================
    # FILE LOGGING - ERROR LOGS (separate file)
    # ============================================================
    
    logger.add(
        LOGS_DIR / "errors_{time:YYYY-MM-DD}.log",
        format=PROD_FORMAT,
        level="ERROR",
        rotation="100 MB",
        retention="30 days",     # Keep error logs longer
        compression="zip",
        enqueue=True,
        backtrace=True,
        diagnose=True,
    )
    
    # ============================================================
    # FILE LOGGING - ACCESS LOGS (API requests)
    # ============================================================
    
    logger.add(
        LOGS_DIR / "access_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
        level="INFO",
        rotation="500 MB",
        retention="7 days",
        compression="zip",
        enqueue=True,
        filter=lambda record: "access" in record["extra"],
    )
    
    # ============================================================
    # FILE LOGGING - SECURITY LOGS (auth, permissions)
    # ============================================================
    
    logger.add(
        LOGS_DIR / "security_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message} | {extra}",
        level="INFO",
        rotation="100 MB",
        retention="90 days",     # Keep security logs for 3 months
        compression="zip",
        enqueue=True,
        filter=lambda record: "security" in record["extra"],
    )
    
    # ============================================================
    # FILE LOGGING - PERFORMANCE LOGS
    # ============================================================
    
    logger.add(
        LOGS_DIR / "performance_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {message} | {extra}",
        level="INFO",
        rotation="100 MB",
        retention="7 days",
        compression="zip",
        enqueue=True,
        filter=lambda record: "performance" in record["extra"],
    )
    
    # ============================================================
    # FILE LOGGING - JSON FORMAT (for log aggregation)
    # ============================================================
    
    logger.add(
        LOGS_DIR / "json_{time:YYYY-MM-DD}.log",
        format=json_formatter,
        level="INFO",
        rotation="500 MB",
        retention="7 days",
        compression="zip",
        enqueue=True,
        serialize=True,
    )
    
    logger.info(f"✅ Logging configured for {environment} environment")


# ============================================================
# LOGGING HELPERS
# ============================================================

def log_api_request(method: str, path: str, status_code: int, duration_ms: float, user_id: str = None):
    """Log API request with standardized format"""
    logger.bind(access=True).info(
        f"{method} {path} | Status: {status_code} | Duration: {duration_ms:.2f}ms | User: {user_id or 'anonymous'}"
    )


def log_security_event(event_type: str, user_id: str = None, details: dict = None):
    """Log security-related events"""
    logger.bind(security=True).warning(
        f"Security Event: {event_type}",
        user_id=user_id,
        details=details or {},
        timestamp=datetime.utcnow().isoformat()
    )


def log_performance(operation: str, duration_ms: float, details: dict = None):
    """Log performance metrics"""
    logger.bind(performance=True).info(
        f"Performance: {operation} took {duration_ms:.2f}ms",
        operation=operation,
        duration_ms=duration_ms,
        details=details or {}
    )


def log_database_query(query: str, duration_ms: float, rows: int = None):
    """Log database query performance"""
    logger.bind(performance=True, database=True).debug(
        f"DB Query: {duration_ms:.2f}ms | Rows: {rows or 'N/A'}",
        query=query[:200],  # Truncate long queries
        duration_ms=duration_ms,
        rows=rows
    )


def log_error_with_context(error: Exception, context: dict = None):
    """Log error with full context and stack trace"""
    logger.bind(error_context=context or {}).exception(
        f"Error occurred: {type(error).__name__}: {str(error)}"
    )


# ============================================================
# CONTEXT MANAGERS FOR LOGGING
# ============================================================

from contextlib import contextmanager
import time

@contextmanager
def log_execution_time(operation: str):
    """Context manager to log execution time of operations"""
    start_time = time.time()
    try:
        yield
    finally:
        duration_ms = (time.time() - start_time) * 1000
        log_performance(operation, duration_ms)


# ============================================================
# INITIALIZE LOGGING
# ============================================================

# Auto-detect environment
environment = os.getenv("ENVIRONMENT", "development")
setup_logging(environment)


# Export configured logger
__all__ = [
    "logger",
    "log_api_request",
    "log_security_event",
    "log_performance",
    "log_database_query",
    "log_error_with_context",
    "log_execution_time",
]

