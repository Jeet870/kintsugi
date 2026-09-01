"""
Mood Streak Management Service.
Calculates current and longest streaks, resets broken streaks, handles same-day check-ins, and triggers milestone achievements.
"""
import logging
from typing import Optional
from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mood_streak import MoodStreak
from app.repositories.mood_repository import mood_repository
from app.services.achievement_service import achievement_service

logger = logging.getLogger("kintsugi.services.streak")


class StreakService:
    """
    Business service maintaining user mood-logging streaks and triggering achievement milestones.
    """
    def update_streak(self, db: Session, user_id: int) -> MoodStreak:
        """
        Recalculates a user's current and longest streak based on mood check-in history.
        Triggers achievement evaluations on streak milestone thresholds (e.g. 7, 30, 100 days).
        """
        # Fetch most recent logged mood date
        latest_date = mood_repository.get_last_entry_date(db, user_id=user_id) or date.today()

        stmt = select(MoodStreak).where(MoodStreak.user_id == user_id)
        streak = db.scalars(stmt).first()

        if not streak:
            streak = MoodStreak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_logged_date=latest_date,
            )
            db.add(streak)
        else:
            prev_date = streak.last_logged_date
            if prev_date is None:
                streak.current_streak = 1
                streak.longest_streak = max(streak.longest_streak, 1)
            elif prev_date == latest_date:
                # Same day check-in: retain current streak count without double counting
                pass
            elif latest_date == prev_date + timedelta(days=1):
                # Consecutive day check-in
                streak.current_streak += 1
                streak.longest_streak = max(streak.longest_streak, streak.current_streak)
            else:
                # Missed day(s): reset current streak
                streak.current_streak = 1

            streak.last_logged_date = latest_date

        db.commit()
        db.refresh(streak)

        logger.info(
            f"Updated streak for user id={user_id}: current={streak.current_streak}, longest={streak.longest_streak}"
        )

        # Trigger milestone achievement evaluation
        try:
            achievement_service.evaluate_and_award(
                db,
                user_id=user_id,
                trigger_context={"streak_count": streak.current_streak, "action": "streak_updated"},
            )
        except Exception as err:
            logger.warning(f"Could not evaluate achievement awards for user id={user_id}: {err}")

        return streak

    def get_user_streak(self, db: Session, user_id: int) -> MoodStreak:
        """
        Retrieves a user's current mood streak record, initializing a default 0-day record if none exists.
        """
        stmt = select(MoodStreak).where(MoodStreak.user_id == user_id)
        streak = db.scalars(stmt).first()
        if not streak:
            return MoodStreak(
                user_id=user_id,
                current_streak=0,
                longest_streak=0,
                last_logged_date=None,
            )
        return streak


streak_service = StreakService()
