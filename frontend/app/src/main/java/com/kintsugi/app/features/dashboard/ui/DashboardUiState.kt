package com.kintsugi.app.features.dashboard.ui

import com.kintsugi.app.core.database.entity.Mood
import com.kintsugi.app.core.database.entity.MoodEntry
import com.kintsugi.app.core.model.AchievementDto
import com.kintsugi.app.core.model.ContentDto
import com.kintsugi.app.core.model.UserDto

/**
 * Immutable UI State for the Flagship Kintsugi Dashboard.
 */
data class DashboardUiState(
    val greeting: String = "Good Morning",
    val user: UserDto? = null,
    val currentStreak: Int = 1,
    val currentMood: Mood? = null,
    val latestMoodEntry: MoodEntry? = null,
    val latestAiInsight: String? = null,
    val moodHistory: List<MoodEntry> = emptyList(),
    val journalCount: Int = 0,
    val achievements: List<AchievementDto> = emptyList(),
    val quote: ContentDto? = null,
    val moodStatsMap: Map<Mood, Int> = emptyMap(),
    val isLoading: Boolean = false
)
