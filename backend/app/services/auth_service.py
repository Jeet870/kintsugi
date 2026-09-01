"""
Authentication & Session Management Service.
Handles user registration, authentication, JWT token issuance, refresh token rotation, and token revocation.
"""
import hashlib
import logging
from typing import Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import (
    UnauthorizedException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.user import UserCreate, TokenPair
from app.repositories.user_repository import user_repository

logger = logging.getLogger("kintsugi.services.auth")


class AuthService:
    """
    Business service orchestrating user authentication, JWT session security, and refresh token rotation.
    """
    def register_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Registers a new user account if the email is available.
        """
        email_clean = user_in.email.strip().lower()
        if user_repository.email_exists(db, email=email_clean):
            logger.warning(f"Registration conflict for existing email: {email_clean}")
            raise ConflictException("A user with this email address already exists")

        hashed_pwd = hash_password(user_in.password)
        user_data = {
            "email": email_clean,
            "name": user_in.name.strip(),
            "password_hash": hashed_pwd,
        }
        user = user_repository.create(db, obj_in=user_data)
        logger.info(f"User registered successfully: id={user.id}")
        return user

    def authenticate_user(self, db: Session, email: str, password: str) -> User:
        """
        Authenticates user credentials and validates account active status.
        """
        email_clean = email.strip().lower()
        user = user_repository.get_by_email(db, email=email_clean)
        if not user or not verify_password(password, user.password_hash):
            logger.warning(f"Failed authentication attempt for email: {email_clean}")
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            logger.warning(f"Authentication rejected for inactive user id={user.id}")
            raise ForbiddenException("User account is inactive")

        # Update last login timestamp
        user_repository.update(db, db_obj=user, obj_in={"last_login_at": datetime.now(timezone.utc)})
        logger.info(f"User authenticated successfully: id={user.id}")
        return user

    def issue_token_pair(self, db: Session, user: User) -> TokenPair:
        """
        Generates JWT access and refresh tokens, persisting only the hashed refresh token.
        """
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        # Hash refresh token before saving to database
        token_hash = hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        refresh_record = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            revoked=False,
        )
        db.add(refresh_record)
        db.commit()

        expires_in_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=expires_in_seconds,
        )

    def refresh_access_token(self, db: Session, refresh_token: str) -> TokenPair:
        """
        Validates refresh token, enforces token rotation, revokes old token, and issues new TokenPair.
        """
        payload = decode_token(refresh_token, expected_type="refresh")
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise UnauthorizedException("Invalid refresh token claims")
        user_id = int(user_id_str)

        token_hash = hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()

        # Query active matching refresh token record
        stmt = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False,
        )
        token_record = db.scalars(stmt).first()

        if not token_record:
            logger.warning(f"Refresh token reuse or invalid token hash for user id={user_id}")
            raise UnauthorizedException("Invalid or revoked refresh token")

        now = datetime.now(timezone.utc)
        record_exp = token_record.expires_at
        if record_exp.tzinfo is None:
            record_exp = record_exp.replace(tzinfo=timezone.utc)

        if record_exp < now:
            logger.warning(f"Expired refresh token attempt for user id={user_id}")
            raise UnauthorizedException("Refresh token has expired")

        # Enforce Token Rotation: Revoke old token
        token_record.revoked = True
        db.add(token_record)
        db.commit()

        user = user_repository.get(db, id=user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User account not found or inactive")

        # Issue new token pair
        return self.issue_token_pair(db, user)

    def revoke_refresh_token(self, db: Session, refresh_token: str) -> bool:
        """
        Revokes a refresh token, disabling future reuse.
        """
        try:
            token_hash = hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()
            stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
            token_record = db.scalars(stmt).first()
            if token_record:
                token_record.revoked = True
                db.add(token_record)
                db.commit()
                return True
        except Exception as err:
            logger.warning(f"Error revoking refresh token: {err}")
        return False

    def authenticate_oauth_user(
        self,
        db: Session,
        provider: str,
        email: str,
        name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        provider_id: Optional[str] = None,
    ) -> User:
        """
        Authenticates or provisions a user authenticated via OAuth2 (Google, GitHub, etc.).
        If the user with matching email exists, connects/updates profile and returns the user.
        If user does not exist, registers a new OAuth2 account and returns the user.
        """
        email_clean = email.strip().lower()
        user = user_repository.get_by_email(db, email=email_clean)

        if user:
            if not user.is_active:
                logger.warning(f"OAuth authentication rejected for inactive user id={user.id}")
                raise ForbiddenException("User account is inactive")

            updates = {"last_login_at": datetime.now(timezone.utc)}
            if avatar_url and not user.avatar_url:
                updates["avatar_url"] = avatar_url
            if name and not user.name:
                updates["name"] = name.strip()

            user = user_repository.update(db, db_obj=user, obj_in=updates)
            logger.info(f"Existing user authenticated via OAuth ({provider}): id={user.id}")
            return user

        # Provision new user for OAuth login
        random_password = hash_password(f"OAuth2_{provider}_{email_clean}_{datetime.now(timezone.utc).timestamp()}")
        user_name = name.strip() if name else email_clean.split("@")[0].capitalize()
        user_data = {
            "email": email_clean,
            "name": user_name,
            "password_hash": random_password,
            "avatar_url": avatar_url,
        }
        user = user_repository.create(db, obj_in=user_data)
        logger.info(f"New user provisioned via OAuth ({provider}): id={user.id}")
        return user


auth_service = AuthService()

