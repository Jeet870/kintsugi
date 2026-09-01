"""
AI Chat Orchestration Service.
Coordinates conversation turn workflows, message persistence, crisis detection screening, emergency escalation payloads, session renaming, deletion, and AI companion responses.
"""
import re
import logging
from typing import List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.constants import ChatSessionStatus, ChatSender
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatMessageOut
from app.schemas.emergency import EmergencyEscalation, HelplineResourceOut
from app.repositories.chat_repository import chat_repository
from app.services.crisis_detection_service import crisis_detection_service
from app.services.ai_service import ai_service

logger = logging.getLogger("kintsugi.services.chat")


class ChatService:
    """
    Business service managing AI companion chat sessions, crisis safety interventions, and AI reply dispatch.
    """
    def create_session(self, db: Session, user_id: int, title: Optional[str] = None) -> ChatSession:
        """
        Creates a new active chat session for a user.
        """
        session = chat_repository.create_session(db, user_id=user_id, status=ChatSessionStatus.ACTIVE)
        if title:
            session.title = title
            db.commit()
            db.refresh(session)
        logger.info(f"Created chat session id={session.id} for user id={user_id}")
        return session

    def rename_session(self, db: Session, session_id: int, user_id: int, title: str) -> ChatSession:
        """
        Renames an existing chat session owned by the user.
        """
        session = self.get_session_by_id(db, session_id=session_id, user_id=user_id)
        session.title = title
        db.commit()
        db.refresh(session)
        logger.info(f"Renamed chat session id={session_id} to '{title}' for user id={user_id}")
        return session

    def delete_session(self, db: Session, session_id: int, user_id: int) -> bool:
        """
        Deletes a chat session and all its associated messages.
        """
        session = self.get_session_by_id(db, session_id=session_id, user_id=user_id)
        db.delete(session)
        db.commit()
        logger.info(f"Deleted chat session id={session_id} for user id={user_id}")
        return True

    def get_user_sessions(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[ChatSession]:
        """
        Retrieves all chat sessions for a user ordered by last activity.
        """
        return chat_repository.get_user_sessions(db, user_id=user_id, skip=skip, limit=limit)

    def get_session_by_id(self, db: Session, session_id: int, user_id: int) -> ChatSession:
        """
        Retrieves a single chat session by ID and verifies user ownership.
        """
        stmt = select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        )
        session = db.scalars(stmt).first()
        if not session:
            raise NotFoundException("Chat session not found")
        return session

    def handle_user_message(
        self, db: Session, session_id: int, user_id: int, text: str
    ) -> ChatMessageOut:
        """
        Orchestrates a single conversation turn:
        1. Verifies session ownership and sets auto-title if not set.
        2. Persists user message.
        3. Evaluates text with CrisisDetectionService.
        4. If CRISIS: generates escalation payload.
        5. If SAFE: calls AIService to generate response.
        """
        session = self.get_session_by_id(db, session_id=session_id, user_id=user_id)

        # Clean prompt text of any think tags if accidentally present
        clean_user_text = re.sub(r"(?s)<think>.*?</think>", "", text).strip()
        if not clean_user_text:
            clean_user_text = text

        # Set auto-title on first message if session is untitled
        if not session.title or session.title == "New Conversation":
            session.title = clean_user_text[:40].strip() + ("..." if len(clean_user_text) > 40 else "")
            session.ended_at = datetime.now()
            db.commit()

        # Persist user message
        user_msg = chat_repository.create_message(
            db,
            session_id=session.id,
            sender=ChatSender.USER,
            content=clean_user_text,
        )

        # Crisis detection
        assessment = crisis_detection_service.evaluate_message(
            db, user_id=user_id, session_id=session.id, text=clean_user_text
        )

        if assessment.is_crisis:
            session.status = ChatSessionStatus.ESCALATED
            session.ended_at = datetime.now()
            db.commit()

            escalation_payload = EmergencyEscalation(
                risk_level=assessment.risk_level.value,
                alert_title="Crisis Support Required",
                guidance_message=(
                    "We hear how much pain you are holding right now. You are not alone, and help is available immediately. "
                    "Please reach out to a professional counselor or helpline right now."
                ),
                primary_helpline=HelplineResourceOut(
                    name="988 Suicide & Crisis Lifeline",
                    number="988",
                    description="24/7 free and confidential crisis support",
                ),
                secondary_helplines=[
                    HelplineResourceOut(name="Crisis Text Line", number="Text HOME to 741741"),
                    HelplineResourceOut(name="International Resources", number="1-800-273-8255"),
                ],
            )

            system_reply_text = (
                "Your safety and well-being are paramount. Kintsugi has detected severe distress and provided immediate emergency crisis resources above."
            )

            chat_repository.create_message(
                db,
                session_id=session.id,
                sender=ChatSender.SYSTEM,
                content=system_reply_text,
            )

            try:
                from app.websocket.manager import connection_manager
                connection_manager.broadcast_to_user_sync(
                    user_id=user_id,
                    event_type="chat.escalation",
                    payload={
                        "sessionId": session_id,
                        "escalation": escalation_payload.model_dump(),
                    },
                )
            except Exception as e:
                logger.warning(f"Failed to broadcast crisis escalation event: {e}")

            return ChatMessageOut(
                id=user_msg.id,
                session_id=session.id,
                sender=ChatSender.USER,
                content=clean_user_text,
                flagged_crisis=True,
                escalation=escalation_payload,
                created_at=user_msg.created_at,
            )

        # Generate AI completion
        context_messages = [
            {"role": "user" if m.sender == ChatSender.USER else "assistant", "content": m.content}
            for m in session.messages[-10:]
        ]

        try:
            ai_reply_text = ai_service.generate_companion_response(
                user_id=user_id,
                messages=context_messages,
            )
        except Exception as err:
            logger.error(f"AI response generation error: {err}")
            ai_reply_text = "I am listening and here with you. Take a slow, quiet breath. Tell me more about what you are feeling."

        # Parse <think>...</think> tags if present in model output
        reasoning_text = None
        clean_ai_text = ai_reply_text
        think_match = re.search(r"(?s)<think>(.*?)</think>", ai_reply_text)
        if think_match:
            reasoning_text = think_match.group(1).strip()
            clean_ai_text = re.sub(r"(?s)<think>.*?</think>", "", ai_reply_text).strip()

        ai_msg = chat_repository.create_message(
            db,
            session_id=session.id,
            sender=ChatSender.AI,
            content=clean_ai_text if clean_ai_text else ai_reply_text,
        )

        session.ended_at = datetime.now()
        db.commit()

        try:
            from app.websocket.manager import connection_manager
            connection_manager.broadcast_to_user_sync(
                user_id=user_id,
                event_type="chat.message_new",
                payload={
                    "sessionId": session_id,
                    "message": {
                        "id": ai_msg.id,
                        "session_id": str(session_id),
                        "sender": "ai",
                        "content": clean_ai_text if clean_ai_text else ai_reply_text,
                        "reasoning": reasoning_text,
                        "createdAt": ai_msg.created_at.isoformat() if hasattr(ai_msg.created_at, "isoformat") else str(ai_msg.created_at),
                    },
                },
            )
        except Exception as e:
            logger.warning(f"Failed to broadcast websocket event: {e}")

        return ChatMessageOut(
            id=ai_msg.id,
            session_id=session_id,
            sender=ChatSender.AI,
            content=clean_ai_text if clean_ai_text else ai_reply_text,
            reply=clean_ai_text if clean_ai_text else ai_reply_text,
            reasoning=reasoning_text,
            flagged_crisis=False,
            escalation=None,
            created_at=ai_msg.created_at,
        )


chat_service = ChatService()
