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
        if not user:
            logger.warning(f"Authentication attempt for non-existent email: {email_clean}")
            raise UnauthorizedException("No account found with this email address. Please register first.")

        if not verify_password(password, user.password_hash):
            logger.warning(f"Failed authentication attempt for email: {email_clean}")
            raise UnauthorizedException("Incorrect password. Please verify your password and try again.")

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
        token: str,
        email: Optional[str] = None,
        name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        provider_id: Optional[str] = None,
    ) -> User:
        """
        Authenticates or provisions a user authenticated via OAuth2 (Google, GitHub, etc.).
        Validates provider identity and tokens exclusively via official OAuth verification APIs.
        """
        if not token or not token.strip():
            raise UnauthorizedException(
                "OAuth2 authentication requires a valid OAuth token issued by the provider (Google/GitHub)."
            )

        provider_clean = provider.strip().lower()
        verified_email: Optional[str] = email.strip().lower() if email else None
        verified_name: Optional[str] = name.strip() if name else None
        verified_avatar: Optional[str] = avatar_url

        import httpx

        if provider_clean == "google":
            try:
                # 1. Try Google tokeninfo for ID token validation
                resp = httpx.get(
                    f"https://oauth2.googleapis.com/tokeninfo?id_token={token}",
                    timeout=10.0
                )
                if resp.status_code != 200:
                    # 2. Try Google userinfo for access token validation
                    resp = httpx.get(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        headers={"Authorization": f"Bearer {token}"},
                        timeout=10.0
                    )
                
                if resp.status_code == 200:
                    data = resp.json()
                    verified_email = data.get("email") or verified_email
                    verified_name = data.get("name") or verified_name
                    verified_avatar = data.get("picture") or verified_avatar
                    
                    email_verified = data.get("email_verified")
                    if email_verified is False or str(email_verified).lower() == "false":
                        raise UnauthorizedException("Google email address is not verified by Google.")
                else:
                    logger.warning(f"Google OAuth token verification failed: status={resp.status_code}")
                    raise UnauthorizedException("Invalid or expired Google OAuth credential. Failed Google identity verification.")
            except Exception as err:
                if isinstance(err, UnauthorizedException):
                    raise err
                logger.error(f"Error during Google OAuth token verification: {err}")
                raise UnauthorizedException(f"Failed to verify Google OAuth credential: {err}")

        elif provider_clean == "github":
            try:
                headers = {"Authorization": f"Bearer {token}", "User-Agent": "Kintsugi-App"}
                resp = httpx.get("https://api.github.com/user", headers=headers, timeout=10.0)
                if resp.status_code == 200:
                    data = resp.json()
                    verified_email = data.get("email") or verified_email
                    verified_name = data.get("name") or data.get("login") or verified_name
                    verified_avatar = data.get("avatar_url") or verified_avatar
                    
                    # If primary email is private in GitHub settings, query /user/emails
                    if not verified_email:
                        emails_resp = httpx.get("https://api.github.com/user/emails", headers=headers, timeout=10.0)
                        if emails_resp.status_code == 200:
                            emails_data = emails_resp.json()
                            for email_obj in emails_data:
                                if email_obj.get("primary") and email_obj.get("verified"):
                                    verified_email = email_obj.get("email")
                                    break
                            if not verified_email and emails_data:
                                verified_email = emails_data[0].get("email")
                else:
                    logger.warning(f"GitHub OAuth token verification failed: status={resp.status_code}")
                    raise UnauthorizedException("Invalid or expired GitHub OAuth token. Failed GitHub identity verification.")
            except Exception as err:
                if isinstance(err, UnauthorizedException):
                    raise err
                logger.error(f"Error during GitHub OAuth token verification: {err}")
                raise UnauthorizedException(f"Failed to verify GitHub OAuth credential: {err}")
        else:
            raise UnauthorizedException(f"Unsupported OAuth provider: '{provider}'")

        if not verified_email:
            raise UnauthorizedException(
                f"OAuth verification failed: No verified email address was returned by {provider.capitalize()}."
            )

        verified_email = verified_email.strip().lower()

        user = user_repository.get_by_email(db, email=verified_email)

        if user:
            if not user.is_active:
                logger.warning(f"OAuth authentication rejected for inactive user id={user.id}")
                raise ForbiddenException("User account is inactive")

            updates = {"last_login_at": datetime.now(timezone.utc)}
            if verified_avatar and not user.avatar_url:
                updates["avatar_url"] = verified_avatar
            if verified_name and not user.name:
                updates["name"] = verified_name

            user = user_repository.update(db, db_obj=user, obj_in=updates)
            logger.info(f"Existing user authenticated via verified OAuth ({provider_clean}): id={user.id}, email={verified_email}")
            return user

        # Provision new user for verified OAuth identity
        random_password = hash_password(f"OAuth2_{provider_clean}_{verified_email}_{datetime.now(timezone.utc).timestamp()}")
        user_name = verified_name if verified_name else verified_email.split("@")[0].capitalize()
        user_data = {
            "email": verified_email,
            "name": user_name,
            "password_hash": random_password,
            "avatar_url": verified_avatar,
        }
        user = user_repository.create(db, obj_in=user_data)
        logger.info(f"New user provisioned via verified OAuth ({provider_clean}): id={user.id}, email={verified_email}")
        return user

    def exchange_github_code(self, db: Session, code: str) -> User:
        """
        Exchanges GitHub authorization code for an access token, verifies user identity, and authenticates user.
        """
        if not settings.GITHUB_CLIENT_ID:
            raise UnauthorizedException("GitHub OAuth Client ID is not configured on the backend server.")

        import httpx
        try:
            resp = httpx.post(
                "https://github.com/login/oauth/access_token",
                json={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                },
                headers={"Accept": "application/json"},
                timeout=10.0,
            )
            if resp.status_code != 200:
                raise UnauthorizedException("Failed to exchange GitHub authorization code.")

            token_data = resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                error_desc = token_data.get("error_description") or "Invalid authorization code or client secret"
                raise UnauthorizedException(f"GitHub OAuth code exchange failed: {error_desc}")

            return self.authenticate_oauth_user(db, provider="github", token=access_token)
        except Exception as err:
            if isinstance(err, UnauthorizedException):
                raise err
            logger.error(f"Error during GitHub code exchange: {err}")
            raise UnauthorizedException(f"Failed to authenticate with GitHub: {err}")


auth_service = AuthService()


