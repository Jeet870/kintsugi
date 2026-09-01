package com.kintsugi.app.features.moodtracker.ui

import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.ui.base.BaseViewModel
import com.kintsugi.app.features.moodtracker.MoodRepository
import com.kintsugi.app.features.moodtracker.ui.model.AnalyticsPeriod
import com.kintsugi.app.features.moodtracker.ui.model.MoodStatisticsData
import com.kintsugi.app.features.moodtracker.ui.model.MoodTrendPoint
import com.kintsugi.app.features.moodtracker.ui.util.MoodAnalyticsAggregator
import com.kintsugi.app.features.moodtracker.ui.util.MoodAnalyticsInsightEngine
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalTime
import javax.inject.Inject

sealed interface MoodTrackerUiState {
    data object Idle : MoodTrackerUiState
    data object Loading : MoodTrackerUiState
    data class Success(val message: String) : MoodTrackerUiState
    data class Error(val errorMessage: String) : MoodTrackerUiState
}

sealed interface MoodTrackerUiEvent {
    data class ShowSnackbar(val message: String) : MoodTrackerUiEvent
    data object ScrollToTop : MoodTrackerUiEvent
}

@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class MoodTrackerViewModel @Inject constructor(
    private val moodRepository: MoodRepository
) : BaseViewModel() {

    private val _selectedMood = MutableStateFlow<MoodOptions?>(MoodOptions.CALM)
    val selectedMood: StateFlow<MoodOptions?> = _selectedMood.asStateFlow()

    private val _noteText = MutableStateFlow("")
    val noteText: StateFlow<String> = _noteText.asStateFlow()

    private val _selectedPeriod = MutableStateFlow(AnalyticsPeriod.SEVEN_DAYS)
    val selectedPeriod: StateFlow<AnalyticsPeriod> = _selectedPeriod.asStateFlow()

    private val _loggingState = MutableStateFlow<MoodTrackerUiState>(MoodTrackerUiState.Idle)
    val loggingState: StateFlow<MoodTrackerUiState> = _loggingState.asStateFlow()

    private val _uiEvents = MutableSharedFlow<MoodTrackerUiEvent>()
    val uiEvents: SharedFlow<MoodTrackerUiEvent> = _uiEvents.asSharedFlow()

    // 1. Timeline Entries Flow
    val timelineState: StateFlow<Result<List<MoodEntryEntity>>> = _selectedPeriod
        .flatMapLatest { period -> moodRepository.observeMoodHistory(period) }
        .map { entries -> Result.Success(entries) as Result<List<MoodEntryEntity>> }
        .catch { emit(Result.Error(it)) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = Result.Loading
        )

    // 2. Trend Chart Points Flow (Grouped by period)
    val trendChartState: StateFlow<List<MoodTrendPoint>> = _selectedPeriod
        .flatMapLatest { period ->
            moodRepository.observeMoodHistory(period).map { entries ->
                MoodAnalyticsAggregator.computeTrendPoints(entries, period)
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // 3. Statistics Data Flow
    val statisticsState: StateFlow<MoodStatisticsData> = _selectedPeriod
        .flatMapLatest { period ->
            moodRepository.observeMoodHistory(period).map { entries ->
                MoodAnalyticsAggregator.computeStatistics(entries, period)
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = MoodAnalyticsAggregator.computeStatistics(emptyList(), AnalyticsPeriod.SEVEN_DAYS)
        )

    // 4. Automated Insights Flow
    val insightsState: StateFlow<String> = _selectedPeriod
        .flatMapLatest { period ->
            moodRepository.observeMoodHistory(period).map { entries ->
                MoodAnalyticsInsightEngine.generateInsight(entries)
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = "Start logging your daily moods to unlock personalized insights."
        )

    val latestMood: StateFlow<MoodEntryEntity?> = moodRepository.observeMoodHistory(AnalyticsPeriod.ALL)
        .map { history -> history.firstOrNull() }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    val submitEnabled: StateFlow<Boolean> = combine(_selectedMood, _loggingState) { mood, state ->
        mood != null && state !is MoodTrackerUiState.Loading
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = true
    )

    fun selectPeriod(period: AnalyticsPeriod) {
        _selectedPeriod.value = period
    }

    fun getTimeBasedGreeting(): String {
        val hour = LocalTime.now().hour
        return when (hour) {
            in 5..11 -> "Good Morning 👋"
            in 12..16 -> "Good Afternoon 🌤️"
            in 17..21 -> "Good Evening 🌙"
            else -> "Peaceful Night ✦"
        }
    }

    fun selectMood(mood: MoodOptions) {
        _selectedMood.value = mood
    }

    fun updateNoteText(input: String) {
        _noteText.value = input
    }

    fun deleteMoodEntry(id: String) {
        viewModelScope.launch {
            moodRepository.deleteMoodEntry(id)
            _uiEvents.emit(MoodTrackerUiEvent.ShowSnackbar("Mood entry deleted"))
        }
    }

    fun logMood() {
        val mood = _selectedMood.value ?: return
        if (_loggingState.value is MoodTrackerUiState.Loading) return

        viewModelScope.launch {
            _loggingState.value = MoodTrackerUiState.Loading

            val currentNote = _noteText.value
            when (val result = moodRepository.logMood(mood, currentNote)) {
                is Result.Success -> {
                    _noteText.value = ""
                    _loggingState.value = MoodTrackerUiState.Success("Mood logged successfully")
                    _uiEvents.emit(MoodTrackerUiEvent.ShowSnackbar("Mood recorded! Companion reflection updating..."))
                    _uiEvents.emit(MoodTrackerUiEvent.ScrollToTop)
                }
                is Result.Error -> {
                    _loggingState.value = MoodTrackerUiState.Error(result.exception.localizedMessage ?: "Logging failed")
                    _uiEvents.emit(MoodTrackerUiEvent.ShowSnackbar("Saved locally offline."))
                }
                else -> {
                    _loggingState.value = MoodTrackerUiState.Idle
                }
            }

            _loggingState.value = MoodTrackerUiState.Idle
        }
    }

    fun retryPending() {
        viewModelScope.launch {
            moodRepository.fetchLatestHistoryFromRemote()
        }
    }
}
