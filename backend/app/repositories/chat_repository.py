"""
Chat Repository.
Encapsulates database operations for AI companion chat sessions, message logs, and context window queries.
"""
from typing import List, Optional, Union
from datetime import datetime, timezone
from sqlalchemy import select, desc, asc
from sqlalchemy.orm import Session

from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.core.constants import ChatSessionStatus, ChatSender
from app.repositories.base_repository import BaseRepository


class ChatRepository(BaseRepository[ChatSession]):
    """
    Persistence operations for ChatSession and ChatMessage entities.
    """
    def __init__(self):
        super().__init__(ChatSession)

    def create_session(
        self, db: Session, user_id: int, status: ChatSessionStatus = ChatSessionStatus.ACTIVE
    ) -> ChatSession:
        """
        Create and persist a new chat session for a user.
        """
        session = ChatSession(user_id=user_id, status=status)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_active_session(self, db: Session, user_id: int) -> Optional[ChatSession]:
        """
        Retrieve the active chat session for a user, if one exists.
        """
        stmt = (
            select(ChatSession)
            .where(
                ChatSession.user_id == user_id,
                ChatSession.status == ChatSessionStatus.ACTIVE,
            )
            .order_by(desc(ChatSession.started_at))
            .limit(1)
        )
        return db.scalars(stmt).first()

    def close_session(self, db: Session, session_id: int, user_id: int) -> Optional[ChatSession]:
        """
        Mark a chat session as CLOSED with an ended_at timestamp.
        """
        stmt = select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        )
        session = db.scalars(stmt).first()
        if session:
            session.status = ChatSessionStatus.CLOSED
            session.ended_at = datetime.now(timezone.utc)
            db.add(session)
            db.commit()
            db.refresh(session)
        return session

    def append_message(
        self,
        db: Session,
        session_id: int,
        sender: Union[ChatSender, str],
        content: str,
        flagged_crisis: bool = False,
    ) -> ChatMessage:
        """
        Append a chat message to an active chat session.
        """
        sender_val = sender.value if isinstance(sender, ChatSender) else str(sender)
        message = ChatMessage(
            session_id=session_id,
            sender=sender_val,
            content=content,
            flagged_crisis=flagged_crisis,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    # Aliases for backward compatibility
    add_message = append_message
    create_message = append_message

    def get_recent_messages(
        self, db: Session, session_id: int, limit: int = 20
    ) -> List[ChatMessage]:
        """
        Fetch recent messages for a session formatted chronologically (ASC) for AI context windowing.
        """
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(desc(ChatMessage.created_at))
            .limit(limit)
        )
        recent_desc = list(db.scalars(stmt).all())
        recent_desc.reverse()  # Return in chronological order (oldest to newest)
        return recent_desc

    def get_user_sessions(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[ChatSession]:
        """
        Retrieve paginated chat sessions owned by a user.
        """
        stmt = (
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(desc(ChatSession.started_at))
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(stmt).all())


chat_repository = ChatRepository()
