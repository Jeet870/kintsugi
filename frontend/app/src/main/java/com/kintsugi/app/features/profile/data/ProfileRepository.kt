package com.kintsugi.app.features.profile.data

import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.AchievementDto
import com.kintsugi.app.core.model.StreakDto
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.realtime.RealtimeEvent
import com.kintsugi.app.core.realtime.RealtimeEventBus
import com.kintsugi.app.core.repository.SessionRepository
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Central repository managing profile state, streak stats, and achievements.
 *
 * Listens reactively to [RealtimeEventBus] events to automatically update streak stats
 * and trigger one-time achievement unlock animations via [badgeUnlockEvents].
 */
@Singleton
class ProfileRepository @Inject constructor(
    private val profileApiService: ProfileApiService,
    private val sessionRepository: SessionRepository,
    private val realtimeEventBus: RealtimeEventBus,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    private val repositoryScope = CoroutineScope(SupervisorJob() + ioDispatcher)

    private val _profileState = MutableStateFlow<Result<UserDto>>(Result.Loading)
    val profileState: StateFlow<Result<UserDto>> = _profileState.asStateFlow()

    private val _streakState = MutableStateFlow<Result<StreakDto>>(Result.Loading)
    val streakState: StateFlow<Result<StreakDto>> = _streakState.asStateFlow()

    private val _achievementsState = MutableStateFlow<Result<List<AchievementDto>>>(Result.Loading)
    val achievementsState: StateFlow<Result<List<AchievementDto>>> = _achievementsState.asStateFlow()

    private val _badgeUnlockEvents = MutableSharedFlow<String>(extraBufferCapacity = 10)
    val badgeUnlockEvents: SharedFlow<String> = _badgeUnlockEvents.asSharedFlow()

    init {
        fetchProfileDataInternal()
        observeRealtimeEvents()
    }

    /**
     * Refreshes profile, streak, and achievements from the remote API.
     */
    suspend fun refresh(): Result<Unit> = withContext(ioDispatcher) {
        fetchProfileDataInternal()
        Result.Success(Unit)
    }

    private fun fetchProfileDataInternal() {
        repositoryScope.launch {
            // 1. Profile
            try {
                val profile = profileApiService.getProfile()
                _profileState.value = Result.Success(profile)
                sessionRepository.refreshUser(profile)
            } catch (e: Exception) {
                Timber.w(e, "Remote profile fetch failed.")
                val currentSessionUser = sessionRepository.currentUser.value
                if (currentSessionUser != null) {
                    _profileState.value = Result.Success(currentSessionUser)
                } else {
                    _profileState.value = Result.Error(e)
                }
            }

            // 2. Streak
            fetchStreakInternal()

            // 3. Achievements
            fetchAchievementsInternal()
        }
    }

    private suspend fun fetchStreakInternal() {
        try {
            val streak = profileApiService.getStreak()
            _streakState.value = Result.Success(streak)
        } catch (e: Exception) {
            Timber.w(e, "Remote streak fetch failed. Using fallback streak data.")
            _streakState.value = Result.Success(
                StreakDto(
                    currentStreak = 1,
                    longestStreak = 1,
                    lastActiveDate = "Today",
                    totalActiveDays = 1
                )
            )
        }
    }

    private suspend fun fetchAchievementsInternal() {
        try {
            val achievements = profileApiService.getAchievements()
            _achievementsState.value = Result.Success(achievements)
        } catch (e: Exception) {
            Timber.w(e, "Remote achievements fetch failed. Using empty list.")
            _achievementsState.value = Result.Success(emptyList())
        }
    }

    private fun observeRealtimeEvents() {
        repositoryScope.launch {
            realtimeEventBus.events.collect { event ->
                when (event) {
                    is RealtimeEvent.StreakUpdated -> {
                        val current = (_streakState.value as? Result.Success)?.data
                        val updated = current?.copy(currentStreak = event.streakDays)
                            ?: StreakDto(currentStreak = event.streakDays, longestStreak = event.streakDays, lastActiveDate = "Today", totalActiveDays = event.streakDays)
                        _streakState.value = Result.Success(updated)
                    }
                    is RealtimeEvent.AchievementEarned -> {
                        _badgeUnlockEvents.emit(event.achievementId)
                        fetchAchievementsInternal()
                    }
                    else -> {}
                }
            }
        }
    }
}
