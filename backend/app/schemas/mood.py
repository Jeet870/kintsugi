"""
Mood Check-in Schemas.
Defines Pydantic v2 validation models for recording and querying daily mood check-ins.
"""
from typing import Optional, Any, Dict
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator

from app.core.constants import MoodType


class MoodEntryCreate(BaseModel):
    """
    Request payload for creating a new daily mood check-in entry.
    """
    mood_type: MoodType = Field(..., description="Selected mood category")
    mood_score: Optional[int] = Field(3, description="Optional mood rating score (1-5)")
    note: Optional[str] = Field(None, max_length=1000, description="Optional personal note detailing feelings or context")
    entry_date: date = Field(default_factory=date.today, description="Check-in date defaulting server-side to today")

    @field_validator("mood_type", mode="before")
    @classmethod
    def normalize_mood_type(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.lower().strip()
        return v

    @field_validator("note", mode="before")
    @classmethod
    def trim_note(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            trimmed = v.strip()
            return trimmed if trimmed else None
        return v


class MoodEntryOut(BaseModel):
    """
    Response payload for a recorded mood check-in entry.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Mood entry ID")
    user_id: int = Field(..., description="Associated user ID")
    mood_type: MoodType = Field(..., description="Selected mood type")
    mood_score: Optional[int] = Field(None, description="Mood rating score")
    note: Optional[str] = Field(None, description="User note")
    ai_message: Optional[str] = Field(None, description="AI reflection message")
    entry_date: date = Field(..., description="Check-in date")
    created_at: datetime = Field(..., description="Timestamp")

    @field_validator("mood_score", mode="before")
    @classmethod
    def default_mood_score(cls, v: Any) -> Any:
        if v is None:
            return 3
        return v


class MoodStatsDtoOut(BaseModel):
    total_entries: int = 0
    average_score: float = 0.0
    mood_counts: Dict[str, int] = Field(default_factory=dict)
    dominant_mood: str = "Calm"
    streak_days: int = 0


MoodEntryResponse = MoodEntryOut
