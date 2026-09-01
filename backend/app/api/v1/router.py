"""
API Version 1 Router Aggregator.
Mounts all endpoint routers under /api/v1 with prefix routing and OpenAPI tag metadata.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    profile,
    mood,
    journal,
    chat,
    content,
    emergency,
    achievements,
    notifications,
    health,
    ml,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Session"])
api_router.include_router(users.router, prefix="/users", tags=["User Profile"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile & Mobile Compatibility"])
api_router.include_router(mood.router, prefix="/mood", tags=["Mood Check-ins"])
api_router.include_router(journal.router, prefix="/journal", tags=["Encrypted Journal"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Companion Chat"])
api_router.include_router(content.router, prefix="/content", tags=["Daily Motivation"])
api_router.include_router(emergency.router, prefix="/emergency", tags=["Crisis & Helplines"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements & Badges"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications & Alerts"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning Models"])
api_router.include_router(health.router, prefix="/health", tags=["Health & Monitoring"])
