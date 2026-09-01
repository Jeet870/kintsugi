"""
Journal Repository.
Encapsulates database operations for encrypted journal entries, strictly enforcing user ownership boundaries on every query.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.models.journal_entry import JournalEntry
from app.repositories.base_repository import BaseRepository


class JournalRepository(BaseRepository[JournalEntry]):
    """
    Persistence operations for JournalEntry entities with strict user ownership scoping.
    """
    def __init__(self):
        super().__init__(JournalEntry)

    def get_by_user(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[JournalEntry]:
        """
        Retrieve paginated journal entries authored strictly by the specified user.
        """
        stmt = (
            select(JournalEntry)
            .where(JournalEntry.user_id == user_id)
            .order_by(desc(JournalEntry.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(stmt).all())

    def get_entry(self, db: Session, entry_id: int, user_id: int) -> Optional[JournalEntry]:
        """
        Fetch a specific journal entry by ID, guaranteeing ownership by user_id.
        """
        stmt = select(JournalEntry).where(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == user_id,
        )
        return db.scalars(stmt).first()

    def create_entry(self, db: Session, user_id: int, obj_in: Dict[str, Any]) -> JournalEntry:
        """
        Create a new journal entry bound to the target user.
        """
        entry_data = dict(obj_in)
        entry_data["user_id"] = user_id
        return self.create(db, obj_in=entry_data)

    def update_entry(
        self, db: Session, entry_id: int, user_id: int, obj_in: Dict[str, Any]
    ) -> Optional[JournalEntry]:
        """
        Update an existing journal entry owned by the user.
        """
        entry = self.get_entry(db, entry_id=entry_id, user_id=user_id)
        if not entry:
            return None
        filtered_data = {k: v for k, v in obj_in.items() if k != "user_id" and v is not None}
        return self.update(db, db_obj=entry, obj_in=filtered_data)

    def delete_entry(self, db: Session, entry_id: int, user_id: int) -> bool:
        """
        Delete a journal entry owned by the specified user.
        """
        entry = self.get_entry(db, entry_id=entry_id, user_id=user_id)
        if not entry:
            return False
        db.delete(entry)
        db.commit()
        return True


journal_repository = JournalRepository()
