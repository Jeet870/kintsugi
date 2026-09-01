"""
SecurityAuditLog ORM Model.
Comprehensive audit log of security events (OTP request, verification, password changes, token revocations).
"""
from typing import Optional
from datetime import datetime
from sqlalchemy import BigInteger, String, Text, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin


class SecurityAuditLog(Base, PrimaryKeyMixin):
    """
    SecurityAuditLog entity mapped to `security_audit_logs` database table.
    """
    __tablename__ = "security_audit_logs"

    user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="security_audit_logs")

    __table_args__ = (
        Index("idx_security_audit_logs_user_id", "user_id"),
        Index("idx_security_audit_logs_action", "action"),
    )
