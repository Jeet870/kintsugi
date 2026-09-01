"""
Profile & Mobile Android Compatibility Router.
Exposes endpoints for /profile/me, /profile/streak, and /profile/achievements matching Android client DTOs.
"""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.mood_entry import MoodEntry
from app.services.streak_service import streak_service
from app.services.achievement_service import achievement_service
from app.db.init_db import seed_reference_data

router = APIRouter()


class ProfileUserDto(BaseModel):
    id: str
    name: Optional[str] = None
    email: str
    avatar_url: Optional[str] = None
    notification_enabled: bool = True
    streak_days: int = 0
    created_at: int = Field(default_factory=lambda: int(datetime.now(timezone.utc).timestamp() * 1000))


class ProfileStreakDto(BaseModel):
    current_streak: int = 0
    longest_streak: int = 0
    last_active_date: Optional[str] = None
    total_active_days: int = 0


class ProfileAchievementDto(BaseModel):
    id: str
    title: str
    description: str
    icon_url: Optional[str] = None
    earned_at: Optional[int] = None
    is_unlocked: bool = False
    progress: int = 100


@router.get(
    "/me",
    response_model=ProfileUserDto,
    summary="Get user profile formatted for Android UserDto",
)
def get_profile_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ProfileUserDto:
    """
    Returns user profile details matching Android UserDto.
    """
    user_streak = streak_service.get_user_streak(db, user_id=current_user.id)
    
    created_ms = int(current_user.created_at.timestamp() * 1000) if current_user.created_at else int(datetime.now(timezone.utc).timestamp() * 1000)
    
    return ProfileUserDto(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        avatar_url=current_user.avatar_url,
        notification_enabled=current_user.notification_enabled,
        streak_days=user_streak.current_streak,
        created_at=created_ms,
    )


@router.get(
    "/streak",
    response_model=ProfileStreakDto,
    summary="Get user streak stats formatted for Android StreakDto",
)
def get_profile_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ProfileStreakDto:
    """
    Returns current and longest mood streak stats matching Android StreakDto.
    """
    user_streak = streak_service.get_user_streak(db, user_id=current_user.id)
    last_date_str = user_streak.last_logged_date.isoformat() if user_streak.last_logged_date else None
    
    total_days = db.query(MoodEntry).filter(MoodEntry.user_id == current_user.id).count()
    
    return ProfileStreakDto(
        current_streak=user_streak.current_streak,
        longest_streak=user_streak.longest_streak,
        last_active_date=last_date_str,
        total_active_days=total_days,
    )


@router.get(
    "/achievements",
    response_model=List[ProfileAchievementDto],
    summary="Get user achievements formatted for Android AchievementDto list",
)
def get_profile_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ProfileAchievementDto]:
    """
    Returns full achievements catalog with unlock status matching Android AchievementDto.
    """
    catalog = achievement_service.get_catalog(db)
    if not catalog:
        seed_reference_data(db)
        catalog = achievement_service.get_catalog(db)

    user_badges = achievement_service.get_user_badges(db, user_id=current_user.id)
    unlocked_map = {}
    for b in user_badges:
        code = b.achievement.code if b.achievement else "unknown"
        earned_ms = int(b.earned_at.timestamp() * 1000) if b.earned_at else None
        unlocked_map[code] = earned_ms

    results = []
    for item in catalog:
        item_code = item.code
        is_unlocked = item_code in unlocked_map
        earned_at = unlocked_map.get(item_code)
        
        results.append(
            ProfileAchievementDto(
                id=item_code,
                title=item.title,
                description=item.description,
                icon_url=item.icon_url,
                earned_at=earned_at,
                is_unlocked=is_unlocked,
                progress=100 if is_unlocked else 0,
            )
        )

    return results
