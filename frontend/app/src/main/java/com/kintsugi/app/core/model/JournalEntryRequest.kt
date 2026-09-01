package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class JournalEntryRequest(
    @SerialName("title") val title: String,
    @SerialName("content") val content: String,
    @SerialName("mood_tag") val moodTag: String? = null,
    @SerialName("is_favorite") val isFavorite: Boolean? = null,
    @SerialName("is_pinned") val isPinned: Boolean? = null
)
