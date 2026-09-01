"""
User Profile Router.
Provides authenticated users access to fetch and update their profile preferences.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.repositories.user_repository import user_repository

router = APIRouter()


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current user profile",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
) -> UserOut:
    """
    Returns the profile representation for the currently authenticated user.
    """
    return current_user


@router.patch(
    "/me",
    response_model=UserOut,
    summary="Update current user profile preferences",
)
def update_current_user_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserOut:
    """
    Updates editable profile fields (name, avatar_url, theme_preference, notification_enabled).
    Restricts modifying sensitive security attributes like email or account status.
    """
    update_data = {}
    if user_in.name is not None:
        update_data["name"] = user_in.name
    if user_in.avatar_url is not None:
        update_data["avatar_url"] = user_in.avatar_url
    if user_in.theme_preference is not None:
        update_data["theme_preference"] = user_in.theme_preference
    if user_in.notification_enabled is not None:
        update_data["notification_enabled"] = user_in.notification_enabled

    updated_user = user_repository.update(db, db_obj=current_user, obj_in=update_data)
    return updated_user
