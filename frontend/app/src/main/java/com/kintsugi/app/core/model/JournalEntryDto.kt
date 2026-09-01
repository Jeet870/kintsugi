package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class JournalEntryDto(
    @Serializable(with = FlexibleIdSerializer::class)
    @SerialName("id") val id: String,
    @SerialName("title") val title: String? = "Untitled",
    @SerialName("content") val content: String = "",
    @SerialName("mood_tag") val moodTag: String? = "Calm",
    @SerialName("ai_reflection") val aiReflection: String? = null,
    @SerialName("ai_summary") val aiSummary: String? = null,
    @SerialName("ai_title") val aiTitle: String? = null,
    @SerialName("is_favorite") val isFavorite: Boolean? = false,
    @SerialName("is_pinned") val isPinned: Boolean? = false,
    @SerialName("is_encrypted") val isEncrypted: Boolean? = true,
    @Serializable(with = FlexibleTimestampSerializer::class)
    @SerialName("created_at") val createdAt: Long = System.currentTimeMillis(),
    @Serializable(with = FlexibleTimestampSerializer::class)
    @SerialName("updated_at") val updatedAt: Long = System.currentTimeMillis()
)
