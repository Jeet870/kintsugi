package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request payload DTO for updating user profile preferences and details.
 */
@Serializable
data class UpdateProfileRequest(
    @SerialName("name") val name: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    @SerialName("notification_enabled") val notificationEnabled: Boolean? = null
)
