"""
ChatMessage ORM Model.
Represents single message exchanged within a chat session, storing sender, content, crisis flag status, and timestamps.
"""
from datetime import datetime
from typing import List
from sqlalchemy import BigInteger, Text, Boolean, ForeignKey, Enum as SQLEnum, DateTime, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin
from app.core.constants import ChatSender


class ChatMessage(Base, PrimaryKeyMixin):
    """
    ChatMessage entity mapped to `chat_messages` database table.
    """
    __tablename__ = "chat_messages"

    session_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender: Mapped[ChatSender] = mapped_column(
        SQLEnum(ChatSender, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    flagged_crisis: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
    crisis_logs: Mapped[List["CrisisLog"]] = relationship("CrisisLog", back_populates="message")

    __table_args__ = (
        Index("idx_chat_messages_session_id", "session_id"),
        Index("idx_chat_messages_session_created", "session_id", "created_at"),
    )
