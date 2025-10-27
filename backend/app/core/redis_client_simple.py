"""
Simple Redis client fallback for development without Redis server
"""
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

class SimpleRedisClient:
    """In-memory Redis client fallback for development"""
    
    def __init__(self):
        self.data = {}
        print("⚠️ Using in-memory Redis fallback (Redis server not available)")
    
    def blacklist_token(self, token: str, expires_in: int) -> bool:
        """Add token to blacklist"""
        try:
            key = f"blacklist:{token}"
            self.data[key] = {
                "value": "1",
                "expires": datetime.utcnow() + timedelta(seconds=expires_in)
            }
            return True
        except Exception as e:
            print(f"Error blacklisting token: {e}")
            return False
    
    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        try:
            key = f"blacklist:{token}"
            if key in self.data:
                if datetime.utcnow() < self.data[key]["expires"]:
                    return True
                else:
                    del self.data[key]  # Clean up expired
            return False
        except Exception as e:
            print(f"Error checking blacklist: {e}")
            return False
    
    def store_session(self, user_id: str, session_data: Dict[str, Any], expires_in: int) -> bool:
        """Store user session data"""
        try:
            key = f"session:{user_id}"
            self.data[key] = {
                "value": session_data,
                "expires": datetime.utcnow() + timedelta(seconds=expires_in)
            }
            return True
        except Exception as e:
            print(f"Error storing session: {e}")
            return False
    
    def get_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user session data"""
        try:
            key = f"session:{user_id}"
            if key in self.data:
                if datetime.utcnow() < self.data[key]["expires"]:
                    return self.data[key]["value"]
                else:
                    del self.data[key]  # Clean up expired
            return None
        except Exception as e:
            print(f"Error getting session: {e}")
            return None
    
    def delete_session(self, user_id: str) -> bool:
        """Delete user session"""
        try:
            key = f"session:{user_id}"
            if key in self.data:
                del self.data[key]
            return True
        except Exception as e:
            print(f"Error deleting session: {e}")
            return False
    
    def store_refresh_token(self, token: str, user_id: str, expires_in: int) -> bool:
        """Store refresh token with user mapping"""
        try:
            key = f"refresh_token:{token}"
            data = {"user_id": user_id, "created_at": datetime.utcnow().isoformat()}
            self.data[key] = {
                "value": data,
                "expires": datetime.utcnow() + timedelta(seconds=expires_in)
            }
            return True
        except Exception as e:
            print(f"Error storing refresh token: {e}")
            return False
    
    def get_refresh_token_data(self, token: str) -> Optional[Dict[str, Any]]:
        """Get refresh token data"""
        try:
            key = f"refresh_token:{token}"
            if key in self.data:
                if datetime.utcnow() < self.data[key]["expires"]:
                    return self.data[key]["value"]
                else:
                    del self.data[key]  # Clean up expired
            return None
        except Exception as e:
            print(f"Error getting refresh token: {e}")
            return None
    
    def delete_refresh_token(self, token: str) -> bool:
        """Delete refresh token"""
        try:
            key = f"refresh_token:{token}"
            if key in self.data:
                del self.data[key]
            return True
        except Exception as e:
            print(f"Error deleting refresh token: {e}")
            return False
    
    def get_user_sessions(self, user_id: str) -> list:
        """Get all active sessions for a user"""
        try:
            sessions = []
            for key, value in self.data.items():
                if key.startswith(f"session:{user_id}") and datetime.utcnow() < value["expires"]:
                    sessions.append(value["value"])
            return sessions
        except Exception as e:
            print(f"Error getting user sessions: {e}")
            return []
    
    def delete_all_user_sessions(self, user_id: str) -> bool:
        """Delete all sessions for a user"""
        try:
            keys_to_delete = []
            for key in self.data.keys():
                if key.startswith(f"session:{user_id}"):
                    keys_to_delete.append(key)
            
            for key in keys_to_delete:
                del self.data[key]
            return True
        except Exception as e:
            print(f"Error deleting user sessions: {e}")
            return False

# Global Redis client instance (fallback)
redis_client = SimpleRedisClient()
