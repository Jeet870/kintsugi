package com.kintsugi.app.core.model

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import java.util.Locale

object ChatSenderSerializer : KSerializer<ChatSender> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("ChatSender", PrimitiveKind.STRING)

    override fun serialize(encoder: Encoder, value: ChatSender) {
        encoder.encodeString(value.name)
    }

    override fun deserialize(decoder: Decoder): ChatSender {
        val raw = decoder.decodeString().trim().uppercase(Locale.ROOT)
        return when (raw) {
            "USER" -> ChatSender.USER
            "AI", "ASSISTANT", "COMPANION" -> ChatSender.AI
            "SYSTEM" -> ChatSender.SYSTEM
            else -> ChatSender.USER
        }
    }
}

@Serializable(with = ChatSenderSerializer::class)
enum class ChatSender {
    @SerialName("USER") USER,
    @SerialName("AI") AI,
    @SerialName("SYSTEM") SYSTEM
}

@Serializable
data class ChatMessageDto(
    @Serializable(with = FlexibleIdSerializer::class)
    @SerialName("id") val id: String,
    @SerialName("sender") val sender: ChatSender = ChatSender.USER,
    @SerialName("text") val text: String = "",
    @SerialName("content") val contentText: String? = null,
    @SerialName("reasoning") val reasoning: String? = null,
    @SerialName("is_streaming") val isStreaming: Boolean = false,
    @Serializable(with = FlexibleTimestampSerializer::class)
    @SerialName("created_at") val createdAt: Long = System.currentTimeMillis()
) {
    val messageText: String
        get() {
            val raw = contentText?.takeIf { it.isNotBlank() } ?: text
            val cleaned = raw.replace(Regex("(?s)<think>.*?</think>"), "").trim()
            return if (cleaned.isNotBlank()) cleaned else raw
        }

    val extractedReasoning: String?
        get() {
            if (!reasoning.isNullOrBlank()) return reasoning.trim()
            val raw = contentText?.takeIf { it.isNotBlank() } ?: text
            val match = Regex("(?s)<think>(.*?)</think>").find(raw)
            return match?.groupValues?.get(1)?.trim()?.takeIf { it.isNotBlank() }
        }
}

@Serializable
data class ChatSessionDto(
    @Serializable(with = FlexibleIdSerializer::class)
    @SerialName("id") val id: String,
    @SerialName("title") val title: String? = "New Conversation",
    @SerialName("last_message_preview") val lastMessagePreview: String? = null,
    @SerialName("message_count") val messageCount: Int = 0,
    @Serializable(with = FlexibleTimestampSerializer::class)
    @SerialName("created_at") val createdAt: Long = System.currentTimeMillis(),
    @Serializable(with = FlexibleTimestampSerializer::class)
    @SerialName("updated_at") val updatedAt: Long = System.currentTimeMillis(),
    @SerialName("messages") val messages: List<ChatMessageDto> = emptyList()
) {
    val cleanTitle: String
        get() {
            val raw = title?.takeIf { it.isNotBlank() } ?: "New Conversation"
            val cleaned = raw.replace(Regex("(?s)<think>.*?</think>"), "").trim()
            return if (cleaned.isNotBlank()) cleaned else "New Conversation"
        }

    val cleanPreview: String
        get() {
            val raw = lastMessagePreview?.takeIf { it.isNotBlank() } ?: "No messages yet"
            val cleaned = raw.replace(Regex("(?s)<think>.*?</think>"), "").trim()
            return if (cleaned.isNotBlank()) cleaned else "No messages yet"
        }
}
