"""
Celery Worker Process Entry Point.
Imports the shared Celery app and all task modules so that `celery -A app.workers.celery_worker worker` auto-discovers all registered tasks.
"""
from app.core.celery_app import celery_app
from app.workers.tasks import (
    mood_tasks,
    chat_tasks,
    streak_tasks,
    notification_tasks,
    crisis_alert_tasks,
)

__all__ = [
    "celery_app",
    "mood_tasks",
    "chat_tasks",
    "streak_tasks",
    "notification_tasks",
    "crisis_alert_tasks",
]
