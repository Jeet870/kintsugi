"""
Crisis Detection & Safety Intervention Service.
Analyzes user inputs for crisis indicators, persists decoupled audit logs, triggers background crisis alerts, and returns strongly typed AssessmentResult payloads.
"""
import logging
from dataclasses import dataclass, field
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.crisis_log import CrisisLog
from app.ai.moderation import screen_user_message, RiskLevel

logger = logging.getLogger("kintsugi.services.crisis")


@dataclass
class AssessmentResult:
    """
    Strongly typed safety assessment result.
    """
    risk_level: RiskLevel
    matched_rules: List[str] = field(default_factory=list)
    escalate: bool = False
    escalation_reason: Optional[str] = None

    @property
    def is_crisis(self) -> bool:
        return self.escalate

    def __bool__(self) -> bool:
        return self.escalate


class CrisisDetectionService:
    """
    Business service evaluating user input safety, creating audit records for flagged events, and dispatching alert tasks.
    """
    def assess(
        self,
        db: Session,
        user_id: int,
        text: str = "",
        source: str = "chat",
        session_id: Optional[int] = None,
        message_id: Optional[int] = None,
        content: Optional[str] = None,
    ) -> AssessmentResult:
        """
        Evaluates input text safety using the moderation layer.
        If risk is elevated, persists a CrisisLog row and enqueues a crisis alert task if escalation is required.
        """
        eval_text = text.strip() if text and text.strip() else (content.strip() if content and content.strip() else "")
        assessment = screen_user_message(eval_text)
        should_escalate = assessment.is_flagged or assessment.risk_level in (
            RiskLevel.MEDIUM,
            RiskLevel.HIGH,
            RiskLevel.CRITICAL,
        )

        escalation_reason = None
        if should_escalate:
            escalation_reason = (
                f"Safety risk detected (level={assessment.risk_level.value}): "
                f"matched {', '.join(assessment.matched_rules)}"
            )

        result = AssessmentResult(
            risk_level=assessment.risk_level,
            matched_rules=assessment.matched_rules,
            escalate=should_escalate,
            escalation_reason=escalation_reason,
        )

        # Persist audit log for non-trivial risk levels
        if assessment.risk_level != RiskLevel.SAFE or should_escalate:
            trigger_type = f"chat:{assessment.risk_level.value.lower()}"
            action_taken = "ESCALATED_SAFETY_INTERVENTION" if should_escalate else "AUDIT_LOGGED"

            log_entry = CrisisLog(
                user_id=user_id,
                session_id=session_id,
                message_id=message_id,
                trigger_type=trigger_type,
                action_taken=action_taken,
            )
            db.add(log_entry)
            db.commit()
            logger.warning(
                f"CRISIS AUDIT LOGGED for user id={user_id}: risk={assessment.risk_level.value}, escalate={should_escalate}"
            )

        # Enqueue crisis alert notification task if escalation required
        if should_escalate:
            self._dispatch_crisis_alert(user_id, session_id, message_id, result)

        return result

    def evaluate_message(
        self,
        db: Session,
        user_id: int,
        text: str = "",
        session_id: Optional[int] = None,
        message_id: Optional[int] = None,
    ) -> AssessmentResult:
        """
        Evaluates a chat message for crisis triggers and returns safety assessment.
        """
        return self.assess(
            db=db,
            user_id=user_id,
            text=text,
            session_id=session_id,
            message_id=message_id,
        )

    # Aliases for backward compatibility
    evaluate = evaluate_message

    def analyze_and_log(
        self,
        db: Session,
        user_id: int,
        content: str,
        source: str = "chat",
        session_id: Optional[int] = None,
        message_id: Optional[int] = None,
    ) -> bool:
        assessment = self.assess(
            db, user_id=user_id, session_id=session_id, message_id=message_id, text=content
        )
        return assessment.escalate


crisis_detection_service = CrisisDetectionService()
