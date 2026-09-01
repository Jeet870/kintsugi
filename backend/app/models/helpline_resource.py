"""
HelplineResource ORM Model.
Reference entity representing country-specific emergency helpline directories.
"""
from typing import Optional
from sqlalchemy import String, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, PrimaryKeyMixin


class HelplineResource(Base, PrimaryKeyMixin):
    """
    HelplineResource entity mapped to `helpline_resources` database table.
    """
    __tablename__ = "helpline_resources"

    country_code: Mapped[str] = mapped_column(String(5), nullable=False, default="IN")
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    available_hours: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    __table_args__ = (
        Index("idx_helpline_resources_country_active", "country_code", "is_active"),
    )
