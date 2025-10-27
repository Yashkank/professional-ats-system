"""
Pytest configuration and shared fixtures for testing
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.database import Base, get_db
from app.models.models import User
from app.core.auth import hash_password

# ============================================================
# TEST DATABASE
# ============================================================

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ============================================================
# FIXTURES
# ============================================================

@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_client(test_db):
    """Create a test client with database dependency override"""
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(test_db):
    """Create an admin user for testing"""
    user = User(
        email="admin@test.com",
        username="admin",
        full_name="Admin User",
        hashed_password=hash_password("admin123"),
        role="admin",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def recruiter_user(test_db):
    """Create a recruiter user for testing"""
    user = User(
        email="recruiter@test.com",
        username="recruiter",
        full_name="Recruiter User",
        hashed_password=hash_password("recruiter123"),
        role="recruiter",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def candidate_user(test_db):
    """Create a candidate user for testing"""
    user = User(
        email="candidate@test.com",
        username="candidate",
        full_name="Candidate User",
        hashed_password=hash_password("candidate123"),
        role="candidate",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def admin_token(test_client, admin_user):
    """Get JWT token for admin user"""
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin@test.com",
            "password": "admin123"
        }
    )
    return response.cookies.get("access_token")


@pytest.fixture
def recruiter_token(test_client, recruiter_user):
    """Get JWT token for recruiter user"""
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "username": "recruiter@test.com",
            "password": "recruiter123"
        }
    )
    return response.cookies.get("access_token")


@pytest.fixture
def candidate_token(test_client, candidate_user):
    """Get JWT token for candidate user"""
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "username": "candidate@test.com",
            "password": "candidate123"
        }
    )
    return response.cookies.get("access_token")

