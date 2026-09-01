"""
Chat Maintenance & Real-time AI Worker Celery Tasks.
Performs background AI completion processing, idle session cleanup, and usage analytics.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from sqlalchemy import select, func

from app.core.celery_app import celery_app
from app.core.constants import ChatSessionStatus, ChatSender
from app.db.session import SessionLocal
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage

logger = logging.getLogger("kintsugi.workers.chat")


@celery_app.task(
    name="app.workers.tasks.chat_tasks.process_ai_response_async",
    max_retries=3,
    default_retry_delay=5,
)
def process_ai_response_async(session_id: int, user_id: int) -> Dict[str, Any]:
    """
    Celery task that asynchronously processes an AI companion reply in the background,
    persists it to MySQL database, and broadcasts WebSocket realtime events.
    """
    logger.info(f"Celery task processing AI response for session_id={session_id}, user_id={user_id}")
    db = SessionLocal()
    try:
        from app.repositories.chat_repository import chat_repository
        from app.services.ai_service import ai_service
        from app.websocket import connection_manager

        history_msgs = chat_repository.get_recent_messages(db, session_id=session_id, limit=20)
        formatted_messages = []
        for msg in history_msgs:
            sender_str = msg.sender.value if hasattr(msg.sender, "value") else str(msg.sender)
            formatted_messages.append({"role": sender_str, "content": msg.content})

        ai_reply_text = ai_service.generate_chat_reply(messages=formatted_messages)

        ai_msg = chat_repository.append_message(
            db, session_id=session_id, sender=ChatSender.AI, content=ai_reply_text
        )

        # Broadcast event over WebSocket
        connection_manager.broadcast_to_user_sync(
            user_id=user_id,
            event_type="chat.message_new",
            payload={
                "sessionId": session_id,
                "message": {
                    "id": ai_msg.id,
                    "session_id": str(session_id),
                    "sender": "ai",
                    "content": ai_reply_text,
                    "createdAt": ai_msg.created_at.isoformat() if hasattr(ai_msg.created_at, "isoformat") else str(ai_msg.created_at),
                },
            },
        )

        return {"status": "success", "message_id": ai_msg.id, "content": ai_reply_text}
    except Exception as exc:
        logger.error(f"Error in process_ai_response_async: {exc}")
        db.rollback()
        raise exc
    finally:
        db.close()


@celery_app.task(
    name="app.workers.tasks.chat_tasks.close_idle_chat_sessions",
    max_retries=2,
    default_retry_delay=10,
)
def close_idle_chat_sessions(timeout_hours: int = 24) -> int:
    """
    Closes active chat sessions that have been idle beyond the configured timeout threshold.
    """
    logger.info(f"Running close_idle_chat_sessions with timeout_hours={timeout_hours}")
    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=timeout_hours)
        stmt = select(ChatSession).where(
            ChatSession.status == ChatSessionStatus.ACTIVE,
            ChatSession.started_at <= cutoff,
        )
        idle_sessions = db.scalars(stmt).all()
        count = 0
        for session in idle_sessions:
            session.status = ChatSessionStatus.CLOSED
            db.add(session)
            count += 1

        db.commit()
        logger.info(f"Closed {count} idle chat sessions")
        return count
    except Exception as exc:
        logger.error(f"Error closing idle chat sessions: {exc}")
        db.rollback()
        raise exc
    finally:
        db.close()


@celery_app.task(
    name="app.workers.tasks.chat_tasks.aggregate_daily_chat_metrics",
    max_retries=2,
)
def aggregate_daily_chat_metrics() -> Dict[str, Any]:
    """
    Aggregates daily chat conversation statistics (active sessions, total messages).
    """
    logger.info("Executing aggregate_daily_chat_metrics task")
    db = SessionLocal()
    try:
        total_sessions = db.scalar(select(func.count()).select_from(ChatSession)) or 0
        active_sessions = db.scalar(
            select(func.count()).select_from(ChatSession).where(ChatSession.status == ChatSessionStatus.ACTIVE)
        ) or 0
        total_messages = db.scalar(select(func.count()).select_from(ChatMessage)) or 0

        metrics = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_sessions": total_sessions,
            "active_sessions": active_sessions,
            "total_messages": total_messages,
        }
        logger.info(f"Daily chat metrics aggregated: {metrics}")
        return metrics
    except Exception as exc:
        logger.error(f"Error aggregating chat metrics: {exc}")
        raise exc
    finally:
        db.close()
