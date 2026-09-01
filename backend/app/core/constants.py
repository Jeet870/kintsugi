"""
Centralized Enums and Application Constants.
Single source of truth matching MySQL schema enums and system-wide domain values.
"""
from enum import Enum


class MoodType(str, Enum):
    HAPPY = "happy"
    CALM = "calm"
    SAD = "sad"
    ANGRY = "angry"
    ANXIOUS = "anxious"
    TIRED = "tired"


class ChatSender(str, Enum):
    USER = "user"
    AI = "ai"
    SYSTEM = "system"


class ChatSessionStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    ESCALATED = "escalated"


class ContentType(str, Enum):
    QUOTE = "quote"
    AFFIRMATION = "affirmation"
    TIP = "tip"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    COUNSELOR = "counselor"


class CrisisSeverity(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AchievementCode(str, Enum):
    FIRST_MOOD_LOGGED = "first_mood_logged"
    FIRST_JOURNAL_ENTRY = "first_journal_entry"
    STREAK_7_DAY = "7_day_streak"
    STREAK_30_DAY = "30_day_streak"
    COMPANION_CHATTER = "companion_chatter"
    WELLNESS_SEEKER = "wellness_seeker"
