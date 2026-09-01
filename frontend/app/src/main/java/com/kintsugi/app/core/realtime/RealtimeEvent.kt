package com.kintsugi.app.core.realtime

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
sealed interface RealtimeEvent {

    @Serializable
    @SerialName("mood.entry_updated")
    data class MoodEntryUpdated(
        val moodId: String,
        val moodScore: Int,
        val aiMessage: String? = null,
        val timestamp: Long = System.currentTimeMillis()
    ) : RealtimeEvent

    @Serializable
    @SerialName("chat.message_new")
    data class ChatMessageNew(
        val messageId: String,
        val text: String,
        val isUser: Boolean,
        val timestamp: Long = System.currentTimeMillis()
    ) : RealtimeEvent

    @Serializable
    @SerialName("chat.message_delta")
    data class ChatMessageDelta(
        val messageId: String,
        val deltaText: String
    ) : RealtimeEvent

    @Serializable
    @SerialName("chat.message_reasoning")
    data class ChatMessageReasoning(
        val messageId: String,
        val reasoningText: String
    ) : RealtimeEvent

    @Serializable
    @SerialName("chat.message_completed")
    data class ChatMessageCompleted(
        val messageId: String,
        val finalText: String
    ) : RealtimeEvent

    @Serializable
    @SerialName("chat.typing")
    data class ChatTyping(
        val sessionId: String,
        val isTyping: Boolean
    ) : RealtimeEvent

    @Serializable
    @SerialName("chat.escalation")
    data class ChatEscalation(
        val alertId: String,
        val severity: String,
        val helplineNumber: String
    ) : RealtimeEvent

    @Serializable
    @SerialName("streak.updated")
    data class StreakUpdated(
        val streakDays: Int
    ) : RealtimeEvent

    @Serializable
    @SerialName("achievement.earned")
    data class AchievementEarned(
        val achievementId: String,
        val title: String,
        val badgeUrl: String
    ) : RealtimeEvent

    @Serializable
    @SerialName("notification.new")
    data class NotificationNew(
        val notificationId: String,
        val title: String,
        val body: String
    ) : RealtimeEvent

    @Serializable
    @SerialName("session.expired")
    data class SessionInvalidated(
        val reason: String = "Session expired"
    ) : RealtimeEvent

    @Serializable
    @SerialName("profile.updated")
    data class ProfileUpdated(
        val userId: String
    ) : RealtimeEvent

    @Serializable
    @SerialName("settings.updated")
    data class SettingsUpdated(
        val timestamp: Long = System.currentTimeMillis()
    ) : RealtimeEvent

    @Serializable
    @SerialName("unknown")
    data class UnknownEvent(
        val rawPayload: String = ""
    ) : RealtimeEvent
}
