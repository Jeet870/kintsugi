"""
MoodEntry ORM Model.
Represents daily user mood check-in, optional note, AI supportive message, entry date, and composite index on (user_id, entry_date).
"""
from datetime import date, datetime
from typing import Optional
from sqlalchemy import BigInteger, Date, Text, ForeignKey, Enum as SQLEnum, Index, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin
from app.core.constants import MoodType


class MoodEntry(Base, PrimaryKeyMixin):
    """
    MoodEntry entity mapped to `mood_entries` database table.
    """
    __tablename__ = "mood_entries"

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mood_type: Mapped[MoodType] = mapped_column(
        SQLEnum(MoodType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mood_entries")

    __table_args__ = (
        Index("idx_mood_entries_user_entry_date", "user_id", "entry_date"),
    )
