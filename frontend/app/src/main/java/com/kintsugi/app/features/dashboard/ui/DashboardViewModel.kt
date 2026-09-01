package com.kintsugi.app.features.dashboard.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.database.entity.JournalEntryEntity
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.database.entity.mood
import com.kintsugi.app.core.model.AchievementDto
import com.kintsugi.app.core.model.ContentDto
import com.kintsugi.app.core.model.StreakDto
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.repository.SessionRepository
import com.kintsugi.app.features.dashboard.data.DashboardPreferencesRepository
import com.kintsugi.app.features.dashboard.data.QuickActionModel
import com.kintsugi.app.features.journal.data.JournalRepository
import com.kintsugi.app.features.moodtracker.MoodRepository
import com.kintsugi.app.features.motivation.data.ContentRepository
import com.kintsugi.app.features.notification.data.NotificationRepository
import com.kintsugi.app.features.profile.data.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import java.util.Calendar
import javax.inject.Inject

/**
 * Hilt ViewModel combining application-wide reactive data sources into a single [DashboardUiState]
 * and exposing customizable Quick Action cards directly from [DashboardPreferencesRepository].
 */
@HiltViewModel
class DashboardViewModel @Inject constructor(
    sessionRepository: SessionRepository,
    moodRepository: MoodRepository,
    profileRepository: ProfileRepository,
    contentRepository: ContentRepository,
    journalRepository: JournalRepository,
    private val dashboardPreferencesRepository: DashboardPreferencesRepository,
    private val notificationRepository: NotificationRepository
) : ViewModel() {

    val quickActionsState: StateFlow<List<QuickActionModel>> = dashboardPreferencesRepository.actionsFlow
    val unreadNotificationCount: StateFlow<Int> = notificationRepository.unreadCountState

    val uiState: StateFlow<DashboardUiState> = combine(
        sessionRepository.currentUser,
        profileRepository.profileState,
        moodRepository.observeMoodHistory(),
        profileRepository.streakState,
        profileRepository.achievementsState,
        contentRepository.contentState,
        journalRepository.observeEntries()
    ) { arrayOfFlows ->
        @Suppress("UNCHECKED_CAST")
        val sessionUser = arrayOfFlows[0] as UserDto?
        @Suppress("UNCHECKED_CAST")
        val profileRes = arrayOfFlows[1] as Result<UserDto>
        @Suppress("UNCHECKED_CAST")
        val moods = (arrayOfFlows[2] as? List<MoodEntryEntity>) ?: emptyList()
        @Suppress("UNCHECKED_CAST")
        val streakRes = arrayOfFlows[3] as Result<StreakDto>
        @Suppress("UNCHECKED_CAST")
        val achievementsRes = arrayOfFlows[4] as Result<List<AchievementDto>>
        @Suppress("UNCHECKED_CAST")
        val contentRes = arrayOfFlows[5] as Result<ContentDto>
        @Suppress("UNCHECKED_CAST")
        val journals = (arrayOfFlows[6] as? List<JournalEntryEntity>) ?: emptyList()

        val user = if (profileRes is Result.Success) profileRes.data else sessionUser
        val greeting = calculateGreeting()
        val currentStreak = if (streakRes is Result.Success) streakRes.data.currentStreak else (user?.streakDays ?: 1)
        val latestEntry = moods.firstOrNull()
        val currentMood = latestEntry?.mood
        val achievements = if (achievementsRes is Result.Success) achievementsRes.data else emptyList()
        val quote = if (contentRes is Result.Success) contentRes.data else null
        val statsMap = moods.groupingBy { it.mood }.eachCount()

        val latestInsight = latestEntry?.aiMessage ?: "Small steps every day bring inner strength, resilience, and lasting peace."

        DashboardUiState(
            greeting = greeting,
            user = user,
            currentStreak = currentStreak,
            currentMood = currentMood,
            latestMoodEntry = latestEntry,
            latestAiInsight = latestInsight,
            moodHistory = moods,
            journalCount = journals.size,
            achievements = achievements,
            quote = quote,
            moodStatsMap = statsMap,
            isLoading = false
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DashboardUiState(greeting = calculateGreeting())
    )

    private fun calculateGreeting(): String {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        return when (hour) {
            in 5..11 -> "Good Morning"
            in 12..16 -> "Good Afternoon"
            in 17..21 -> "Good Evening"
            else -> "Good Night"
        }
    }
}
