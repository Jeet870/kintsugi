package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AchievementDto(
    @SerialName("id") val id: String,
    @SerialName("title") val title: String,
    @SerialName("description") val description: String,
    @SerialName("icon_url") val iconUrl: String? = null,
    @SerialName("earned_at") val earnedAt: Long? = null,
    @SerialName("is_unlocked") val isUnlocked: Boolean = false,
    @SerialName("progress") val progress: Int = 100
)
