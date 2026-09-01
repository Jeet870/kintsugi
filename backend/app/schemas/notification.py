"""
Notification Pydantic Schemas.
"""
import typing
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator


class NotificationOut(BaseModel):
    """
    Response payload for user notification records.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Notification database ID")
    user_id: int = Field(..., description="User database ID")
    title: str = Field(..., description="Notification headline title")
    message: str = Field("", description="Notification message text")
    body: str = Field("", description="Raw message body text")
    is_read: bool = Field(False, description="Read state status")
    read: bool = Field(False, description="Read state status alias")
    category: Optional[str] = Field("general", description="Notification category")
    created_at: datetime = Field(..., description="Record creation timestamp")

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data: typing.Any) -> typing.Any:
        if hasattr(data, "body"):
            body_val = getattr(data, "body", "")
            is_read_val = getattr(data, "is_read", False)
            return {
                "id": getattr(data, "id", 0),
                "user_id": getattr(data, "user_id", 0),
                "title": getattr(data, "title", ""),
                "body": body_val,
                "message": body_val,
                "is_read": is_read_val,
                "read": is_read_val,
                "category": getattr(data, "category", "general") or "general",
                "created_at": getattr(data, "created_at", datetime.now()),
            }
        if isinstance(data, dict):
            body_val = data.get("body", data.get("message", ""))
            is_read_val = data.get("is_read", data.get("read", False))
            data["body"] = body_val
            data["message"] = body_val
            data["is_read"] = is_read_val
            data["read"] = is_read_val
            if "category" not in data or not data["category"]:
                data["category"] = "general"
        return data
