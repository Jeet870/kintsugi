package com.kintsugi.app.core.common

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object DateFormatUtils {

    private val dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy", Locale.getDefault())
    private val timeFormatter = DateTimeFormatter.ofPattern("h:mm a", Locale.getDefault())
    private val dateTimeFormatter = DateTimeFormatter.ofPattern("MMM dd, h:mm a", Locale.getDefault())

    fun formatShortDate(instant: Instant): String {
        return instant.atZone(ZoneId.systemDefault()).format(dateFormatter)
    }

    fun formatTime(instant: Instant): String {
        return instant.atZone(ZoneId.systemDefault()).format(timeFormatter)
    }

    fun formatDateTime(instant: Instant): String {
        return instant.atZone(ZoneId.systemDefault()).format(dateTimeFormatter)
    }

    fun formatTimestamp(epochMilli: Long): String {
        return formatShortDate(Instant.ofEpochMilli(epochMilli))
    }

    fun formatRelativeDay(instant: Instant): String {
        val date = instant.atZone(ZoneId.systemDefault()).toLocalDate()
        val today = LocalDate.now(ZoneId.systemDefault())
        return when {
            date.isEqual(today) -> "Today"
            date.isEqual(today.minusDays(1)) -> "Yesterday"
            else -> formatShortDate(instant)
        }
    }

    fun isToday(instant: Instant): Boolean {
        val date = instant.atZone(ZoneId.systemDefault()).toLocalDate()
        return date.isEqual(LocalDate.now(ZoneId.systemDefault()))
    }

    fun isYesterday(instant: Instant): Boolean {
        val date = instant.atZone(ZoneId.systemDefault()).toLocalDate()
        return date.isEqual(LocalDate.now(ZoneId.systemDefault()).minusDays(1))
    }
}
