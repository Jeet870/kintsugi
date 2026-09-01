"""
Achievement & Gamification Service.
Evaluates user activity milestones (streaks, journal entries, mood check-ins) and idempotently awards badges.
"""
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.achievement import Achievement
from app.models.user_achievement import UserAchievement
from app.repositories.achievement_repository import achievement_repository

logger = logging.getLogger("kintsugi.services.achievement")


class AchievementService:
    """
    Business service evaluating milestone thresholds and awarding catalog badges.
    """
    def evaluate_and_award(
        self, db: Session, user_id: int, trigger_context: Optional[Dict[str, Any]] = None
    ) -> List[UserAchievement]:
        """
        Evaluates trigger context metrics against the achievements catalog and awards qualifying badges idempotently.
        """
        context = trigger_context or {}
        awarded_badges: List[UserAchievement] = []

        action = context.get("action")
        streak_count = context.get("streak_count", 0)
        journal_count = context.get("journal_count", 0)
        mood_count = context.get("mood_count", 0)
        chat_count = context.get("chat_count", 0)

        # Milestone Rules Mapping
        candidate_codes = []

        if action == "mood_logged" or mood_count >= 1:
            candidate_codes.append("first_mood_logged")

        if action == "journal_created" or journal_count >= 1:
            candidate_codes.append("first_journal_entry")

        if journal_count >= 10:
            candidate_codes.append("wellness_seeker")

        if action == "chat_turn" or chat_count >= 5:
            candidate_codes.append("companion_chatter")

        if streak_count >= 7:
            candidate_codes.append("7_day_streak")
        if streak_count >= 30:
            candidate_codes.append("30_day_streak")
        if streak_count >= 100:
            candidate_codes.append("100_day_streak")

        for code in candidate_codes:
            badge = achievement_repository.award_if_missing(db, user_id=user_id, achievement_code=code)
            if badge:
                awarded_badges.append(badge)

        return awarded_badges

    def get_user_badges(self, db: Session, user_id: int) -> List[UserAchievement]:
        """
        Retrieves all badges unlocked by a user.
        """
        return achievement_repository.get_user_achievements(db, user_id=user_id)

    def get_catalog(self, db: Session) -> List[Achievement]:
        """
        Retrieves the complete catalog of achievement definitions.
        """
        return achievement_repository.get_multi(db, skip=0, limit=1000)


achievement_service = AchievementService()
