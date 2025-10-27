"""
Database configuration and session management with optimized connection pooling
"""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine with optimized connection pooling for production
engine = create_engine(
    settings.DATABASE_URL,
    # Connection pooling configuration
    poolclass=QueuePool,
    pool_size=20,                    # Number of connections to maintain in the pool
    max_overflow=10,                 # Additional connections when pool is exhausted
    pool_timeout=30,                 # Seconds to wait for a connection from the pool
    pool_recycle=3600,               # Recycle connections after 1 hour (prevents stale connections)
    pool_pre_ping=True,              # Test connections before using them (auto-reconnect)
    
    # Performance optimizations
    echo=False,                      # Set to True for SQL debugging (disable in production)
    echo_pool=False,                 # Set to True for pool debugging
    
    # Connection arguments
    connect_args={
        "options": "-c timezone=utc",
        "connect_timeout": 10,
    } if "postgresql" in settings.DATABASE_URL else {},
    
    # Execution options
    execution_options={
        "isolation_level": "READ COMMITTED"
    }
)

# Event listeners for connection pool monitoring
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Log when new database connection is created"""
    logger.debug("New database connection established")

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log when connection is checked out from pool"""
    logger.debug("Connection checked out from pool")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Log when connection is returned to pool"""
    logger.debug("Connection returned to pool")

# Session factory with optimized settings
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Prevent unnecessary SELECT queries after commit
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """
    Create all tables in the database
    """
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """
    Drop all tables in the database (use with caution!)
    """
    Base.metadata.drop_all(bind=engine)
