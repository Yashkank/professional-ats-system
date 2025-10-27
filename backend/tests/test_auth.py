"""
Tests for authentication endpoints
"""
import pytest
from app.core.auth import hash_password, verify_password, create_access_token


class TestPasswordHashing:
    """Test password hashing and verification"""
    
    def test_password_hashing(self):
        """Test that passwords are properly hashed"""
        password = "SecurePassword123!"
        hashed = hash_password(password)
        
        assert password != hashed
        assert len(hashed) > 50  # Bcrypt hashes are long
        assert hashed.startswith("$2b$")  # Bcrypt prefix
    
    def test_password_verification(self):
        """Test password verification works"""
        password = "MySecretPassword"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
        assert verify_password("WrongPassword", hashed) is False
    
    def test_same_password_different_hashes(self):
        """Test same password produces different hashes (salt)"""
        password = "SamePassword"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTToken:
    """Test JWT token creation"""
    
    def test_token_creation(self):
        """Test JWT token is created"""
        data = {"sub": "user123", "role": "admin"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 100  # JWT tokens are long
        assert token.count('.') == 2  # JWT format: header.payload.signature


class TestLoginEndpoint:
    """Test login endpoint"""
    
    def test_successful_login(self, test_client, admin_user):
        """Test successful login returns token"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin@test.com",
                "password": "admin123"
            }
        )
        
        assert response.status_code == 200
        assert "access_token" in response.cookies
        data = response.json()
        assert data["email"] == "admin@test.com"
        assert data["role"] == "admin"
    
    def test_login_invalid_credentials(self, test_client, admin_user):
        """Test login with wrong password fails"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin@test.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, test_client):
        """Test login with non-existent user fails"""
        response = test_client.post(
            "/api/v1/auth/login",
            json={
                "username": "nonexistent@test.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 401


class TestSignupEndpoint:
    """Test signup endpoint"""
    
    def test_successful_signup(self, test_client):
        """Test successful user registration"""
        response = test_client.post(
            "/api/v1/auth/signup",
            json={
                "email": "newuser@test.com",
                "username": "newuser",
                "password": "SecurePass123!",
                "full_name": "New User",
                "role": "candidate"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["role"] == "candidate"
        assert "password" not in data  # Password should not be returned
    
    def test_signup_duplicate_email(self, test_client, admin_user):
        """Test signup with existing email fails"""
        response = test_client.post(
            "/api/v1/auth/signup",
            json={
                "email": "admin@test.com",  # Already exists
                "username": "newadmin",
                "password": "SecurePass123!",
                "full_name": "Another Admin",
                "role": "admin"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()


class TestProtectedEndpoints:
    """Test protected endpoints require authentication"""
    
    def test_protected_endpoint_without_token(self, test_client):
        """Test accessing protected endpoint without token fails"""
        response = test_client.get("/api/v1/users/me")
        assert response.status_code == 401
    
    def test_protected_endpoint_with_token(self, test_client, admin_token):
        """Test accessing protected endpoint with valid token succeeds"""
        response = test_client.get(
            "/api/v1/users/me",
            cookies={"access_token": admin_token}
        )
        assert response.status_code == 200
        assert response.json()["email"] == "admin@test.com"

