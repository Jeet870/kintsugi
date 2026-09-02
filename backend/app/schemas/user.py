"""
User Authentication & Profile Schemas.
Defines Pydantic v2 validation models for registration, authentication, profile updates, and JWT token responses.
"""
import re
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator


class UserBase(BaseModel):
    """
    Base user model holding shared user attributes.
    """
    name: str = Field(..., min_length=1, max_length=100, description="User full name")
    email: EmailStr = Field(..., description="User email address")


class UserCreate(UserBase):
    """
    Request payload for user registration.
    """
    password: str = Field(..., min_length=8, max_length=100, description="Plaintext password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("name", mode="before")
    @classmethod
    def trim_name(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserLogin(BaseModel):
    """
    Request payload for user login.
    """
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class UserUpdate(BaseModel):
    """
    Request payload for updating user profile information.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated name")
    email: Optional[EmailStr] = Field(None, description="Updated email address")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Updated avatar URL")
    theme_preference: Optional[str] = Field(None, description="Theme preference ('light' or 'dark')")
    notification_enabled: Optional[bool] = Field(None, description="Enable or disable notifications")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("name", mode="before")
    @classmethod
    def trim_name(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip()
        return v


class UserOut(BaseModel):
    """
    Public user representation payload.
    Excludes sensitive credential information such as password hashes and tokens.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="User database ID")
    uuid: str = Field(..., description="Public user UUID")
    name: str = Field(..., description="User full name")
    email: EmailStr = Field(..., description="User email address")
    avatar_url: Optional[str] = Field(None, description="User avatar URL")
    theme_preference: str = Field("light", description="User UI theme preference")
    notification_enabled: bool = Field(True, description="Notification preference flag")
    is_active: bool = Field(True, description="Account active status")
    last_login_at: Optional[datetime] = Field(None, description="Timestamp of last login")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Account update timestamp")


# Alias for backward compatibility
UserResponse = UserOut


class TokenPair(BaseModel):
    """
    JWT Access and Refresh token pair response payload.
    """
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(3600, description="Access token expiration time in seconds")


# Alias for backward compatibility
Token = TokenPair


class TokenPayload(BaseModel):
    """
    Internal claims payload extracted from a decoded JWT access token.
    """
    sub: Optional[str] = Field(None, description="Subject (user ID or UUID)")
    exp: Optional[int] = Field(None, description="Expiration UNIX timestamp")


class RefreshTokenRequest(BaseModel):
    """
    Request payload for refreshing or revoking tokens.
    """
    refresh_token: str = Field(..., description="JWT refresh token string")


class OAuth2LoginRequest(BaseModel):
    """
    Request payload for OAuth2 authentication flow (Google, GitHub, etc.).
    Requires a valid OAuth2 token issued by Google or GitHub for server-side identity verification.
    """
    provider: str = Field(..., description="OAuth2 provider name e.g. 'google', 'github'")
    token: str = Field(..., min_length=1, description="OAuth2 ID token or Access token from provider")
    email: Optional[EmailStr] = Field(None, description="Optional client email hint (verified server-side)")
    name: Optional[str] = Field(None, description="Optional user full name")
    avatar_url: Optional[str] = Field(None, description="Optional user avatar URL")
    provider_id: Optional[str] = Field(None, description="Provider subject ID")


class GitHubCodeExchangeRequest(BaseModel):
    """
    Request payload for exchanging a GitHub OAuth authorization code for a session token pair.
    """
    code: str = Field(..., min_length=1, description="GitHub OAuth authorization code")


