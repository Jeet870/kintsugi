"""
User Repository.
Encapsulates database operations for User accounts, credential lookups, and profile management.
"""
from typing import Optional, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    Persistence operations for User entities.
    """
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """
        Retrieve a user record by email address.
        """
        stmt = select(User).where(User.email == email.strip().lower())
        return db.scalars(stmt).first()

    def get_by_uuid(self, db: Session, uuid_val: str) -> Optional[User]:
        """
        Retrieve a user record by public UUID string.
        """
        stmt = select(User).where(User.uuid == uuid_val)
        return db.scalars(stmt).first()

    def email_exists(self, db: Session, email: str) -> bool:
        """
        Check whether an email address is already registered.
        """
        stmt = select(func.count()).select_from(User).where(User.email == email.strip().lower())
        count_val = db.scalar(stmt)
        return bool(count_val and count_val > 0)

    def update_profile(self, db: Session, user: User, update_data: Dict[str, Any]) -> User:
        """
        Update user profile attributes cleanly without mutating restricted credential fields.
        """
        restricted_fields = {"id", "uuid", "password_hash", "created_at", "updated_at"}
        filtered_data = {k: v for k, v in update_data.items() if k not in restricted_fields and v is not None}
        return self.update(db, db_obj=user, obj_in=filtered_data)


user_repository = UserRepository()
