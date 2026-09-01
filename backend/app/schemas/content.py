"""
Motivational Content Schemas.
Defines Pydantic v2 validation models for daily quotes, affirmations, and self-care tips.
"""
import typing
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator

from app.core.constants import ContentType


class ContentItemOut(BaseModel):
    """
    Response payload for motivational content items shown on the Daily Motivation screen.
    Excludes internal database metadata fields.
    """
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = Field(None, description="Content item ID")
    type: ContentType = Field(..., description="Content type ('quote', 'affirmation', 'tip')")
    text: str = Field(..., description="Motivational content body text")
    category: Optional[str] = Field(None, description="Category or tag")

    @model_validator(mode="before")
    @classmethod
    def populate_text_from_content_body(cls, data: typing.Any) -> typing.Any:
        if hasattr(data, "text") or (isinstance(data, dict) and "text" in data):
            return data
        if hasattr(data, "content_body"):
            return {
                "id": getattr(data, "id", None),
                "type": getattr(data, "type", ContentType.QUOTE),
                "text": getattr(data, "content_body"),
                "category": getattr(data, "category", None),
            }
        if isinstance(data, dict) and "content_body" in data:
            data["text"] = data["content_body"]
        return data


# Alias for backward compatibility
ContentItemResponse = ContentItemOut
