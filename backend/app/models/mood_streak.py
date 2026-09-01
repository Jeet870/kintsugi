"""
MoodStreak ORM Model.
Tracks a user's mood logging streak, including current streak count, longest streak achieved, and last logged date.
"""
from datetime import date
from typing import Optional
from sqlalchemy import BigInteger, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin, TimestampMixin


class MoodStreak(Base, PrimaryKeyMixin, TimestampMixin):
    """
    MoodStreak entity mapped to `mood_streaks` database table.
    Maintains a strict one-to-one relationship with `User`.
    """
    __tablename__ = "mood_streaks"

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    current_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_logged_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mood_streak")

    __table_args__ = (
        UniqueConstraint("user_id", name="uk_mood_streaks_user_id"),
    )
