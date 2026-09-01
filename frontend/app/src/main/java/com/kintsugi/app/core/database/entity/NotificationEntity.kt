package com.kintsugi.app.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.kintsugi.app.core.model.NotificationDto
import com.kintsugi.app.core.model.NotificationSection

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val description: String,
    val timeAgo: String,
    val section: String,
    val iconResId: Int,
    val isRead: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
) {
    fun toDto(): NotificationDto {
        val sec = try {
            NotificationSection.valueOf(section)
        } catch (_: Exception) {
            NotificationSection.TODAY
        }
        return NotificationDto(
            id = id,
            title = title,
            description = description,
            timeAgo = timeAgo,
            section = sec,
            iconResId = iconResId,
            isRead = isRead
        )
    }
}
