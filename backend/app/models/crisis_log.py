"""
CrisisLog ORM Model.
Represents immutable audit record for every crisis detection event, decoupled from chat retention policies.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import BigInteger, String, ForeignKey, DateTime, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin


class CrisisLog(Base, PrimaryKeyMixin):
    """
    CrisisLog entity mapped to `crisis_logs` database table.
    Decoupled audit trail preserving safety records independently.
    """
    __tablename__ = "crisis_logs"

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    session_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("chat_sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    message_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("chat_messages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    trigger_type: Mapped[str] = mapped_column(String(100), nullable=False)
    action_taken: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="crisis_logs")
    session: Mapped[Optional["ChatSession"]] = relationship("ChatSession", back_populates="crisis_logs")
    message: Mapped[Optional["ChatMessage"]] = relationship("ChatMessage", back_populates="crisis_logs")

    __table_args__ = (
        Index("idx_crisis_logs_user_id", "user_id"),
        Index("idx_crisis_logs_session_id", "session_id"),
        Index("idx_crisis_logs_message_id", "message_id"),
    )
