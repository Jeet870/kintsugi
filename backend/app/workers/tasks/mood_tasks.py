"""
Mood Tracking Celery Tasks.
Asynchronously processes AI-generated supportive messages for logged mood entries without blocking HTTP request workers.
"""
import logging
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.repositories.mood_repository import mood_repository
from app.services.ai_service import ai_service

logger = logging.getLogger("kintsugi.workers.mood")


@celery_app.task(
    bind=True,
    name="app.workers.tasks.mood_tasks.generate_mood_ai_message",
    max_retries=3,
    default_retry_delay=5,
    retry_backoff=True,
)
def generate_mood_ai_message(self, mood_entry_id: int) -> str:
    """
    Asynchronously generates an AI supportive response for a logged mood entry and updates the database row.
    """
    logger.info(f"Processing generate_mood_ai_message for entry id={mood_entry_id}")
    db = SessionLocal()
    try:
        entry = mood_repository.get(db, id=mood_entry_id)
        if not entry:
            logger.warning(f"Mood entry id={mood_entry_id} not found")
            return f"Mood entry id={mood_entry_id} not found"

        mood_type_str = entry.mood_type.value if hasattr(entry.mood_type, "value") else str(entry.mood_type)
        ai_reply = ai_service.generate_mood_message(mood_type=mood_type_str, note=entry.note)

        mood_repository.update(db, db_obj=entry, obj_in={"ai_message": ai_reply})
        logger.info(f"Successfully generated and saved AI message for mood entry id={mood_entry_id}")
        return ai_reply
    except Exception as exc:
        logger.error(f"Error generating AI message for mood entry id={mood_entry_id}: {exc}")
        raise self.retry(exc=exc)
    finally:
        db.close()


# Alias for backward compatibility
generate_mood_message_task = generate_mood_ai_message
