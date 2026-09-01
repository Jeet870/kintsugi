package com.kintsugi.app.core.network

object ApiConstants {
    const val API_VERSION = "v1"
    const val API_PREFIX = "/api/v1/"

    const val HEADER_AUTHORIZATION = "Authorization"
    const val TOKEN_PREFIX = "Bearer "
    const val HEADER_ACCEPT = "Accept"
    const val HEADER_CONTENT_TYPE = "Content-Type"
    const val VALUE_JSON = "application/json"

    object Auth {
        const val LOGIN = "auth/login"
        const val REGISTER = "auth/register"
        const val REFRESH_TOKEN = "auth/refresh"
        const val LOGOUT = "auth/logout"
        const val FORGOT_PASSWORD = "auth/forgot-password"
        const val RESET_PASSWORD = "auth/reset-password"
    }

    object Users {
        const val ME = "users/me"
        const val UPDATE_PROFILE = "users/profile"
        const val UPLOAD_AVATAR = "users/avatar"
    }

    object Mood {
        const val LOG = "mood/entries"
        const val HISTORY = "mood/history"
        const val STATS = "mood/stats"
    }

    object Journal {
        const val ENTRIES = "journal/entries"
        fun details(id: Long) = "journal/entries/$id"
    }

    object AICompanion {
        const val CHAT = "chat/messages"
        const val SESSIONS = "chat/sessions"
    }

    object DailyContent {
        const val MOTIVATION = "content/motivation"
        const val AFFIRMATIONS = "content/affirmations"
    }

    object Emergency {
        const val HELPLINES = "emergency/helplines"
        const val CRISIS = "emergency/crisis"
    }

    object Profile {
        const val SUMMARY = "profile/summary"
        const val ACHIEVEMENTS = "profile/achievements"
        const val STREAK = "profile/streak"
    }

    object WebSocketEvents {
        const val MOOD_ENTRY_UPDATED = "mood.entry_updated"
        const val CHAT_MESSAGE_NEW = "chat.message_new"
        const val CHAT_TYPING = "chat.typing"
        const val CHAT_ESCALATION = "chat.escalation"
        const val STREAK_UPDATED = "streak.updated"
        const val ACHIEVEMENT_EARNED = "achievement.earned"
        const val NOTIFICATION_NEW = "notification.new"
        const val SESSION_EXPIRED = "session.expired"
    }
}
