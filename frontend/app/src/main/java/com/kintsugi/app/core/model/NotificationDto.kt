package com.kintsugi.app.core.model

import androidx.annotation.DrawableRes

/**
 * Data class representing a notification item in the Notification Center.
 */
data class NotificationDto(
    val id: String,
    val title: String,
    val description: String,
    val timeAgo: String,
    val section: NotificationSection,
    @DrawableRes val iconResId: Int,
    val isRead: Boolean = false
)

enum class NotificationSection {
    TODAY,
    YESTERDAY,
    EARLIER
}
