"""
ContentItem ORM Model.
Reference data entity representing quotes, affirmations, and self-care tips.
"""
from typing import Optional
from sqlalchemy import String, Text, Boolean, Enum as SQLEnum, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, PrimaryKeyMixin
from app.core.constants import ContentType


class ContentItem(Base, PrimaryKeyMixin):
    """
    ContentItem entity mapped to `content_items` database table.
    """
    __tablename__ = "content_items"

    type: Mapped[ContentType] = mapped_column(
        SQLEnum(ContentType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    __table_args__ = (
        Index("idx_content_items_type_active", "type", "is_active"),
    )
