"""
Achievement & Badge Schemas.
Defines Pydantic v2 validation models for catalog achievements and user earned achievements.
"""
import typing
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator


class AchievementOut(BaseModel):
    """
    Response payload for achievement catalog items.
    """
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = Field(None, description="Achievement database ID")
    code: str = Field(..., description="Stable achievement code identifier")
    title: str = Field(..., description="Achievement title")
    description: str = Field(..., description="Achievement description")
    icon_url: Optional[str] = Field(None, description="Icon URL for badge graphic")

    @model_validator(mode="before")
    @classmethod
    def populate_code_from_badge_key(cls, data: typing.Any) -> typing.Any:
        if hasattr(data, "code") or (isinstance(data, dict) and "code" in data):
            return data
        if hasattr(data, "badge_key"):
            code_val = getattr(data, "badge_key")
            name_val = getattr(data, "name", "")
            return {
                "id": getattr(data, "id", None),
                "code": code_val,
                "title": name_val,
                "description": getattr(data, "description", ""),
                "icon_url": getattr(data, "icon_url", None),
            }
        if isinstance(data, dict) and "badge_key" in data:
            data["code"] = data["badge_key"]
            if "title" not in data and "name" in data:
                data["title"] = data["name"]
        return data


# Alias for backward compatibility
AchievementResponse = AchievementOut


class UserAchievementOut(BaseModel):
    """
    Response payload for earned user achievements displayed on profile screens.
    """
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = Field(None, description="User achievement ID")
    user_id: Optional[int] = Field(None, description="User ID")
    achievement: AchievementOut = Field(..., description="Earned achievement metadata")
    earned_at: datetime = Field(..., description="Timestamp when achievement was earned")

    @model_validator(mode="before")
    @classmethod
    def map_unlocked_at_field(cls, data: typing.Any) -> typing.Any:
        if isinstance(data, dict):
            if "earned_at" not in data and "unlocked_at" in data:
                data["earned_at"] = data["unlocked_at"]
        elif hasattr(data, "earned_at"):
            pass
        elif hasattr(data, "unlocked_at"):
            return {
                "id": getattr(data, "id", None),
                "user_id": getattr(data, "user_id", None),
                "achievement": getattr(data, "achievement", None),
                "earned_at": getattr(data, "unlocked_at"),
            }
        return data


# Alias for backward compatibility
UserAchievementResponse = UserAchievementOut


class UserAchievementsAndStreakOut(BaseModel):
    """
    Response payload for user's earned achievements and active streak statistics.
    """
    earned_achievements: typing.List[UserAchievementOut] = Field(default_factory=list, description="List of earned badges")
    current_streak: int = Field(0, description="Current active mood logging streak in days")
    longest_streak: int = Field(0, description="Longest historical mood logging streak in days")
    last_logged_date: Optional[str] = Field(None, description="Date of last logged mood entry")
    journal_count: int = Field(0, description="Total encrypted journal entries written by user")
    mood_count: int = Field(0, description="Total mood check-ins completed by user")
    chat_count: int = Field(0, description="Total AI Companion chat sessions conducted by user")
