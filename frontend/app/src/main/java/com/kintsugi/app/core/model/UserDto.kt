package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserDto(
    @Serializable(with = FlexibleIdSerializer::class)
    @SerialName("id") val id: String,
    @SerialName("name") val name: String? = null,
    @SerialName("email") val email: String,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    @SerialName("notification_enabled") val notificationEnabled: Boolean = true,
    @SerialName("streak_days") val streakDays: Int = 0,
    @Serializable(with = FlexibleTimestampSerializer::class)
    @SerialName("created_at") val createdAt: Long = System.currentTimeMillis()
)
