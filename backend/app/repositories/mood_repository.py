"""
Mood Repository.
Encapsulates database queries for daily mood entries, historical logs, and streak tracking queries.
"""
from typing import List, Optional
from datetime import date
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from app.models.mood_entry import MoodEntry
from app.repositories.base_repository import BaseRepository


class MoodRepository(BaseRepository[MoodEntry]):
    """
    Persistence operations for MoodEntry entities.
    """
    def __init__(self):
        super().__init__(MoodEntry)

    def get_history_for_user(
        self, db: Session, user_id: int, limit: int = 100, offset: int = 0
    ) -> List[MoodEntry]:
        """
        Retrieve paginated mood history for a user, ordered by entry_date descending.
        """
        stmt = (
            select(MoodEntry)
            .where(MoodEntry.user_id == user_id)
            .order_by(desc(MoodEntry.entry_date), desc(MoodEntry.created_at))
            .offset(offset)
            .limit(limit)
        )
        return list(db.scalars(stmt).all())

    def get_by_user(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[MoodEntry]:
        """
        Alias for get_history_for_user supporting legacy call signatures.
        """
        return self.get_history_for_user(db, user_id=user_id, limit=limit, offset=skip)

    def get_last_entry_date(self, db: Session, user_id: int) -> Optional[date]:
        """
        Retrieve the most recent entry_date logged by the user for streak calculation.
        """
        stmt = (
            select(MoodEntry.entry_date)
            .where(MoodEntry.user_id == user_id)
            .order_by(desc(MoodEntry.entry_date))
            .limit(1)
        )
        return db.scalars(stmt).first()

    def get_entries_between_dates(
        self, db: Session, user_id: int, start_date: date, end_date: date
    ) -> List[MoodEntry]:
        """
        Retrieve mood entries for a specific user within a date range (inclusive).
        """
        stmt = (
            select(MoodEntry)
            .where(
                MoodEntry.user_id == user_id,
                MoodEntry.entry_date >= start_date,
                MoodEntry.entry_date <= end_date,
            )
            .order_by(desc(MoodEntry.entry_date))
        )
        return list(db.scalars(stmt).all())

    def count_entries(self, db: Session, user_id: int) -> int:
        """
        Count total mood entries logged by a user.
        """
        stmt = (
            select(func.count())
            .select_from(MoodEntry)
            .where(MoodEntry.user_id == user_id)
        )
        return db.scalar(stmt) or 0


mood_repository = MoodRepository()
