"""
Mood Streak Celery Tasks.
Provides nightly batch streak recalculations for all users and real-time single-user update tasks.
"""
import logging
from sqlalchemy import select
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.user import User
from app.services.streak_service import streak_service

logger = logging.getLogger("kintsugi.workers.streak")


@celery_app.task(
    bind=True,
    name="app.workers.tasks.streak_tasks.recalculate_streak_task",
    max_retries=3,
    default_retry_delay=5,
    retry_backoff=True,
)
def recalculate_streak_task(self, user_id: int) -> int:
    """
    Real-time single-user streak recalculation task triggered after logging a mood.
    """
    logger.info(f"Processing recalculate_streak_task for user id={user_id}")
    db = SessionLocal()
    try:
        streak = streak_service.update_streak(db, user_id=user_id)
        logger.info(f"Updated streak for user id={user_id}: current={streak.current_streak}")
        return streak.current_streak
    except Exception as exc:
        logger.error(f"Error updating streak for user id={user_id}: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


# Alias for backward compatibility
update_streak_task = recalculate_streak_task


@celery_app.task(
    name="app.workers.tasks.streak_tasks.recalculate_all_streaks",
    max_retries=2,
    default_retry_delay=30,
)
def recalculate_all_streaks(batch_size: int = 100) -> int:
    """
    Nightly Celery Beat task iterating through all users in batches to update or reset streaks.
    """
    logger.info(f"Starting nightly recalculate_all_streaks sweep (batch_size={batch_size})")
    db = SessionLocal()
    processed_count = 0
    try:
        offset = 0
        while True:
            stmt = select(User.id).where(User.is_active == True).order_by(User.id).offset(offset).limit(batch_size)
            user_ids = list(db.scalars(stmt).all())
            if not user_ids:
                break

            for user_id in user_ids:
                try:
                    streak_service.update_streak(db, user_id=user_id)
                    processed_count += 1
                except Exception as err:
                    logger.warning(f"Error recalculating streak for user id={user_id}: {err}")

            offset += batch_size

        logger.info(f"Nightly streak sweep complete. Processed {processed_count} active users.")
        return processed_count
    except Exception as exc:
        logger.error(f"Error in recalculate_all_streaks nightly sweep: {exc}")
        raise exc
    finally:
        db.close()
