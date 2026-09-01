"""
Achievements & Gamification Badges Router.
Exposes endpoints for retrieving the full achievement catalog and the authenticated user's earned badges and streak progress.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.journal_entry import JournalEntry
from app.models.mood_entry import MoodEntry
from app.models.chat_session import ChatSession
from app.schemas.achievement import AchievementOut, UserAchievementOut, UserAchievementsAndStreakOut
from app.services.achievement_service import achievement_service
from app.services.streak_service import streak_service
from app.db.init_db import seed_reference_data

router = APIRouter()


@router.get(
    "",
    response_model=List[AchievementOut],
    summary="Get full achievement catalog",
)
@router.get(
    "/catalog",
    response_model=List[AchievementOut],
    summary="Get full achievement catalog",
    include_in_schema=False,
)
def get_achievement_catalog(
    db: Session = Depends(get_db),
) -> List[AchievementOut]:
    """
    Retrieves the complete catalog of system achievements, codes, titles, descriptions, and badge icon URLs.
    Seeds catalog automatically if missing.
    """
    catalog = achievement_service.get_catalog(db)
    if not catalog:
        seed_reference_data(db)
        catalog = achievement_service.get_catalog(db)
    return catalog


@router.get(
    "/me",
    response_model=UserAchievementsAndStreakOut,
    summary="Get current user earned achievements and streak statistics",
)
def get_user_achievements_and_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserAchievementsAndStreakOut:
    """
    Retrieves all badges unlocked by the authenticated user along with active and longest mood logging streak statistics.
    Evaluates user activity to award new badges automatically.
    """
    # 1. Ensure master catalog exists
    catalog = achievement_service.get_catalog(db)
    if not catalog:
        seed_reference_data(db)

    # 2. Inspect user activity metrics and evaluate milestones
    journal_count = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).count()
    mood_count = db.query(MoodEntry).filter(MoodEntry.user_id == current_user.id).count()
    chat_count = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).count()
    user_streak = streak_service.get_user_streak(db, user_id=current_user.id)

    achievement_service.evaluate_and_award(
        db,
        user_id=current_user.id,
        trigger_context={
            "journal_count": journal_count,
            "mood_count": mood_count,
            "chat_count": chat_count,
            "streak_count": user_streak.current_streak,
        },
    )

    user_badges = achievement_service.get_user_badges(db, user_id=current_user.id)
    last_logged_str = user_streak.last_logged_date.isoformat() if user_streak.last_logged_date else None

    return UserAchievementsAndStreakOut(
        earned_achievements=user_badges,
        current_streak=user_streak.current_streak,
        longest_streak=user_streak.longest_streak,
        last_logged_date=last_logged_str,
        journal_count=journal_count,
        mood_count=mood_count,
        chat_count=chat_count,
    )


@router.get(
    "/my-badges",
    response_model=List[UserAchievementOut],
    summary="Get user earned badges list (legacy route)",
    include_in_schema=False,
)
def get_my_achievements_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[UserAchievementOut]:
    """
    Legacy route returning simple list of user earned achievements.
    """
    return achievement_service.get_user_badges(db, user_id=current_user.id)
