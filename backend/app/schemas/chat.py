"""
AI Companion Chat Schemas.
Defines Pydantic v2 validation models for incoming chat messages, outgoing AI replies, crisis escalation payloads, and chat session summaries.
"""
import typing
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator

from app.core.constants import ChatSender, ChatSessionStatus
from app.schemas.emergency import EmergencyEscalation


class ChatMessageIn(BaseModel):
    """
    Request payload for an incoming chat message sent by the user.
    """
    message: str = Field(..., min_length=1, max_length=4000, description="User chat text message")
    session_id: Optional[int] = Field(None, description="Optional chat session ID")

    @model_validator(mode="before")
    @classmethod
    def populate_message_fields(cls, data: typing.Any) -> typing.Any:
        if isinstance(data, dict):
            if "message" not in data:
                if "text" in data:
                    data["message"] = data["text"]
                elif "content" in data:
                    data["message"] = data["content"]
            if "session_id" in data and isinstance(data["session_id"], str):
                try:
                    data["session_id"] = int(data["session_id"])
                except ValueError:
                    data["session_id"] = None
        return data


# Alias for backward compatibility
ChatMessageCreate = ChatMessageIn


class ChatMessageOut(BaseModel):
    """
    Response payload for a single chat message, incorporating sender, crisis flag, and optional escalation payload.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Message database ID")
    session_id: int = Field(..., description="Chat session ID")
    sender: ChatSender = Field(..., description="Sender role ('user', 'ai', 'system')")
    content: str = Field(..., description="Message content text")
    reply: Optional[str] = Field(None, description="Optional AI reply string")
    flagged_crisis: bool = Field(False, description="Flag indicating crisis trigger detection")
    escalation: Optional[EmergencyEscalation] = Field(
        None,
        description="Optional emergency escalation payload triggered by safety protocols",
    )
    created_at: datetime = Field(..., description="Message creation timestamp")


# Alias for backward compatibility
ChatMessageResponse = ChatMessageOut


class ChatSessionRenameIn(BaseModel):
    """
    Request payload for renaming a chat session.
    """
    title: str = Field(..., min_length=1, max_length=255, description="New chat session title")


class ChatSessionOut(BaseModel):
    """
    Response payload representing a full chat session summary and its message history.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Session database ID")
    user_id: int = Field(..., description="Session owner user ID")
    title: Optional[str] = Field(None, description="Custom or auto-generated session title")
    status: ChatSessionStatus = Field(..., description="Session status ('active', 'completed', 'escalated')")
    last_message_preview: Optional[str] = Field(None, description="Preview string of the last message in session")
    message_count: int = Field(0, description="Total count of messages in session")
    created_at: Optional[datetime] = Field(default_factory=datetime.now, description="Session creation timestamp")
    updated_at: Optional[datetime] = Field(default_factory=datetime.now, description="Session last updated timestamp")
    messages: List[ChatMessageOut] = Field(default_factory=list, description="Ordered session message history")

    @model_validator(mode="before")
    @classmethod
    def map_session_timestamps(cls, data: typing.Any) -> typing.Any:
        if hasattr(data, "started_at"):
            started = getattr(data, "started_at", None) or datetime.now()
            ended = getattr(data, "ended_at", None) or started
            messages = getattr(data, "messages", []) or []
            last_preview = None
            if messages:
                last_msg = messages[-1]
                last_preview = getattr(last_msg, "content", None) or (getattr(last_msg, "reply", None) if hasattr(last_msg, "reply") else None)
            return {
                "id": getattr(data, "id", 0),
                "user_id": getattr(data, "user_id", 0),
                "title": getattr(data, "title", None) or (messages[0].content[:40] if messages and hasattr(messages[0], "content") and messages[0].content else "New Conversation"),
                "status": getattr(data, "status", ChatSessionStatus.ACTIVE),
                "last_message_preview": last_preview or "No messages yet",
                "message_count": len(messages),
                "created_at": started,
                "updated_at": ended,
                "messages": messages,
            }
        elif isinstance(data, dict):
            if "created_at" not in data and "started_at" in data:
                data["created_at"] = data["started_at"]
            if "updated_at" not in data:
                data["updated_at"] = data.get("ended_at") or data.get("created_at") or datetime.now()
            if "title" not in data or not data["title"]:
                data["title"] = "New Conversation"
        return data


# Alias for backward compatibility
ChatSessionResponse = ChatSessionOut
