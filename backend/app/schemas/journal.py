"""
Journal Entry Schemas.
Defines Pydantic v2 validation models for creation, update, and retrieval of private journal entries.
"""
from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


class JournalEntryCreate(BaseModel):
    """
    Request payload for creating a private journal entry.
    """
    title: Optional[str] = Field(None, max_length=255, description="Optional journal entry title")
    content: str = Field(..., min_length=1, max_length=20000, description="Required journal content text")
    mood_tag: Optional[str] = Field("Calm", max_length=50, description="Associated mood classification tag")
    is_favorite: Optional[bool] = Field(False, description="Flag indicating if entry is marked as favorite")
    is_pinned: Optional[bool] = Field(False, description="Flag indicating if entry is pinned")

    @field_validator("title", mode="before")
    @classmethod
    def trim_title(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            trimmed = v.strip()
            return trimmed if trimmed else None
        return v


class JournalEntryUpdate(BaseModel):
    """
    Request payload for updating an existing journal entry.
    """
    title: Optional[str] = Field(None, max_length=255, description="Updated journal entry title")
    content: Optional[str] = Field(None, min_length=1, max_length=20000, description="Updated journal content text")
    mood_tag: Optional[str] = Field(None, max_length=50, description="Updated mood classification tag")
    is_favorite: Optional[bool] = Field(None, description="Updated favorite flag status")
    is_pinned: Optional[bool] = Field(None, description="Updated pinned flag status")

    @field_validator("title", mode="before")
    @classmethod
    def trim_title(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            trimmed = v.strip()
            return trimmed if trimmed else None
        return v


class JournalEntryOut(BaseModel):
    """
    Response payload for a journal entry.
    Content is decrypted before being placed in JournalEntryOut by the service layer.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Journal entry ID")
    user_id: int = Field(..., description="Author user ID")
    title: Optional[str] = Field(None, description="Journal entry title")
    content: str = Field(..., description="Plaintext or decrypted journal entry content")
    mood_tag: Optional[str] = Field(None, description="Associated mood classification tag")
    ai_reflection: Optional[str] = Field(None, description="AI-generated insight or reflection")
    ai_summary: Optional[str] = Field(None, description="AI-generated summary")
    ai_title: Optional[str] = Field(None, description="AI-suggested title")
    is_favorite: bool = Field(False, description="Favorite flag status")
    is_pinned: bool = Field(False, description="Pinned flag status")
    is_encrypted: bool = Field(True, description="Encryption flag status")
    created_at: datetime = Field(..., description="Entry creation timestamp")
    updated_at: datetime = Field(..., description="Entry update timestamp")


class AiAssistRequest(BaseModel):
    """
    Payload requesting AI writing assistance (continue, rewrite, summarize, etc.).
    """
    action: str = Field(..., description="AI Action: continue, rewrite_professional, rewrite_gentle, improve_grammar, expand, shorten, generate_title, summarize, reflect_emotion")
    content: str = Field(..., description="Context content text")
    prompt: Optional[str] = Field(None, description="Optional custom user prompt")


class AiAssistResponse(BaseModel):
    """
    AI writing assistance response.
    """
    action: str
    result: str


JournalEntryResponse = JournalEntryOut
