"""
AI Companion Chat Router.
Exposes endpoints for starting chat sessions, posting user messages, retrieving session history, renaming sessions, and deleting sessions.
Delegates persistence, crisis safety screening, escalation branching, and AI reply dispatch to ChatService.
"""
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.chat import ChatSessionOut, ChatMessageIn, ChatMessageOut, ChatSessionRenameIn
from app.services.chat_service import chat_service

router = APIRouter()


@router.post(
    "/sessions",
    response_model=ChatSessionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new chat session",
)
def create_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ChatSessionOut:
    """
    Creates a new active AI companion chat session for the authenticated user.
    """
    return chat_service.create_session(db, user_id=current_user.id)


@router.get(
    "/sessions",
    response_model=List[ChatSessionOut],
    summary="Get user chat sessions list",
)
def get_sessions(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Page limit"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ChatSessionOut]:
    """
    Retrieves all chat sessions owned by the authenticated user.
    """
    return chat_service.get_user_sessions(db, user_id=current_user.id, skip=skip, limit=limit)


@router.get(
    "/sessions/{session_id}",
    response_model=ChatSessionOut,
    summary="Get single chat session details and message history",
)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ChatSessionOut:
    """
    Retrieves session metadata, ordered message history, session status, and creation timestamps for a specific session.
    Verifies user ownership before returning data.
    """
    return chat_service.get_session_by_id(db, session_id=session_id, user_id=current_user.id)


@router.patch(
    "/sessions/{session_id}",
    response_model=ChatSessionOut,
    summary="Rename a chat session",
)
@router.put(
    "/sessions/{session_id}",
    response_model=ChatSessionOut,
    include_in_schema=False,
)
def rename_session(
    session_id: int,
    rename_in: ChatSessionRenameIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ChatSessionOut:
    """
    Renames a chat session title.
    """
    return chat_service.rename_session(
        db, session_id=session_id, user_id=current_user.id, title=rename_in.title
    )


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a chat session",
)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    Deletes a chat session and all its message history.
    """
    chat_service.delete_session(db, session_id=session_id, user_id=current_user.id)
    return None


@router.post(
    "/sessions/{session_id}/messages",
    response_model=ChatMessageOut,
    summary="Post a message to a chat session and receive AI reply or emergency escalation payload",
)
@router.post(
    "/sessions/{session_id}/message",
    response_model=ChatMessageOut,
    summary="Post a message to a chat session (legacy route)",
    include_in_schema=False,
)
def send_message(
    session_id: int,
    message_in: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ChatMessageOut:
    """
    Accepts a user message and delegates processing entirely to ChatService.handle_user_message().
    """
    return chat_service.handle_user_message(
        db, session_id=session_id, user_id=current_user.id, text=message_in.message
    )


@router.post(
    "/messages",
    response_model=ChatMessageOut,
    summary="Post a chat message directly (auto-resolves session ID if omitted)",
)
def send_direct_message(
    message_in: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ChatMessageOut:
    """
    Direct endpoint for posting a message. Creates an active session if session_id is omitted.
    """
    session_id = message_in.session_id
    if not session_id:
        user_sessions = chat_service.get_user_sessions(db, user_id=current_user.id, limit=1)
        if user_sessions:
            session_id = user_sessions[0].id
        else:
            new_session = chat_service.create_session(db, user_id=current_user.id)
            session_id = new_session.id

    return chat_service.handle_user_message(
        db, session_id=session_id, user_id=current_user.id, text=message_in.message
    )


@router.get(
    "/history",
    response_model=List[ChatMessageOut],
    summary="Get recent chat message history across active sessions",
)
def get_chat_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ChatMessageOut]:
    """
    Returns ordered recent chat messages for the authenticated user.
    """
    sessions = chat_service.get_user_sessions(db, user_id=current_user.id, limit=5)
    all_messages = []
    for s in sessions:
        all_messages.extend(s.messages)
    return all_messages[-limit:]
