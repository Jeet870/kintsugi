"""
Achievement ORM Model.
Master catalog entity defining achievement badge metadata and stable identifier codes.
"""
from typing import List, Optional
from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin


class Achievement(Base, PrimaryKeyMixin):
    """
    Achievement entity mapped to `achievements` database table.
    Defines reference achievement badge catalog data.
    """
    __tablename__ = "achievements"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    icon_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user_achievements: Mapped[List["UserAchievement"]] = relationship(
        "UserAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("code", name="uk_achievements_code"),
    )
