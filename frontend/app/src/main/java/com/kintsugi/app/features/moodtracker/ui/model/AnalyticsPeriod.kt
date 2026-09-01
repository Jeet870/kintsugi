package com.kintsugi.app.features.moodtracker.ui.model

import java.util.Calendar

enum class AnalyticsPeriod(val label: String, val days: Int) {
    TODAY("Today", 1),
    SEVEN_DAYS("Last 7 Days", 7),
    THIRTY_DAYS("Last 30 Days", 30),
    NINETY_DAYS("Last 90 Days", 90),
    ALL("All Time", 3650);

    fun getStartTimestamp(): Long {
        if (this == ALL) return 0L
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (days > 1) {
                add(Calendar.DAY_OF_YEAR, -(days - 1))
            }
        }
        return calendar.timeInMillis
    }
}
