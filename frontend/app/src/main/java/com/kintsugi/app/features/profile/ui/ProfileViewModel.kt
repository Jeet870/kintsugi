package com.kintsugi.app.features.profile.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.database.entity.Mood
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.database.entity.mood
import com.kintsugi.app.core.model.AchievementDto
import com.kintsugi.app.core.model.StreakDto
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.features.moodtracker.MoodRepository
import com.kintsugi.app.features.moodtracker.ui.model.AnalyticsPeriod
import com.kintsugi.app.features.profile.data.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.launch
import javax.inject.Inject

data class EmotionalSummary(
    val mostCommonMood: String = "Calm",
    val percentage: Int = 62,
    val stability: String = "Very Stable",
    val reflectionText: String = "You've experienced more calm moments this week than last week."
)

/**
 * Single source of truth ViewModel for the Profile screen.
 */
@HiltViewModel
@OptIn(ExperimentalCoroutinesApi::class)
class ProfileViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
    private val moodRepository: MoodRepository
) : ViewModel() {

    val profileState: StateFlow<Result<UserDto>> = profileRepository.profileState
    val streakState: StateFlow<Result<StreakDto>> = profileRepository.streakState
    val achievementsState: StateFlow<Result<List<AchievementDto>>> = profileRepository.achievementsState
    val badgeUnlockEvents: SharedFlow<String> = profileRepository.badgeUnlockEvents

    private val _selectedPeriod = MutableStateFlow(AnalyticsPeriod.THIRTY_DAYS)
    val selectedPeriod: StateFlow<AnalyticsPeriod> = _selectedPeriod.asStateFlow()

    private val _userQuote = MutableStateFlow("Healing happens one step at a time")
    val userQuote: StateFlow<String> = _userQuote.asStateFlow()

    /**
     * Reactively computes mood frequency distribution filtered by the selected [AnalyticsPeriod].
     */
    val moodStatsState: StateFlow<Map<Mood, Int>> = _selectedPeriod
        .flatMapLatest { period: AnalyticsPeriod ->
            moodRepository.observeMoodHistory(period).map { entries: List<MoodEntryEntity> ->
                entries.groupingBy { it.mood }.eachCount()
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyMap()
        )

    /**
     * Reactively calculates emotional summary metrics.
     */
    val emotionalSummaryState: StateFlow<EmotionalSummary> = moodStatsState.map { stats ->
        if (stats.isEmpty()) {
            EmotionalSummary()
        } else {
            val total = stats.values.sum()
            val topMood = stats.maxByOrNull { it.value }
            val topName = topMood?.key?.name?.lowercase()?.replaceFirstChar { it.uppercase() } ?: "Calm"
            val pct = if (total > 0 && topMood != null) ((topMood.value.toDouble() / total) * 100).toInt() else 62

            val stabilityText = when {
                pct >= 50 -> "Very Stable"
                pct >= 30 -> "Balanced"
                else -> "Dynamic"
            }

            val reflection = "You've logged $total reflections with $topName being your predominant emotional state."

            EmotionalSummary(
                mostCommonMood = topName,
                percentage = pct,
                stability = stabilityText,
                reflectionText = reflection
            )
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = EmotionalSummary()
    )

    fun setPeriod(period: AnalyticsPeriod) {
        _selectedPeriod.value = period
    }

    fun updateUserProfile(newName: String, newQuote: String) {
        if (newQuote.isNotBlank()) {
            _userQuote.value = newQuote
        }
        val currentProfile = (profileState.value as? Result.Success<UserDto>)?.data
        if (currentProfile != null && newName.isNotBlank()) {
            viewModelScope.launch {
                profileRepository.refresh()
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            profileRepository.refresh()
        }
    }
}
