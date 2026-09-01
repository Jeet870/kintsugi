"""
Notification Dispatch Celery Tasks.
Handles asynchronous delivery of push, email, or in-app reminder notifications.
"""
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.notification import Notification

logger = logging.getLogger("kintsugi.workers.notification")


def send_notification_delivery(user_id: int, title: str, body: str) -> bool:
    """
    Pluggable delivery interface for push/email dispatch.
    Currently logs delivery and prepares payload for APNS/FCM/Email services.
    """
    logger.info(f"[NOTIFICATION DELIVERED] User: {user_id} | Title: '{title}' | Body: '{body}'")
    return True


@celery_app.task(
    bind=True,
    name="app.workers.tasks.notification_tasks.deliver_notification_task",
    max_retries=3,
    default_retry_delay=10,
    retry_backoff=True,
)
def deliver_notification_task(self, notification_id: int) -> bool:
    """
    Delivers a single notification by ID and updates its sent_at timestamp.
    """
    logger.info(f"Processing deliver_notification_task for notification id={notification_id}")
    db = SessionLocal()
    try:
        stmt = select(Notification).where(Notification.id == notification_id)
        notif = db.scalars(stmt).first()
        if not notif:
            logger.warning(f"Notification id={notification_id} not found")
            return False

        if notif.sent_at is not None:
            logger.info(f"Notification id={notification_id} already delivered at {notif.sent_at}")
            return True

        success = send_notification_delivery(notif.user_id, notif.title, notif.body)
        if success:
            notif.sent_at = datetime.now(timezone.utc)
            db.add(notif)
            db.commit()
            logger.info(f"Successfully marked notification id={notification_id} as sent")
            return True
        return False
    except Exception as exc:
        logger.error(f"Error delivering notification id={notification_id}: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery_app.task(
    name="app.workers.tasks.notification_tasks.deliver_due_notifications",
    max_retries=2,
)
def deliver_due_notifications() -> int:
    """
    Periodic Celery Beat task querying all scheduled notifications due for delivery.
    """
    logger.info("Executing deliver_due_notifications task")
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    delivered_count = 0
    try:
        stmt = select(Notification).where(
            Notification.sent_at == None,
            Notification.scheduled_at <= now,
        )
        due_notifs = db.scalars(stmt).all()
        for notif in due_notifs:
            try:
                if send_notification_delivery(notif.user_id, notif.title, notif.body):
                    notif.sent_at = datetime.now(timezone.utc)
                    db.add(notif)
                    delivered_count += 1
            except Exception as err:
                logger.warning(f"Failed to deliver notification id={notif.id}: {err}")

        db.commit()
        logger.info(f"Delivered {delivered_count} due notifications")
        return delivered_count
    except Exception as exc:
        logger.error(f"Error executing deliver_due_notifications: {exc}")
        raise exc
    finally:
        db.close()


# Alias for backward compatibility
send_push_notification = deliver_notification_task
