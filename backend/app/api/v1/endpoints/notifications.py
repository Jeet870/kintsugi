"""
Notifications Router Endpoint.
Exposes endpoints for fetching user notifications, marking them as read, and deleting notifications.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationOut
from app.services.notification_service import notification_service

router = APIRouter()


@router.get(
    "",
    response_model=List[NotificationOut],
    summary="Get authenticated user notifications",
)
def get_user_notifications(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[NotificationOut]:
    """
    Retrieves a list of notifications for the authenticated user.
    """
    return notification_service.get_user_notifications(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.patch(
    "/{notification_id}/read",
    summary="Mark specific notification as read",
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Marks a given notification as read.
    """
    success = notification_service.mark_as_read(
        db, notification_id=notification_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification record not found",
        )
    return {"status": "success", "message": "Notification marked as read"}


@router.post(
    "/mark-all-read",
    summary="Mark all notifications as read",
)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Marks all notifications for the current user as read.
    """
    updated_count = notification_service.mark_all_read(db, user_id=current_user.id)
    return {"status": "success", "updated_count": updated_count}


@router.delete(
    "/{notification_id}",
    summary="Delete a notification",
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Deletes a notification record.
    """
    success = notification_service.delete_notification(
        db, notification_id=notification_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification record not found",
        )
    return {"status": "success", "message": "Notification deleted"}


@router.delete(
    "",
    summary="Clear all notifications",
)
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Deletes all notifications for the current user.
    """
    deleted_count = notification_service.clear_all(db, user_id=current_user.id)
    return {"status": "success", "deleted_count": deleted_count}
