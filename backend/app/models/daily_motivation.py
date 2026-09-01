"""
DailyMotivation ORM Model.
Persists automated daily motivation bundles (quote, affirmations, tips) per user per calendar day.
"""
from datetime import date, datetime, timezone
from typing import Any, List, Dict, Optional
from sqlalchemy import Date, DateTime, ForeignKey, String, Text, JSON, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin


class DailyMotivation(Base, PrimaryKeyMixin):
    """
    DailyMotivation entity mapped to `daily_motivations` database table.
    Guarantees exactly one entry per user per day via UniqueConstraint(user_id, content_date).
    """
    __tablename__ = "daily_motivations"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).date(),
    )
    quote: Mapped[str] = mapped_column(Text, nullable=False)
    quote_author: Mapped[str] = mapped_column(String(255), nullable=False, default="Kintsugi AI")
    quote_category: Mapped[str] = mapped_column(String(100), nullable=False, default="hope")
    affirmations: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False)
    self_care_tips: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("user_id", "content_date", name="uq_user_daily_motivation"),
        Index("idx_daily_motivation_user_date", "user_id", "content_date"),
    )
