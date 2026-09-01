package com.kintsugi.app.features.moodtracker.ui.model

import com.kintsugi.app.core.common.MoodOptions

data class MoodStatisticsData(
    val period: AnalyticsPeriod,
    val totalLogs: Int,
    val averageMoodScore: Float,
    val streakDays: Int,
    val mostCommonMood: MoodOptions?,
    val consistencyPercentage: Int,
    val bestDayName: String,
    val lowestDayName: String
)
