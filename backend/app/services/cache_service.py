"""SmartBinX Distributed Caching & In-Memory Fallback Service.

Connects to Redis when running in containerized / production mode,
with seamless local memory fallback when Redis is unreachable.
"""

import json
import logging
from typing import Any, Optional

from app.config import settings

logger = logging.getLogger("smartbinx.cache")

try:
    import redis
    _redis_available = True
except ImportError:
    _redis_available = False
    redis = None


class CacheService:
    """Hybrid distributed Redis and in-memory cache manager."""

    def __init__(self):
        self._client: Optional[Any] = None
        self._memory_fallback: dict[str, Any] = {}
        self._connected = False
        self._init_client()

    def _init_client(self):
        if not _redis_available or not settings.REDIS_ENABLED:
            logger.info("Redis disabled or redis-py not installed; using local memory cache.")
            return

        try:
            self._client = redis.Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            # Test connectivity
            self._client.ping()
            self._connected = True
            logger.info(f"Connected to Redis cache at {settings.REDIS_URL}")
        except Exception as err:
            self._connected = False
            self._client = None
            logger.warning(f"Redis unavailable at {settings.REDIS_URL} ({err}). Falling back to memory cache.")

    @property
    def is_redis_connected(self) -> bool:
        if not self._connected or not self._client:
            return False
        try:
            return bool(self._client.ping())
        except Exception:
            return False

    def get(self, key: str) -> Optional[Any]:
        """Retrieve key from Redis or memory fallback."""
        if self._connected and self._client:
            try:
                val = self._client.get(key)
                if val is not None:
                    return json.loads(val)
            except Exception as err:
                logger.debug(f"Redis get failed for key '{key}': {err}")

        return self._memory_fallback.get(key)

    def set(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        """Store key-value with TTL in Redis or memory fallback."""
        serialized = json.dumps(value)
        success = False

        if self._connected and self._client:
            try:
                self._client.setex(key, expire_seconds, serialized)
                success = True
            except Exception as err:
                logger.debug(f"Redis set failed for key '{key}': {err}")

        # Always maintain in memory as secondary / local cache
        self._memory_fallback[key] = value
        return success

    def delete(self, key: str) -> bool:
        """Remove key from cache."""
        if self._connected and self._client:
            try:
                self._client.delete(key)
            except Exception:
                pass
        self._memory_fallback.pop(key, None)
        return True

    def health(self) -> dict[str, Any]:
        """Return cache health status."""
        connected = self.is_redis_connected
        return {
            "type": "redis" if connected else "in-memory-fallback",
            "redis_url": settings.REDIS_URL,
            "connected": connected,
        }


# Global Singleton Cache Instance
cache = CacheService()
