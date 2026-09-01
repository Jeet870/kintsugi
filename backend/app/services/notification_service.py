"""
Notification Service.
Persists scheduled user notification records and delegates async delivery to Celery tasks.
"""
import logging
from typing import Optional, List
from datetime import datetime
from sqlalchemy import select, delete, update
from sqlalchemy.orm import Session

from app.models.notification import Notification

logger = logging.getLogger("kintsugi.services.notification")


class NotificationService:
    """
    Business service for scheduling and managing user notification records.
    """
    def schedule_notification(
        self,
        db: Session,
        user_id: int,
        title: str,
        body: str,
        scheduled_at: Optional[datetime] = None,
    ) -> Notification:
        """
        Persists a Notification row and enqueues a Celery delivery task.
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            body=body,
            is_read=False,
            scheduled_at=scheduled_at,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        logger.info(f"Scheduled notification id={notification.id} for user id={user_id}")

        self._dispatch_delivery_task(notification.id)
        return notification

    def _dispatch_delivery_task(self, notification_id: int) -> None:
        """
        Safely enqueues Celery notification delivery task with try-except fallback.
        """
        try:
            from app.workers.tasks.notification_tasks import deliver_notification_task
            deliver_notification_task.delay(notification_id)
            logger.info(f"Enqueued delivery task for notification id={notification_id}")
        except Exception as err:
            logger.warning(f"Could not enqueue deliver_notification_task: {err}")

    def send_notification(
        self, db: Session, user_id: int, title: str, message: str
    ) -> Notification:
        """
        Immediate delivery helper alias.
        """
        return self.schedule_notification(db, user_id=user_id, title=title, body=message)

    def seed_default_user_notifications(self, db: Session, user_id: int) -> List[Notification]:
        """
        Seeds initial system welcome and reminder notifications for a newly active user.
        """
        count = db.query(Notification).filter(Notification.user_id == user_id).count()
        if count > 0:
            return self.get_user_notifications(db, user_id=user_id)

        defaults = [
            Notification(
                user_id=user_id,
                title="Welcome to Kintsugi Companion",
                body="Your private emotional support space is ready. Check in with your daily mood whenever you feel comfortable.",
                is_read=False,
            ),
            Notification(
                user_id=user_id,
                title="Fernet Encryption Vault Active",
                body="All journal entries are secured with end-to-end symmetric encryption keys bound to your session.",
                is_read=True,
            ),
            Notification(
                user_id=user_id,
                title="Daily Mindful Check-in Reminder",
                body="Remember to pause, take a deep breath, and log your emotional status today.",
                is_read=False,
            ),
        ]
        db.add_all(defaults)
        db.commit()
        logger.info(f"Seeded {len(defaults)} initial notifications for user_id={user_id}")
        return self.get_user_notifications(db, user_id=user_id)

    def get_user_notifications(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 50
    ) -> List[Notification]:
        """
        Retrieves paginated notifications for a user.
        """
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        results = list(db.scalars(stmt).all())
        if not results and skip == 0:
            return self.seed_default_user_notifications(db, user_id=user_id)
        return results

    def mark_as_read(self, db: Session, notification_id: int, user_id: int) -> bool:
        """
        Marks a specific notification as read.
        """
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        notif = db.scalars(stmt).first()
        if notif:
            notif.is_read = True
            db.add(notif)
            db.commit()
            return True
        return False

    def mark_all_read(self, db: Session, user_id: int) -> int:
        """
        Marks all notifications as read for a given user.
        """
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        res = db.execute(stmt)
        db.commit()
        return res.rowcount

    def delete_notification(self, db: Session, notification_id: int, user_id: int) -> bool:
        """
        Deletes a specific notification record.
        """
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        notif = db.scalars(stmt).first()
        if notif:
            db.delete(notif)
            db.commit()
            return True
        return False

    def clear_all(self, db: Session, user_id: int) -> int:
        """
        Clears all notification records for a user.
        """
        stmt = delete(Notification).where(Notification.user_id == user_id)
        res = db.execute(stmt)
        db.commit()
        return res.rowcount


notification_service = NotificationService()
