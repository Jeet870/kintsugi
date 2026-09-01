"""
Redis-Backed Sliding-Window Rate Limiting Middleware.
Protects sensitive API routes (auth login/register, AI companion chat, token refresh) from abuse and brute-force attacks.
Falls back gracefully to an in-memory sliding window if Redis is offline.
"""
import time
import logging
from typing import Dict, Tuple, List
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

from app.core.config import settings

logger = logging.getLogger("kintsugi.middleware.ratelimit")

# Route Rate Limit Rules: (max_requests, window_seconds)
ROUTE_LIMITS: Dict[str, Tuple[int, int]] = {
    "/api/v1/auth/login": (5, 60),
    "/api/v1/auth/register": (3, 60),
    "/api/v1/auth/refresh": (10, 60),
    "/api/v1/chat/sessions": (20, 60),
    "/api/v1/mood/": (60, 3600),
    "/api/v1/emergency/alert": (10, 60),
}

# Optional Redis connection initialization
try:
    import redis
    redis_client = redis.from_url(settings.CELERY_BROKER_URL, decode_responses=True)
    redis_client.ping()
    logger.info("Connected to Redis for API rate limiting")
except Exception:
    redis_client = None
    logger.warning("Redis unavailable; using in-memory sliding window fallback for rate limiting")

# Fallback in-memory timestamp store: { (key, path): [timestamps...] }
_inmemory_store: Dict[str, List[float]] = defaultdict(list)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    ASGI Middleware applying per-route sliding-window rate limits.
    Bypasses CORS OPTIONS preflight requests automatically.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Always bypass CORS OPTIONS preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path

        # Find matching route limit configuration
        limit_config = None
        for route_prefix, (max_req, window_sec) in ROUTE_LIMITS.items():
            if path == route_prefix or path.startswith(route_prefix.rstrip("/")):
                limit_config = (max_req, window_sec)
                break

        if not limit_config:
            return await call_next(request)

        max_requests, window_seconds = limit_config
        client_ip = request.client.host if request.client else "127.0.0.1"
        rate_key = f"ratelimit:{client_ip}:{path}"

        now = time.time()
        window_start = now - window_seconds

        is_exceeded = False
        retry_after = window_seconds

        if redis_client:
            try:
                pipeline = redis_client.pipeline()
                pipeline.zremrangebyscore(rate_key, 0, window_start)
                pipeline.zadd(rate_key, {str(now): now})
                pipeline.zcard(rate_key)
                pipeline.expire(rate_key, window_seconds)
                results = pipeline.execute()

                current_count = results[2]
                if current_count > max_requests:
                    is_exceeded = True

                    # Calculate oldest timestamp score in current window
                    oldest_scores = redis_client.zrange(rate_key, 0, 0, withscores=True)
                    if oldest_scores:
                        oldest_ts = oldest_scores[0][1]
                        retry_after = max(1, int(oldest_ts + window_seconds - now))
            except Exception as redis_err:
                logger.warning(f"Redis rate limit query failed: {redis_err}; using in-memory fallback")
                is_exceeded, retry_after = self._check_inmemory(rate_key, max_requests, window_seconds, now)
        else:
            is_exceeded, retry_after = self._check_inmemory(rate_key, max_requests, window_seconds, now)

        if is_exceeded:
            logger.warning(
                f"Rate limit exceeded for IP {client_ip} on {path} "
                f"({max_requests} req / {window_seconds}s). Retry after {retry_after}s"
            )
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(retry_after)},
                content={
                    "status": "error",
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Please try again later.",
                    },
                },
            )

        return await call_next(request)

    def _check_inmemory(
        self, key: str, max_requests: int, window_seconds: int, now: float
    ) -> Tuple[bool, int]:
        window_start = now - window_seconds
        timestamps = [ts for ts in _inmemory_store[key] if ts > window_start]
        timestamps.append(now)
        _inmemory_store[key] = timestamps

        if len(timestamps) > max_requests:
            oldest_ts = timestamps[0]
            retry_after = max(1, int(oldest_ts + window_seconds - now))
            return True, retry_after

        return False, 0
