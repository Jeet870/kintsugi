"""
Daily Motivation Schemas.
Defines output models for automated daily motivation bundles.
"""
from datetime import date
from typing import List, Optional
from pydantic import BaseModel

from app.schemas.content import ContentItemOut


class DailyMotivationOut(BaseModel):
    """
    Automated Daily Motivation response payload containing today's quote, affirmations, and self-care tips.
    """
    id: int
    user_id: int
    content_date: date
    quote: ContentItemOut
    affirmations: List[ContentItemOut]
    tips: List[ContentItemOut]

    class Config:
        from_attributes = True


class ContentDtoOut(BaseModel):
    """
    Simplified daily motivation payload matching Android mobile client ContentDto expectations.
    """
    quote: str
    author: Optional[str] = "Kintsugi Philosophy"
    affirmations: List[str] = []
    self_care_tips: List[str] = []

