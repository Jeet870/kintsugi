"""
PasswordHistory ORM Model.
Stores hashed historical passwords to enforce password reuse prevention (last 5 passwords).
"""
from datetime import datetime
from sqlalchemy import BigInteger, String, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin


class PasswordHistory(Base, PrimaryKeyMixin):
    """
    PasswordHistory entity mapped to `password_history` database table.
    """
    __tablename__ = "password_history"

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="password_history")

    __table_args__ = (
        Index("idx_password_history_user_id", "user_id"),
    )
