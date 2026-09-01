"""
Security & Authentication Utilities.
Provides password hashing via passlib (bcrypt), JWT access and refresh token generation,
token decoding, and claim validation.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import bcrypt
from jose import jwt, JWTError

# Patch passlib 1.7.4 incompatibility with bcrypt >= 4.0 72-byte check
if not hasattr(bcrypt, "__about__"):
    class About:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = About()

_orig_hashpw = bcrypt.hashpw
def _safe_hashpw(password: bytes, salt: bytes) -> bytes:
    if isinstance(password, bytes) and len(password) > 72:
        password = password[:72]
    return _orig_hashpw(password, salt)
bcrypt.hashpw = _safe_hashpw

from passlib.context import CryptContext

from app.core.config import settings
from app.core.exceptions import UnauthorizedException

logger = logging.getLogger("kintsugi.security")

# CryptContext configured with bcrypt scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt (safely truncated to 72 bytes).
    """
    pwd_bytes = password.encode("utf-8")[:72]
    return pwd_context.hash(pwd_bytes.decode("utf-8", errors="ignore"))


# Alias for backward compatibility
get_password_hash = hash_password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a bcrypt hash in constant time.
    """
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return pwd_context.verify(pwd_bytes.decode("utf-8", errors="ignore"), hashed_password)
    except Exception as err:
        logger.error(f"Error during password verification: {err}")
        return False


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generates a signed JWT access token.
    Claims: sub, exp, iat, token_type="access"
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "token_type": "access",
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generates a signed JWT refresh token.
    Claims: sub, exp, iat, token_type="refresh"
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "token_type": "refresh",
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str, expected_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Decodes and validates a JWT token signature, expiration, and token_type claim.
    Raises UnauthorizedException on failure.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_type = payload.get("token_type") or payload.get("type")

        if expected_type and token_type != expected_type:
            raise UnauthorizedException(
                message=f"Invalid token type '{token_type}', expected '{expected_type}'"
            )

        subject = payload.get("sub")
        if not subject:
            raise UnauthorizedException(message="Token missing subject claim")

        return payload
    except JWTError as jwt_err:
        logger.warning(f"JWT decode failed: {jwt_err}")
        raise UnauthorizedException(message="Could not validate credentials or token expired") from jwt_err
