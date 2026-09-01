"""
Centralized Celery Application Instance.
Configures Redis message broker & result backend, dedicated queue routing, JSON serialization, and Celery Beat periodic schedules.
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "kintsugi",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_default_queue="kintsugi_default",
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=270,
    # Dedicated Queue Routing for Workload Isolation (Phase 11)
    task_routes={
        "app.workers.tasks.mood_tasks.*": {"queue": "ai"},
        "app.workers.tasks.crisis_alert_tasks.*": {"queue": "critical"},
        "app.workers.tasks.notification_tasks.*": {"queue": "kintsugi_default"},
        "app.workers.tasks.streak_tasks.*": {"queue": "kintsugi_default"},
        "app.workers.tasks.chat_tasks.*": {"queue": "kintsugi_default"},
        "app.workers.tasks.*": {"queue": "kintsugi_default"},
    },
    # Celery Beat Scheduled Periodic Jobs
    beat_schedule={
        "nightly-streak-sweep": {
            "task": "app.workers.tasks.streak_tasks.recalculate_all_streaks",
            "schedule": crontab(hour=19, minute=0),  # 00:30 IST / 19:00 UTC
            "options": {"queue": "kintsugi_default"},
        },
        "periodic-notification-dispatch": {
            "task": "app.workers.tasks.notification_tasks.deliver_due_notifications",
            "schedule": crontab(minute="*/5"),
            "options": {"queue": "kintsugi_default"},
        },
        "hourly-chat-session-cleanup": {
            "task": "app.workers.tasks.chat_tasks.close_idle_chat_sessions",
            "schedule": crontab(minute=0),
            "options": {"queue": "kintsugi_default"},
        },
        "daily-chat-metrics-rollup": {
            "task": "app.workers.tasks.chat_tasks.aggregate_daily_chat_metrics",
            "schedule": crontab(hour=1, minute=0),
            "options": {"queue": "kintsugi_default"},
        },
    },
)
