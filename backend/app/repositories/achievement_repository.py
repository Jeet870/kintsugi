"""
Achievement Repository.
Encapsulates database operations for catalog achievement definitions and user achievement awards.
"""
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.achievement import Achievement
from app.models.user_achievement import UserAchievement
from app.repositories.base_repository import BaseRepository


class AchievementRepository(BaseRepository[Achievement]):
    """
    Persistence operations for Achievement definitions and user awards.
    """
    def __init__(self):
        super().__init__(Achievement)

    def get_by_code(self, db: Session, code: str) -> Optional[Achievement]:
        """
        Retrieve an achievement catalog item by its stable code identifier.
        """
        stmt = select(Achievement).where(Achievement.code == code)
        return db.scalars(stmt).first()

    def has_achievement(self, db: Session, user_id: int, achievement_code: str) -> bool:
        """
        Check if a user has already been awarded a specific achievement by code.
        """
        achievement = self.get_by_code(db, achievement_code)
        if not achievement:
            return False

        stmt = select(func.count()).select_from(UserAchievement).where(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement.id,
        )
        count_val = db.scalar(stmt)
        return bool(count_val and count_val > 0)

    def award_if_missing(
        self, db: Session, user_id: int, achievement_code: str
    ) -> Optional[UserAchievement]:
        """
        Idempotently award an achievement to a user if not already earned.
        If already present, returns the existing UserAchievement without creating a duplicate.
        """
        achievement = self.get_by_code(db, achievement_code)
        if not achievement:
            return None

        # Check existing award
        stmt = select(UserAchievement).where(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement.id,
        )
        existing = db.scalars(stmt).first()
        if existing:
            return existing

        # Insert new award
        award = UserAchievement(user_id=user_id, achievement_id=achievement.id)
        db.add(award)
        db.commit()
        db.refresh(award)
        return award

    def get_user_achievements(self, db: Session, user_id: int) -> List[UserAchievement]:
        """
        Retrieve all achievements earned by a specific user.
        """
        stmt = (
            select(UserAchievement)
            .where(UserAchievement.user_id == user_id)
            .order_by(UserAchievement.earned_at.desc())
        )
        return list(db.scalars(stmt).all())


achievement_repository = AchievementRepository()
