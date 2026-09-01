"""
UserAchievement ORM Model.
Join table entity recording user achievement awards and earned timestamps.
"""
from datetime import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin


class UserAchievement(Base, PrimaryKeyMixin):
    """
    UserAchievement entity mapped to `user_achievements` database table.
    Links users to achievements with earned timestamps.
    """
    __tablename__ = "user_achievements"

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    achievement_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("achievements.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    earned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship("Achievement", back_populates="user_achievements")

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uk_user_achievement"),
        Index("idx_user_achievements_user_id", "user_id"),
        Index("idx_user_achievements_achievement_id", "achievement_id"),
    )
