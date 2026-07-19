"""Redis cache management utilities."""
import json
import logging
from typing import Any, Optional
import redis
from config import REDIS_URL, REDIS_CACHE_EXPIRE

logger = logging.getLogger(__name__)


class RedisCache:
    """Redis cache management."""
    
    def __init__(self, url: str = REDIS_URL):
        """
        Initialize Redis cache.
        
        Args:
            url: Redis connection URL
        """
        try:
            self.client = redis.from_url(url, decode_responses=True)
            # Test connection
            self.client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if Redis is connected."""
        return self.client is not None
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None
        """
        if not self.is_connected():
            return None
        
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error for key {key}: {e}")
        return None
    
    def set(self, key: str, value: Any, expire: int = REDIS_CACHE_EXPIRE) -> bool:
        """
        Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            expire: Expiration time in seconds
            
        Returns:
            True if successful
        """
        if not self.is_connected():
            return False
        
        try:
            self.client.setex(key, expire, json.dumps(value))
            return True
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful
        """
        if not self.is_connected():
            return False
        
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete error for key {key}: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """
        Clear multiple keys matching pattern.
        
        Args:
            pattern: Pattern to match (e.g., "dashboard:*")
            
        Returns:
            Number of keys deleted
        """
        if not self.is_connected():
            return 0
        
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache clear pattern error: {e}")
            return 0


# Global cache instance
cache = RedisCache()
