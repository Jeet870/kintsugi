package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import java.time.Instant
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

/**
 * Flexible ID serializer that accepts both String and Int from backend.
 */
object FlexibleIdSerializer : KSerializer<String> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("FlexibleId", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: String) = encoder.encodeString(value)
    override fun deserialize(decoder: Decoder): String {
        val element = decoder.decodeSerializableValue(JsonElement.serializer())
        return when (element) {
            is JsonPrimitive -> element.content
            else -> element.toString()
        }
    }
}

/**
 * Flexible timestamp serializer that accepts both Long millis and ISO datetime strings.
 */
object FlexibleTimestampSerializer : KSerializer<Long> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("FlexibleTimestamp", PrimitiveKind.LONG)
    override fun serialize(encoder: Encoder, value: Long) = encoder.encodeLong(value)
    override fun deserialize(decoder: Decoder): Long {
        val element = decoder.decodeSerializableValue(JsonElement.serializer())
        return when {
            element is JsonPrimitive && element.isString -> {
                parseIsoToMillis(element.content)
            }
            element is JsonPrimitive -> {
                element.content.toLongOrNull() ?: System.currentTimeMillis()
            }
            else -> System.currentTimeMillis()
        }
    }

    private fun parseIsoToMillis(iso: String): Long {
        return try {
            ZonedDateTime.parse(iso, DateTimeFormatter.ISO_OFFSET_DATE_TIME).toInstant().toEpochMilli()
        } catch (_: DateTimeParseException) {
            try {
                Instant.parse(iso).toEpochMilli()
            } catch (_: DateTimeParseException) {
                System.currentTimeMillis()
            }
        }
    }
}

@Serializable
data class MoodEntryDto(
    @Serializable(with = FlexibleIdSerializer::class)
    @SerialName("id") val id: String,
    @SerialName("mood_type") val moodType: String = "calm",
    @SerialName("mood_score") val moodScore: Int = 3,
    @SerialName("note") val note: String? = null,
    @SerialName("ai_message") val aiMessage: String? = null,
    @Serializable(with = FlexibleTimestampSerializer::class)
    @SerialName("created_at") val createdAt: Long = System.currentTimeMillis()
)
