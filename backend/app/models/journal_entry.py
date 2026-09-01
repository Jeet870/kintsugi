"""
JournalEntry ORM Model.
Represents personal journal entry authored by a user.
Content field stores ciphertext string; encryption and decryption are handled exclusively by JournalService.
"""
from typing import Optional
from sqlalchemy import BigInteger, String, Text, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, PrimaryKeyMixin, TimestampMixin


class JournalEntry(Base, PrimaryKeyMixin, TimestampMixin):
    """
    JournalEntry entity mapped to `journal_entries` database table.
    """
    __tablename__ = "journal_entries"

    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    mood_tag: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="Calm")
    ai_reflection: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_encrypted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="journal_entries")

    __table_args__ = (
        Index("idx_journal_entries_user_id", "user_id"),
    )
