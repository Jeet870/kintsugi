"""
User ORM Model.
Represents primary user entity, authentication credentials, profile information, preferences, and account status.
"""
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Boolean, Enum, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin, TimestampMixin


class User(Base, PrimaryKeyMixin, TimestampMixin):
    """
    User entity mapped to the `users` database table.
    Root entity owning user-scoped domain resources.
    """
    __tablename__ = "users"

    uuid: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    theme_preference: Mapped[str] = mapped_column(
        Enum("light", "dark", name="theme_enum"),
        nullable=False,
        default="dark",
    )
    notification_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    password_changed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_reset_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_password_reset: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Owned Bidirectional Relationships
    mood_entries: Mapped[List["MoodEntry"]] = relationship("MoodEntry", back_populates="user", cascade="all, delete-orphan")
    journal_entries: Mapped[List["JournalEntry"]] = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    chat_sessions: Mapped[List["ChatSession"]] = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    crisis_logs: Mapped[List["CrisisLog"]] = relationship("CrisisLog", back_populates="user", cascade="all, delete-orphan")
    mood_streak: Mapped[Optional["MoodStreak"]] = relationship("MoodStreak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    achievements: Mapped[List["UserAchievement"]] = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    password_reset_requests: Mapped[List["PasswordResetRequest"]] = relationship("PasswordResetRequest", back_populates="user", cascade="all, delete-orphan")
    password_history: Mapped[List["PasswordHistory"]] = relationship("PasswordHistory", back_populates="user", cascade="all, delete-orphan")
    security_audit_logs: Mapped[List["SecurityAuditLog"]] = relationship("SecurityAuditLog", back_populates="user")
