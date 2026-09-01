"""
Reusable FastAPI Dependency Injection Module.
Re-exports database session generator, authenticates current user via OAuth2 Bearer token,
validates active user status, and provides endpoint rate-limiting dependencies.
"""
import time
import logging
from typing import Generator, Dict, Tuple, Optional
from collections import defaultdict
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import get_db as get_db
from app.core.config import settings
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException, AppException
from app.models.user import User

logger = logging.getLogger("kintsugi.deps")

# OAuth2 Password Bearer scheme reading token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Decodes Bearer JWT token, validates subject & token_type, and retrieves User entity from database.
    Raises UnauthorizedException on invalid/expired token or missing user.
    """
    payload = decode_token(token, expected_type="access")
    user_id_str: str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException(message="Token payload contains no subject claim.")

    try:
        user_id = int(user_id_str)
    except ValueError:
        user = db.query(User).filter(User.uuid == user_id_str).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise UnauthorizedException(message="User associated with this token no longer exists.")

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Verifies that the authenticated user's account is active.
    Raises ForbiddenException if account has been deactivated.
    """
    if not current_user.is_active:
        raise ForbiddenException(message="User account is inactive. Please contact support.")
    return current_user


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)),
) -> Optional[User]:
    """
    Attempts to decode user token if present, returns None if unauthenticated.
    """
    if not token:
        return None
    try:
        return get_current_user(db=db, token=token)
    except Exception:
        return None


class RateLimiterDependency:
    """
    In-memory Sliding Window Rate Limiter dependency for sensitive API endpoints.
    """
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.history: Dict[str, list] = defaultdict(list)

    def __call__(self, request: Request) -> None:
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - 60.0

        # Prune request timestamps older than 60 seconds
        timestamps = [ts for ts in self.history[client_ip] if ts > window_start]
        self.history[client_ip] = timestamps

        if len(timestamps) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for IP {client_ip} on path {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
            )

        self.history[client_ip].append(now)


# Standard rate limiter instances
standard_rate_limiter = RateLimiterDependency(requests_per_minute=60)
sensitive_rate_limiter = RateLimiterDependency(requests_per_minute=10)
