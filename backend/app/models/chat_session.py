"""
ChatSession ORM Model.
Represents conversation session between user and AI companion, tracking lifecycle state, session titles, and grouping related chat messages.
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import BigInteger, ForeignKey, Enum as SQLEnum, DateTime, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin
from app.core.constants import ChatSessionStatus


class ChatSession(Base, PrimaryKeyMixin):
    """
    ChatSession entity mapped to `chat_sessions` database table.
    """
    __tablename__ = "chat_sessions"

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    status: Mapped[ChatSessionStatus] = mapped_column(
        SQLEnum(ChatSessionStatus, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=ChatSessionStatus.ACTIVE,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="chat_sessions")
    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at.asc()",
    )
    crisis_logs: Mapped[List["CrisisLog"]] = relationship("CrisisLog", back_populates="session")

    __table_args__ = (
        Index("idx_chat_sessions_user_id", "user_id"),
    )
