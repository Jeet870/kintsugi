package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class HelplinePriority {
    @SerialName("HIGH") HIGH,
    @SerialName("MEDIUM") MEDIUM,
    @SerialName("LOW") LOW
}

@Serializable
data class HelplineDto(
    @SerialName("id") val id: String = "",
    @SerialName("name") val name: String,
    @SerialName("phone_number") val phoneNumber: String,
    @SerialName("hours") val hours: String = "24/7",
    @SerialName("description") val description: String = "Free, confidential 24/7 support",
    @SerialName("category") val category: String = "Mental Health",
    @SerialName("country") val country: String = "US",
    @SerialName("priority") val priority: HelplinePriority = HelplinePriority.HIGH
)
