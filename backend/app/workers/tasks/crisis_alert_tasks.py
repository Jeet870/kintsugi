"""
Crisis Escalation Alert Celery Tasks.
Performs asynchronous internal alerts and webhook notifications following a crisis escalation without blocking user HTTP responses.
"""
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select

import httpx
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.crisis_log import CrisisLog

logger = logging.getLogger("kintsugi.workers.crisis")


@celery_app.task(
    bind=True,
    name="app.workers.tasks.crisis_alert_tasks.notify_crisis_escalation",
    max_retries=5,
    default_retry_delay=10,
    retry_backoff=True,
)
def notify_crisis_escalation(
    self,
    crisis_log_id: Optional[int] = None,
    user_id: Optional[int] = None,
    session_id: Optional[int] = None,
    message_id: Optional[int] = None,
    risk_level: Optional[str] = None,
    reason: Optional[str] = None,
) -> bool:
    """
    Asynchronously posts a non-identifying crisis escalation summary to the configured internal review webhook.
    """
    logger.warning(
        f"Processing notify_crisis_escalation: crisis_log_id={crisis_log_id}, user_id={user_id}, risk={risk_level}"
    )

    db = SessionLocal()
    trigger_type = f"chat:{risk_level.lower()}" if risk_level else "chat:critical"
    action_taken = "ESCALATED_SAFETY_INTERVENTION"

    try:
        if crisis_log_id is not None:
            stmt = select(CrisisLog).where(CrisisLog.id == crisis_log_id)
            log_obj = db.scalars(stmt).first()
            if log_obj:
                user_id = user_id or log_obj.user_id
                trigger_type = log_obj.trigger_type
                action_taken = log_obj.action_taken

        webhook_url = settings.CRISIS_ESCALATION_WEBHOOK
        payload = {
            "event": "CRISIS_SAFETY_INTERVENTION",
            "crisis_log_id": crisis_log_id,
            "user_id": user_id,
            "session_id": session_id,
            "trigger_type": trigger_type,
            "action_taken": action_taken,
            "reason": reason or "Safety escalation triggered",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        if not webhook_url or not webhook_url.strip():
            logger.info("CRISIS_ESCALATION_WEBHOOK is empty. Logged escalation payload internally.")
            return True

        with httpx.Client(timeout=5.0) as client:
            resp = client.post(webhook_url, json=payload)
            if resp.status_code in (200, 201, 202, 204):
                logger.info(f"Crisis escalation webhook successfully delivered to {webhook_url}")
                return True
            else:
                logger.warning(f"Crisis webhook endpoint returned status HTTP {resp.status_code}")
                raise Exception(f"Webhook HTTP {resp.status_code}")

    except Exception as exc:
        logger.error(f"Error dispatching crisis escalation webhook: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return False
    finally:
        db.close()


# Alias for backward compatibility
notify_crisis_task = notify_crisis_escalation
dispatch_crisis_alert_email = notify_crisis_escalation
