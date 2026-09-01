"""
Emergency & Helpline Resources Router.
Exposes endpoints for fetching active crisis helpline contacts (filtered by country, defaulting to 'IN')
and static calming guidance exercises.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.helpline_resource import HelplineResource
from app.schemas.emergency import HelplineResourceOut, CalmingTipOut, CrisisAlertRequest
from app.services.crisis_detection_service import crisis_detection_service

router = APIRouter()

# Predefined static calming exercises
STATIC_CALMING_TIPS: List[CalmingTipOut] = [
    CalmingTipOut(
        id="box_breathing",
        title="4-7-8 Deep Breathing Technique",
        category="breathing",
        description="A calming breath pattern that helps quiet anxiety and restore nervous system balance.",
        steps=[
            "Inhale quietly through your nose for 4 seconds.",
            "Hold your breath gently for 7 seconds.",
            "Exhale completely through your mouth with a soft whoosh sound for 8 seconds.",
            "Repeat for 4 full cycles."
        ],
    ),
    CalmingTipOut(
        id="grounding_54321",
        title="5-4-3-2-1 Sensory Grounding Technique",
        category="grounding",
        description="A sensory awareness exercise to bring your mind back into the present moment when feeling overwhelmed.",
        steps=[
            "Acknowledge 5 things you can see around you.",
            "Acknowledge 4 things you can physically touch or feel.",
            "Acknowledge 3 things you can hear in your environment.",
            "Acknowledge 2 things you can smell.",
            "Acknowledge 1 thing you can taste."
        ],
    ),
    CalmingTipOut(
        id="pmr_relaxation",
        title="Progressive Muscle Relaxation",
        category="coping",
        description="Systematically tensing and releasing muscle groups to relieve physical stress tension.",
        steps=[
            "Find a comfortable seated or lying position.",
            "Tense the muscles in your toes and feet for 5 seconds.",
            "Release the tension completely and notice the warm sensation of relaxation.",
            "Move upward through your calves, thighs, shoulders, and jaw, tensing and relaxing each group."
        ],
    ),
]


@router.get(
    "/helplines",
    response_model=List[HelplineResourceOut],
    summary="Get active emergency helpline resources",
)
def get_helplines(
    country_code: str = Query("IN", description="Filter helplines by country code (defaults to 'IN')"),
    db: Session = Depends(get_db),
) -> List[HelplineResourceOut]:
    """
    Retrieves active confidential emergency helpline numbers and crisis support organization contacts.
    Defaults country code filter to 'IN' if unspecified.
    """
    target_country = (country_code or "IN").strip().upper()
    stmt = select(HelplineResource).where(
        HelplineResource.is_active == True,
        HelplineResource.country_code == target_country,
    )
    resources = list(db.scalars(stmt).all())

    # Fallback to all active helplines if no match found for specific country
    if not resources:
        stmt_fallback = select(HelplineResource).where(HelplineResource.is_active == True)
        resources = list(db.scalars(stmt_fallback).all())

    return resources


@router.get(
    "/calming-tips",
    response_model=List[CalmingTipOut],
    summary="Get static calming guidance and breathing exercises",
)
def get_calming_tips() -> List[CalmingTipOut]:
    """
    Returns predefined static calming guidance (controlled breathing, sensory grounding, muscle relaxation).
    These resources are non-AI generated, deterministic coping strategies.
    """
    return STATIC_CALMING_TIPS


@router.post(
    "/alert",
    summary="Trigger a manual emergency support alert",
    include_in_schema=False,
)
def trigger_manual_alert(
    alert_in: CrisisAlertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Submits a manual safety alert, persisting a crisis audit log and dispatching internal escalation notifications.
    """
    crisis_detection_service.assess(
        db,
        user_id=current_user.id,
        content=alert_in.flagged_content,
        source=alert_in.trigger_source,
    )
    return {"status": "alert_received", "message": "Support resources have been alerted."}
