"""
Redis client for session management and token blacklisting with automatic fallback
"""
import redis
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings

class RedisClient:
    def __init__(self):
        try:
            self.redis_client = redis.Redis(
                host=getattr(settings, 'REDIS_HOST', 'localhost'),
                port=getattr(settings, 'REDIS_PORT', 6379),
                db=getattr(settings, 'REDIS_DB', 0),
                decode_responses=True,
                socket_connect_timeout=1,
                socket_timeout=1
            )
            # Test connection
            self.redis_client.ping()
            print("✅ Redis connected successfully")
            self.use_fallback = False
        except Exception as e:
            print(f"⚠️  Redis connection failed: {e}")
            print("⚠️  Using in-memory fallback for session management")
            self.use_fallback = True
            self.fallback_data = {}
    
    def _is_expired(self, item):
        """Check if fallback item is expired"""
        return datetime.utcnow() >= item.get("expires", datetime.utcnow())
    
    def blacklist_token(self, token: str, expires_in: int) -> bool:
        """Add token to blacklist"""
        if self.use_fallback:
            try:
                key = f"blacklist:{token}"
                self.fallback_data[key] = {
                    "value": "1",
                    "expires": datetime.utcnow() + timedelta(seconds=expires_in)
                }
                return True
            except Exception as e:
                return True  # Fail silently for dev
        try:
            key = f"blacklist:{token}"
            self.redis_client.setex(key, expires_in, "1")
            return True
        except Exception as e:
            return True  # Fail silently
    
    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        if self.use_fallback:
            try:
                key = f"blacklist:{token}"
                if key in self.fallback_data:
                    if not self._is_expired(self.fallback_data[key]):
                        return True
                    del self.fallback_data[key]
                return False
            except Exception as e:
                return False
        try:
            key = f"blacklist:{token}"
            return self.redis_client.exists(key) > 0
        except Exception as e:
            return False
    
    def store_session(self, user_id: str, session_data: Dict[str, Any], expires_in: int) -> bool:
        """Store user session data"""
        if self.use_fallback:
            try:
                key = f"session:{user_id}"
                self.fallback_data[key] = {
                    "value": session_data,
                    "expires": datetime.utcnow() + timedelta(seconds=expires_in)
                }
                return True
            except Exception as e:
                return True  # Fail silently for dev
        try:
            key = f"session:{user_id}"
            self.redis_client.setex(key, expires_in, json.dumps(session_data))
            return True
        except Exception as e:
            return True  # Fail silently
    
    def get_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user session data"""
        if self.use_fallback:
            try:
                key = f"session:{user_id}"
                if key in self.fallback_data:
                    if not self._is_expired(self.fallback_data[key]):
                        return self.fallback_data[key]["value"]
                    del self.fallback_data[key]
                return None
            except Exception as e:
                return None
        try:
            key = f"session:{user_id}"
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            return None
    
    def delete_session(self, user_id: str) -> bool:
        """Delete user session"""
        if self.use_fallback:
            try:
                key = f"session:{user_id}"
                if key in self.fallback_data:
                    del self.fallback_data[key]
                return True
            except Exception as e:
                return True
        try:
            key = f"session:{user_id}"
            self.redis_client.delete(key)
            return True
        except Exception as e:
            return True
    
    def store_refresh_token(self, token: str, user_id: str, expires_in: int) -> bool:
        """Store refresh token with user mapping"""
        if self.use_fallback:
            try:
                key = f"refresh_token:{token}"
                data = {"user_id": user_id, "created_at": datetime.utcnow().isoformat()}
                self.fallback_data[key] = {
                    "value": data,
                    "expires": datetime.utcnow() + timedelta(seconds=expires_in)
                }
                return True
            except Exception as e:
                return True  # Fail silently for dev
        try:
            key = f"refresh_token:{token}"
            data = {"user_id": user_id, "created_at": datetime.utcnow().isoformat()}
            self.redis_client.setex(key, expires_in, json.dumps(data))
            return True
        except Exception as e:
            return True  # Fail silently
    
    def get_refresh_token_data(self, token: str) -> Optional[Dict[str, Any]]:
        """Get refresh token data"""
        if self.use_fallback:
            try:
                key = f"refresh_token:{token}"
                if key in self.fallback_data:
                    if not self._is_expired(self.fallback_data[key]):
                        return self.fallback_data[key]["value"]
                    del self.fallback_data[key]
                return None
            except Exception as e:
                return None
        try:
            key = f"refresh_token:{token}"
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            return None
    
    def delete_refresh_token(self, token: str) -> bool:
        """Delete refresh token"""
        if self.use_fallback:
            try:
                key = f"refresh_token:{token}"
                if key in self.fallback_data:
                    del self.fallback_data[key]
                return True
            except Exception as e:
                return True
        try:
            key = f"refresh_token:{token}"
            self.redis_client.delete(key)
            return True
        except Exception as e:
            return True
    
    def get_user_sessions(self, user_id: str) -> list:
        """Get all active sessions for a user"""
        if self.use_fallback:
            try:
                sessions = []
                for key, item in self.fallback_data.items():
                    if key.startswith(f"session:{user_id}") and not self._is_expired(item):
                        sessions.append(item["value"])
                return sessions
            except Exception as e:
                return []
        try:
            pattern = f"session:{user_id}:*"
            keys = self.redis_client.keys(pattern)
            sessions = []
            for key in keys:
                data = self.redis_client.get(key)
                if data:
                    sessions.append(json.loads(data))
            return sessions
        except Exception as e:
            return []
    
    def delete_all_user_sessions(self, user_id: str) -> bool:
        """Delete all sessions for a user"""
        if self.use_fallback:
            try:
                keys_to_delete = [k for k in self.fallback_data.keys() if k.startswith(f"session:{user_id}")]
                for key in keys_to_delete:
                    del self.fallback_data[key]
                return True
            except Exception as e:
                return True
        try:
            pattern = f"session:{user_id}:*"
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            return True

# Global Redis client instance
redis_client = RedisClient()
