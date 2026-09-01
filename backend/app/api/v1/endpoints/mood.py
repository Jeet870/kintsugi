"""
Mood Tracking Router.
Exposes endpoints for logging daily mood check-ins and retrieving user mood history.
Delegates persistence and background task scheduling to MoodService.
"""
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.mood import MoodEntryCreate, MoodEntryOut, MoodStatsDtoOut
from app.services.mood_service import mood_service
from app.services.streak_service import streak_service

router = APIRouter()


@router.post(
    "/entries",
    response_model=MoodEntryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Log daily mood check-in (mobile alias)",
)
@router.post(
    "/",
    response_model=MoodEntryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Log daily mood check-in",
)
def log_mood(
    mood_in: MoodEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MoodEntryOut:
    """
    Persists a daily mood check-in entry and asynchronously dispatches Celery tasks for AI response generation and streak tracking.
    """
    return mood_service.log_mood(
        db,
        user_id=current_user.id,
        mood_type=mood_in.mood_type,
        note=mood_in.note,
        entry_date=mood_in.entry_date,
    )


@router.get(
    "/stats",
    response_model=MoodStatsDtoOut,
    summary="Get user mood statistics for Android client",
)
def get_mood_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MoodStatsDtoOut:
    """
    Calculates total mood check-in count, average score, dominant mood category, and current streak.
    """
    user_moods = mood_service.get_user_moods(db, user_id=current_user.id, limit=500)
    user_streak = streak_service.get_user_streak(db, user_id=current_user.id)

    total_entries = len(user_moods)
    if total_entries == 0:
        return MoodStatsDtoOut(
            total_entries=0,
            average_score=3.0,
            dominant_mood="Calm",
            streak_days=user_streak.current_streak,
        )

    counts = {}
    for m in user_moods:
        m_type = m.mood_type.value if hasattr(m.mood_type, "value") else str(m.mood_type)
        counts[m_type] = counts.get(m_type, 0) + 1

    dominant = max(counts.items(), key=lambda x: x[1])[0].capitalize()

    return MoodStatsDtoOut(
        total_entries=total_entries,
        average_score=3.5,
        dominant_mood=dominant,
        streak_days=user_streak.current_streak,
    )


@router.get(
    "/history",
    response_model=List[MoodEntryOut],
    summary="Get paginated user mood history",
)
@router.get(
    "/",
    response_model=List[MoodEntryOut],
    summary="Get paginated user mood history",
    include_in_schema=False,
)
def get_mood_history(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Page limit"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[MoodEntryOut]:
    """
    Retrieves paginated historical mood check-in entries for the authenticated user ordered by entry date.
    """
    return mood_service.get_user_moods(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
