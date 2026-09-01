"""
PasswordResetRequest ORM Model.
Tracks secure 6-digit numeric OTP requests, hashing, rate limits, attempt counts, and lifecycle states.
"""
import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import BigInteger, String, Enum as SQLEnum, DateTime, ForeignKey, Index, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin


class PasswordResetStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    USED = "USED"
    EXPIRED = "EXPIRED"
    BLOCKED = "BLOCKED"


class PasswordResetRequest(Base):
    """
    PasswordResetRequest entity mapped to `password_reset_requests` table.
    """
    __tablename__ = "password_reset_requests"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    otp_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    status: Mapped[PasswordResetStatus] = mapped_column(
        SQLEnum(PasswordResetStatus),
        nullable=False,
        default=PasswordResetStatus.PENDING,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="password_reset_requests")

    __table_args__ = (
        Index("idx_pwd_reset_email", "email"),
        Index("idx_pwd_reset_expires_status", "expires_at", "status"),
    )
