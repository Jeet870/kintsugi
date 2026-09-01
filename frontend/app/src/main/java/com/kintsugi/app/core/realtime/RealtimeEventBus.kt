package com.kintsugi.app.core.realtime

import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.contentOrNull
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Serializable
private data class RawEvent(
    val event: String,
    val payload: JsonObject? = null
)

@Singleton
class RealtimeEventBus @Inject constructor(
    private val webSocketManager: WebSocketManager,
    private val json: Json,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {
    private val busScope = CoroutineScope(SupervisorJob() + ioDispatcher)

    private val _events = MutableSharedFlow<RealtimeEvent>(
        replay = 0,
        extraBufferCapacity = 64,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<RealtimeEvent> = _events.asSharedFlow()

    init {
        observeWebSocketMessages()
    }

    private fun observeWebSocketMessages() {
        busScope.launch {
            webSocketManager.incomingMessages.collect { rawJson ->
                try {
                    val event = parseJson(rawJson)
                    _events.emit(event)
                } catch (e: Exception) {
                    Timber.e(e, "Error parsing incoming realtime WebSocket event: $rawJson")
                    _events.emit(RealtimeEvent.UnknownEvent(rawJson))
                }
            }
        }
    }

    private fun parseJson(jsonString: String): RealtimeEvent {
        return try {
            val raw = json.decodeFromString<RawEvent>(jsonString)
            val payload = raw.payload

            when (raw.event) {
                "mood.entry_updated" -> {
                    val id = payload?.get("mood_id")?.jsonPrimitive?.content ?: ""
                    val score = payload?.get("mood_score")?.jsonPrimitive?.intOrNull ?: 3
                    val aiMsg = payload?.get("ai_message")?.jsonPrimitive?.contentOrNull
                    val ts = payload?.get("timestamp")?.jsonPrimitive?.longOrNull ?: System.currentTimeMillis()
                    RealtimeEvent.MoodEntryUpdated(id, score, aiMsg, ts)
                }
                "chat.message_new" -> {
                    val id = payload?.get("message_id")?.jsonPrimitive?.content ?: ""
                    val text = payload?.get("text")?.jsonPrimitive?.content ?: ""
                    val isUser = payload?.get("is_user")?.jsonPrimitive?.booleanOrNull ?: false
                    val ts = payload?.get("timestamp")?.jsonPrimitive?.longOrNull ?: System.currentTimeMillis()
                    RealtimeEvent.ChatMessageNew(id, text, isUser, ts)
                }
                "chat.typing" -> {
                    val id = payload?.get("session_id")?.jsonPrimitive?.content ?: ""
                    val typing = payload?.get("is_typing")?.jsonPrimitive?.booleanOrNull ?: false
                    RealtimeEvent.ChatTyping(id, typing)
                }
                "chat.escalation" -> {
                    val alertId = payload?.get("alert_id")?.jsonPrimitive?.content ?: ""
                    val severity = payload?.get("severity")?.jsonPrimitive?.content ?: "MEDIUM"
                    val helpline = payload?.get("helpline_number")?.jsonPrimitive?.content ?: "988"
                    RealtimeEvent.ChatEscalation(alertId, severity, helpline)
                }
                "streak.updated" -> {
                    val days = payload?.get("streak_days")?.jsonPrimitive?.intOrNull ?: 1
                    RealtimeEvent.StreakUpdated(days)
                }
                "achievement.earned" -> {
                    val id = payload?.get("achievement_id")?.jsonPrimitive?.content ?: ""
                    val title = payload?.get("title")?.jsonPrimitive?.content ?: ""
                    val badge = payload?.get("badge_url")?.jsonPrimitive?.content ?: ""
                    RealtimeEvent.AchievementEarned(id, title, badge)
                }
                "notification.new" -> {
                    val id = payload?.get("notification_id")?.jsonPrimitive?.content ?: ""
                    val title = payload?.get("title")?.jsonPrimitive?.content ?: ""
                    val body = payload?.get("body")?.jsonPrimitive?.content ?: ""
                    RealtimeEvent.NotificationNew(id, title, body)
                }
                "session.expired" -> {
                    val reason = payload?.get("reason")?.jsonPrimitive?.content ?: "Session expired"
                    RealtimeEvent.SessionInvalidated(reason)
                }
                "profile.updated" -> {
                    val uid = payload?.get("user_id")?.jsonPrimitive?.content ?: ""
                    RealtimeEvent.ProfileUpdated(uid)
                }
                "settings.updated" -> {
                    val ts = payload?.get("timestamp")?.jsonPrimitive?.longOrNull ?: System.currentTimeMillis()
                    RealtimeEvent.SettingsUpdated(ts)
                }
                else -> RealtimeEvent.UnknownEvent(jsonString)
            }
        } catch (e: Exception) {
            RealtimeEvent.UnknownEvent(jsonString)
        }
    }
}
