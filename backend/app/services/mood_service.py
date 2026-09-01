"""
Mood Tracking Service.
Handles mood entry persistence with AI supportive reflections and dispatches streak calculation.
"""
import re
import logging
import threading
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.models.mood_entry import MoodEntry
from app.core.constants import MoodType
from app.repositories.mood_repository import mood_repository
from app.db.session import SessionLocal

logger = logging.getLogger("kintsugi.services.mood")


def _bg_generate_ai_message(entry_id: int, user_id: int, mood_str: str, note: Optional[str]):
    """Background worker thread function to generate AI message and broadcast realtime WS event if missing."""
    db = SessionLocal()
    try:
        from app.services.ai_service import ai_service
        ai_msg = ai_service.generate_mood_message(mood_type=mood_str, note=note)
        entry = mood_repository.get(db, id=entry_id)
        if entry:
            if not entry.ai_message:
                entry = mood_repository.update(db, db_obj=entry, obj_in={"ai_message": ai_msg})
                logger.info(f"Background thread generated AI message for entry id={entry_id}")
            
            # Broadcast WebSocket realtime event to mobile client
            try:
                from app.websocket.manager import connection_manager
                ws_payload = {
                    "moodId": str(entry.id),
                    "moodScore": 3,
                    "aiMessage": entry.ai_message,
                    "timestamp": int(entry.created_at.timestamp() * 1000) if entry.created_at else 0
                }
                connection_manager.broadcast_to_user_sync(user_id, "mood.entry_updated", ws_payload)
            except Exception as ws_err:
                logger.warning(f"Could not broadcast mood.entry_updated WS event: {ws_err}")
    except Exception as err:
        logger.warning(f"Background AI message generation failed for entry id={entry_id}: {err}")
    finally:
        db.close()


class MoodService:
    """
    Business service orchestrating mood check-ins and asynchronous background task dispatch.
    """
    def log_mood(
        self,
        db: Session,
        user_id: int,
        mood_type: MoodType,
        note: Optional[str] = None,
        entry_date: Optional[date] = None,
    ) -> MoodEntry:
        """
        Persists mood check-in entry with AI reflection message and returns immediately to HTTP caller.
        """
        checkin_date = entry_date or date.today()
        mood_str = mood_type.value if hasattr(mood_type, "value") else str(mood_type)

        # 1. Generate AI supportive reflection message
        try:
            from app.services.ai_service import ai_service
            ai_msg = ai_service.generate_mood_message(mood_type=mood_str, note=note)
        except Exception as err:
            logger.warning(f"AI message generation failed during log_mood: {err}")
            ai_msg = "Thank you for checking in today. Be gentle with yourself and take things one step at a time."

        mood_data = {
            "user_id": user_id,
            "mood_type": mood_type,
            "note": note,
            "ai_message": ai_msg,
            "entry_date": checkin_date,
        }

        # 2. Persist mood entry with generated AI reflection
        entry = mood_repository.create(db, obj_in=mood_data)
        logger.info(f"Logged mood entry id={entry.id} for user id={user_id} ({mood_str}) with AI message")

        # 3. Asynchronously enqueue background tasks for streak tracking & WS broadcast
        threading.Thread(
            target=_bg_generate_ai_message,
            args=(entry.id, user_id, mood_str, note),
            daemon=True,
        ).start()

        self._dispatch_background_tasks(entry.id, user_id)

        return entry

    def _dispatch_background_tasks(self, entry_id: int, user_id: int) -> None:
        """
        Safely dispatches Celery background tasks without failing the primary HTTP request.
        """
        try:
            from app.workers.tasks.streak_tasks import recalculate_streak_task
            recalculate_streak_task.delay(user_id)
            logger.info(f"Enqueued streak recalculation task for user id={user_id}")
        except Exception as err:
            logger.warning(f"Could not enqueue recalculate_streak_task: {err}")

    def get_user_moods(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[MoodEntry]:
        """
        Retrieves paginated historical mood entries for a user instantly.
        Triggers background generation for any entry lacking an AI message.
        """
        entries = mood_repository.get_history_for_user(db, user_id=user_id, offset=skip, limit=limit)
        
        for entry in entries:
            if entry.ai_message and "<think>" in entry.ai_message:
                entry.ai_message = re.sub(r"(?s)<think>.*?</think>", "", entry.ai_message).strip()

        # Non-blocking check to generate missing AI messages in background threads
        for entry in entries[:5]:
            if not entry.ai_message:
                mood_str = entry.mood_type.value if hasattr(entry.mood_type, "value") else str(entry.mood_type)
                threading.Thread(
                    target=_bg_generate_ai_message,
                    args=(entry.id, user_id, mood_str, entry.note),
                    daemon=True,
                ).start()

        return entries

    def get_last_entry_date(self, db: Session, user_id: int) -> Optional[date]:
        """
        Retrieves the most recent entry_date logged by the user.
        """
        return mood_repository.get_last_entry_date(db, user_id=user_id)


mood_service = MoodService()
