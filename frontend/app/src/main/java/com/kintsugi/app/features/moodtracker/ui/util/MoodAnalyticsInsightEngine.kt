package com.kintsugi.app.features.moodtracker.ui.util

import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.database.entity.mood
import java.time.LocalDate
import java.time.ZoneId

object MoodAnalyticsInsightEngine {

    fun generateInsight(entries: List<MoodEntryEntity>): String {
        if (entries.isEmpty()) {
            return "Start logging your daily moods to unlock personalized emotional pattern insights."
        }

        // 1. Calculate Streak
        val loggedDates = entries.map { it.createdAt.atZone(ZoneId.systemDefault()).toLocalDate() }.toSet()
        var streak = 0
        var checkDate = LocalDate.now()
        while (loggedDates.contains(checkDate)) {
            streak++
            checkDate = checkDate.minusDays(1)
        }

        if (streak >= 3) {
            return "You've logged your mood on $streak consecutive days. Consistency is key to emotional awareness!"
        }

        // 2. Calculate Dominant Mood
        val moodCounts = entries.groupingBy { it.mood }.eachCount()
        val dominantMood = moodCounts.maxByOrNull { it.value }?.key

        if (dominantMood != null) {
            val moodLabel = dominantMood.label.lowercase()
            return when (moodLabel) {
                "calm", "peaceful" -> "You've been mostly calm recently. Keep nurturing these serene moments."
                "happy", "joyful" -> "Your emotional spectrum shows high positivity! Radiate that joyful energy."
                "anxious" -> "Noticeable anxiety trends detected. Taking 3 slow, deep breaths can help re-center your body."
                "sad" -> "It's okay to feel low sometimes. Consider writing a brief journal entry to process your emotions."
                "tired" -> "High fatigue detected in your entries. Prioritizing rest and quiet sleep will restore your vitality."
                else -> "You're actively checking in with your feelings. That self-awareness is your superpower."
            }
        }

        return "Every check-in brings clarity. Keep reflecting on your journey."
    }
}
