"""
Password Reset Business Service.
Handles cryptographically secure OTP generation, hashed OTP storage, 10-minute expirations,
rate-limiting, reset-token JWT issuance, password history checks, session invalidations, and audit logging.
"""
import re
import secrets
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, func, desc, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.password_reset_request import PasswordResetRequest, PasswordResetStatus
from app.models.password_history import PasswordHistory
from app.models.security_audit_log import SecurityAuditLog
from app.services.email_service import email_service
from app.repositories.user_repository import user_repository

logger = logging.getLogger("kintsugi.services.password_reset")


class PasswordResetService:
    """
    Orchestrates secure password recovery, rate-limiting, OTP validation, and password updates.
    """
    def _validate_password_complexity(self, password: str) -> None:
        """
        Validates that new password meets strict security rules:
        - Minimum 12 characters
        - Uppercase letter
        - Lowercase letter
        - Number
        - Special character
        """
        if len(password) < 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 12 characters long."
            )
        if not re.search(r"[A-Z]", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter."
            )
        if not re.search(r"[a-z]", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter."
            )
        if not re.search(r"\d", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one number."
            )
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one special character."
            )

    def request_otp(
        self,
        db: Session,
        email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """
        Generates 6-digit numeric OTP, saves SHA256 hash, enforces rate-limiting, and sends email.
        Always returns generic 200 OK message to prevent email enumeration.
        """
        clean_email = email.strip().lower()
        now = datetime.now(timezone.utc)
        thirty_mins_ago = now - timedelta(minutes=30)

        # 1. Rate Limiting Check: Max 3 requests per 30 minutes per email or IP
        stmt_count = select(func.count(PasswordResetRequest.id)).where(
            (PasswordResetRequest.email == clean_email) | (PasswordResetRequest.ip_address == ip_address),
            PasswordResetRequest.created_at >= thirty_mins_ago
        )
        recent_count = db.scalar(stmt_count) or 0
        if recent_count >= 3:
            logger.warning(f"Rate limit exceeded for forgot-password: email={clean_email}, ip={ip_address}")
            # Audit log
            audit = SecurityAuditLog(
                action="OTP_RATE_LIMIT_EXCEEDED",
                ip_address=ip_address,
                user_agent=user_agent,
                details=f"Rate limit exceeded for email: {clean_email}"
            )
            db.add(audit)
            db.commit()
            return {"success": True, "message": "If an account exists, a verification code has been sent."}

        # 2. Check if user exists
        user = user_repository.get_by_email(db, email=clean_email)
        if not user or not user.is_active:
            logger.info(f"Forgot password requested for non-existent or inactive email: {clean_email}")
            return {"success": True, "message": "If an account exists, a verification code has been sent."}

        # 3. Generate Cryptographically Secure 6-digit numeric OTP
        raw_otp = str(secrets.randbelow(900000) + 100000)
        otp_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()
        expires_at = now + timedelta(minutes=10)

        # 4. Save Request Record
        reset_req = PasswordResetRequest(
            user_id=user.id,
            email=clean_email,
            otp_hash=otp_hash,
            expires_at=expires_at,
            attempts=0,
            max_attempts=5,
            status=PasswordResetStatus.PENDING,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(reset_req)

        # Audit log
        audit = SecurityAuditLog(
            user_id=user.id,
            action="OTP_REQUESTED",
            ip_address=ip_address,
            user_agent=user_agent,
            details=f"OTP requested for email: {clean_email}"
        )
        db.add(audit)
        db.commit()

        # 5. Send OTP Email
        email_service.send_forgot_password_otp(clean_email, raw_otp)
        return {"success": True, "message": "If an account exists, a verification code has been sent."}

    def verify_otp(
        self,
        db: Session,
        email: str,
        otp: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """
        Validates provided OTP against stored hash, enforces max attempts (5) and 10-minute expiration.
        On success, issues a temporary 10-minute Reset Token JWT (`purpose=password_reset`).
        """
        clean_email = email.strip().lower()
        now = datetime.now(timezone.utc)

        # Query latest PENDING or BLOCKED request
        stmt = select(PasswordResetRequest).where(
            PasswordResetRequest.email == clean_email,
            PasswordResetRequest.status.in_([PasswordResetStatus.PENDING, PasswordResetStatus.BLOCKED])
        ).order_by(desc(PasswordResetRequest.created_at))
        reset_req = db.scalars(stmt).first()

        if not reset_req:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pending password reset request found for this email."
            )

        if reset_req.status == PasswordResetStatus.BLOCKED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many incorrect attempts. Please request a new verification code."
            )

        req_exp = reset_req.expires_at
        if req_exp.tzinfo is None:
            req_exp = req_exp.replace(tzinfo=timezone.utc)

        if req_exp < now:
            reset_req.status = PasswordResetStatus.EXPIRED
            db.add(reset_req)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The verification code has expired. Please request a new code."
            )

        # Verify OTP Hash
        input_hash = hashlib.sha256(otp.strip().encode("utf-8")).hexdigest()
        if input_hash != reset_req.otp_hash:
            reset_req.attempts += 1
            if reset_req.attempts >= reset_req.max_attempts:
                reset_req.status = PasswordResetStatus.BLOCKED
                logger.warning(f"OTP attempts blocked for email={clean_email}")
            db.add(reset_req)

            # Audit Log
            audit = SecurityAuditLog(
                user_id=reset_req.user_id,
                action="OTP_VERIFICATION_FAILED",
                ip_address=ip_address,
                user_agent=user_agent,
                details=f"Incorrect OTP attempt ({reset_req.attempts}/{reset_req.max_attempts})"
            )
            db.add(audit)
            db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The verification code is incorrect."
            )

        # OTP Matches! Mark VERIFIED
        reset_req.status = PasswordResetStatus.VERIFIED
        reset_req.verified_at = now
        db.add(reset_req)

        # Issue 10-minute Reset Token JWT
        reset_token = create_access_token(
            subject=reset_req.user_id,
            expires_delta=timedelta(minutes=10)
        )

        audit = SecurityAuditLog(
            user_id=reset_req.user_id,
            action="OTP_VERIFIED",
            ip_address=ip_address,
            user_agent=user_agent,
            details="OTP verified successfully. Reset token issued."
        )
        db.add(audit)
        db.commit()

        return {"verified": True, "reset_token": reset_token}

    def reset_password(
        self,
        db: Session,
        reset_token: str,
        new_password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> dict:
        """
        Validates reset token, checks password complexity and history (last 5 passwords),
        updates password, revokes all active refresh tokens, and sends confirmation email.
        """
        # 1. Decode & Verify Reset Token
        try:
            payload = decode_token(reset_token, expected_type="access")
            user_id_str = payload.get("sub")
            if not user_id_str:
                raise HTTPException(status_code=401, detail="Invalid reset token.")
            user_id = int(user_id_str)
        except Exception:
            raise HTTPException(status_code=401, detail="Reset token has expired or is invalid.")

        user = user_repository.get(db, id=user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=404, detail="User account not found or inactive.")

        # 2. Validate Password Complexity
        self._validate_password_complexity(new_password)

        # 3. Password History Check (Last 5 passwords)
        # Check current password
        if verify_password(new_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your new password cannot be the same as your current password."
            )

        # Check last 5 historical passwords
        stmt_hist = select(PasswordHistory).where(
            PasswordHistory.user_id == user_id
        ).order_by(desc(PasswordHistory.created_at)).limit(5)
        history_records = db.scalars(stmt_hist).all()
        for hist in history_records:
            if verify_password(new_password, hist.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Your new password cannot be one of your last 5 previous passwords."
                )

        now = datetime.now(timezone.utc)

        # 4. Save current password to history
        old_history = PasswordHistory(
            user_id=user_id,
            password_hash=user.password_hash
        )
        db.add(old_history)

        # 5. Update user password
        user.password_hash = hash_password(new_password)
        user.password_changed_at = now
        user.last_password_reset = now
        user.failed_reset_attempts = 0
        db.add(user)

        # 6. Revoke all active refresh tokens for this user
        stmt_revoke = update(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False
        ).values(revoked=True)
        db.execute(stmt_revoke)

        # 7. Invalidate active reset requests
        stmt_req = update(PasswordResetRequest).where(
            PasswordResetRequest.user_id == user_id,
            PasswordResetRequest.status == PasswordResetStatus.VERIFIED
        ).values(status=PasswordResetStatus.USED, used_at=now)
        db.execute(stmt_req)

        # 8. Audit Log
        audit = SecurityAuditLog(
            user_id=user_id,
            action="PASSWORD_RESET_SUCCESS",
            ip_address=ip_address,
            user_agent=user_agent,
            details="Password successfully updated. All active user sessions revoked."
        )
        db.add(audit)
        db.commit()

        # 9. Send Confirmation Email
        timestamp_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")
        email_service.send_password_changed_email(
            email=user.email,
            timestamp=timestamp_str,
            ip_address=ip_address,
            user_agent=user_agent
        )

        return {"success": True, "message": "Password updated successfully."}


password_reset_service = PasswordResetService()
