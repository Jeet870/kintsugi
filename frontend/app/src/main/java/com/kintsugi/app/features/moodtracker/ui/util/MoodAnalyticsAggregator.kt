package com.kintsugi.app.features.moodtracker.ui.util

import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.database.entity.mood
import com.kintsugi.app.features.moodtracker.ui.model.AnalyticsPeriod
import com.kintsugi.app.features.moodtracker.ui.model.MoodStatisticsData
import com.kintsugi.app.features.moodtracker.ui.model.MoodTrendPoint
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

object MoodAnalyticsAggregator {

    private val hourFormatter = DateTimeFormatter.ofPattern("HH:00").withZone(ZoneId.systemDefault())
    private val dayOfWeekFormatter = DateTimeFormatter.ofPattern("EEE").withZone(ZoneId.systemDefault())
    private val dayMonthFormatter = DateTimeFormatter.ofPattern("MMM d").withZone(ZoneId.systemDefault())
    private val monthFormatter = DateTimeFormatter.ofPattern("MMM").withZone(ZoneId.systemDefault())

    fun computeTrendPoints(entries: List<MoodEntryEntity>, period: AnalyticsPeriod): List<MoodTrendPoint> {
        if (entries.isEmpty()) return emptyList()
        val sorted = entries.sortedBy { it.createdAt }

        return when (period) {
            AnalyticsPeriod.TODAY -> {
                sorted.groupBy { hourFormatter.format(it.createdAt) }
                    .map { (label, group) ->
                        val avg = group.map { it.mood.chartValue }.average().toFloat()
                        MoodTrendPoint(label, avg)
                    }
            }
            AnalyticsPeriod.SEVEN_DAYS -> {
                sorted.groupBy { dayOfWeekFormatter.format(it.createdAt) }
                    .map { (label, group) ->
                        val avg = group.map { it.mood.chartValue }.average().toFloat()
                        MoodTrendPoint(label, avg)
                    }
            }
            AnalyticsPeriod.THIRTY_DAYS -> {
                sorted.groupBy { dayMonthFormatter.format(it.createdAt) }
                    .map { (label, group) ->
                        val avg = group.map { it.mood.chartValue }.average().toFloat()
                        MoodTrendPoint(label, avg)
                    }
            }
            AnalyticsPeriod.NINETY_DAYS -> {
                sorted.groupBy {
                    val date = it.createdAt.atZone(ZoneId.systemDefault()).toLocalDate()
                    "Wk ${date.dayOfYear / 7}"
                }.map { (label, group) ->
                    val avg = group.map { it.mood.chartValue }.average().toFloat()
                    MoodTrendPoint(label, avg)
                }
            }
            AnalyticsPeriod.ALL -> {
                sorted.groupBy { monthFormatter.format(it.createdAt) }
                    .map { (label, group) ->
                        val avg = group.map { it.mood.chartValue }.average().toFloat()
                        MoodTrendPoint(label, avg)
                    }
            }
        }
    }

    fun computeStatistics(entries: List<MoodEntryEntity>, period: AnalyticsPeriod): MoodStatisticsData {
        val totalLogs = entries.size
        if (entries.isEmpty()) {
            return MoodStatisticsData(
                period = period,
                totalLogs = 0,
                averageMoodScore = 0f,
                streakDays = 0,
                mostCommonMood = null,
                consistencyPercentage = 0,
                bestDayName = "-",
                lowestDayName = "-"
            )
        }

        val avgScore = entries.map { it.mood.chartValue }.average().toFloat()
        val moodCounts = entries.groupingBy { it.mood }.eachCount()
        val mostCommon = moodCounts.maxByOrNull { it.value }?.key

        // Streak
        val loggedDates = entries.map { it.createdAt.atZone(ZoneId.systemDefault()).toLocalDate() }.toSet()
        var streak = 0
        var checkDate = LocalDate.now()
        while (loggedDates.contains(checkDate)) {
            streak++
            checkDate = checkDate.minusDays(1)
        }

        // Days with entries in period
        val targetDays = period.days.coerceAtMost(30)
        val consistency = ((loggedDates.size.toFloat() / targetDays.toFloat()) * 100).toInt().coerceAtMost(100)

        // Best & Lowest Day
        val dayAverages = entries.groupBy { dayOfWeekFormatter.format(it.createdAt) }
            .mapValues { (_, group) -> group.map { it.mood.chartValue }.average() }

        val bestDay = dayAverages.maxByOrNull { it.value }?.key ?: "-"
        val lowestDay = dayAverages.minByOrNull { it.value }?.key ?: "-"

        return MoodStatisticsData(
            period = period,
            totalLogs = totalLogs,
            averageMoodScore = avgScore,
            streakDays = streak,
            mostCommonMood = mostCommon,
            consistencyPercentage = consistency,
            bestDayName = bestDay,
            lowestDayName = lowestDay
        )
    }
}
