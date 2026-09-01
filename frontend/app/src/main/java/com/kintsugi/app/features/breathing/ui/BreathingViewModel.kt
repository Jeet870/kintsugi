package com.kintsugi.app.features.breathing.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * Pure client-side breathing engine managing the mindfulness state machine.
 *
 * Runs a 60fps ticker coroutine to smoothly update breathing circle expansion,
 * circular progress sweep, session timer Countdown, and phase state transitions.
 */
@HiltViewModel
class BreathingViewModel @Inject constructor() : ViewModel() {

    private val quotes = listOf(
        "Every breath is a fresh beginning.",
        "Slow breathing calms the mind.",
        "Your mind deserves kindness.",
        "Be present in this moment.",
        "You are here. Everything is okay.",
        "One breath at a time."
    )

    private val _selectedPreset = MutableStateFlow(BreathingPreset.BEGINNER)
    val selectedPreset: StateFlow<BreathingPreset> = _selectedPreset.asStateFlow()

    private val _phaseState = MutableStateFlow(BreathingPhaseState.IDLE)
    val phaseState: StateFlow<BreathingPhaseState> = _phaseState.asStateFlow()

    private val _progress = MutableStateFlow(0f)
    val progress: StateFlow<Float> = _progress.asStateFlow()

    private val _currentCycle = MutableStateFlow(1)
    val currentCycle: StateFlow<Int> = _currentCycle.asStateFlow()

    private val _totalSessionTimeMs = MutableStateFlow(5 * 60 * 1000L) // Default 5 minutes
    val totalSessionTimeMs: StateFlow<Long> = _totalSessionTimeMs.asStateFlow()

    private val _remainingTimeMs = MutableStateFlow(5 * 60 * 1000L)
    val remainingTimeMs: StateFlow<Long> = _remainingTimeMs.asStateFlow()

    private val _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning.asStateFlow()

    private val _motivationalQuote = MutableStateFlow(quotes.first())
    val motivationalQuote: StateFlow<String> = _motivationalQuote.asStateFlow()

    private var timerJob: Job? = null

    /**
     * Selects a new breathing preset and resets active progress.
     */
    fun selectPreset(preset: BreathingPreset) {
        if (_isRunning.value) {
            reset()
        }
        _selectedPreset.value = preset
        Timber.d("Selected breathing preset: ${preset.name}")
    }

    /**
     * Updates target session duration in minutes (e.g., 3, 5, 10).
     */
    fun setSessionDurationMinutes(minutes: Int) {
        val ms = minutes * 60 * 1000L
        _totalSessionTimeMs.value = ms
        if (!_isRunning.value) {
            _remainingTimeMs.value = ms
        }
    }

    /**
     * Starts or resumes the mindfulness breathing session.
     */
    fun start() {
        if (_isRunning.value) return

        _isRunning.value = true
        if (_phaseState.value == BreathingPhaseState.IDLE || _phaseState.value == BreathingPhaseState.COMPLETED) {
            _currentCycle.value = 1
            _phaseState.value = BreathingPhaseState.INHALE
            _progress.value = 0f
        } else if (_phaseState.value == BreathingPhaseState.PAUSED) {
            _phaseState.value = BreathingPhaseState.INHALE
        }

        launchTickerEngine()
    }

    /**
     * Pauses the active session.
     */
    fun pause() {
        if (!_isRunning.value) return

        _isRunning.value = false
        timerJob?.cancel()
        _phaseState.value = BreathingPhaseState.PAUSED
    }

    /**
     * Resets the session back to IDLE state.
     */
    fun reset() {
        _isRunning.value = false
        timerJob?.cancel()
        _phaseState.value = BreathingPhaseState.IDLE
        _progress.value = 0f
        _currentCycle.value = 1
        _remainingTimeMs.value = _totalSessionTimeMs.value
        _motivationalQuote.value = quotes.first()
    }

    /**
     * Core 60fps coroutine ticker loop driving smooth animations and state transitions.
     */
    private fun launchTickerEngine() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            val updateIntervalMs = 16L // ~60fps
            var currentPhaseElapsedMs = 0L

            while (_isRunning.value && _remainingTimeMs.value > 0) {
                delay(updateIntervalMs)
                currentPhaseElapsedMs += updateIntervalMs
                _remainingTimeMs.value = (_remainingTimeMs.value - updateIntervalMs).coerceAtLeast(0)

                val preset = _selectedPreset.value
                val phaseDurationMs = getPhaseDurationMs(_phaseState.value, preset)

                if (phaseDurationMs > 0) {
                    _progress.value = (currentPhaseElapsedMs.toFloat() / phaseDurationMs).coerceIn(0f, 1f)

                    if (currentPhaseElapsedMs >= phaseDurationMs) {
                        currentPhaseElapsedMs = 0L
                        _progress.value = 0f
                        advanceToNextPhase(preset)
                    }
                }

                if (_remainingTimeMs.value <= 0) {
                    completeSession()
                    break
                }
            }
        }
    }

    private fun getPhaseDurationMs(phase: BreathingPhaseState, preset: BreathingPreset): Long {
        return when (phase) {
            BreathingPhaseState.INHALE -> preset.inhaleSec * 1000L
            BreathingPhaseState.HOLD_IN -> preset.holdInSec * 1000L
            BreathingPhaseState.EXHALE -> preset.exhaleSec * 1000L
            BreathingPhaseState.HOLD_OUT -> preset.holdOutSec * 1000L
            else -> 0L
        }
    }

    private fun advanceToNextPhase(preset: BreathingPreset) {
        val nextPhase = when (_phaseState.value) {
            BreathingPhaseState.INHALE -> {
                if (preset.holdInSec > 0) BreathingPhaseState.HOLD_IN else BreathingPhaseState.EXHALE
            }
            BreathingPhaseState.HOLD_IN -> BreathingPhaseState.EXHALE
            BreathingPhaseState.EXHALE -> {
                if (preset.holdOutSec > 0) BreathingPhaseState.HOLD_OUT else BreathingPhaseState.INHALE
            }
            BreathingPhaseState.HOLD_OUT -> BreathingPhaseState.INHALE
            else -> BreathingPhaseState.INHALE
        }

        _phaseState.value = nextPhase

        // Completed one full loop (Inhale -> Hold -> Exhale -> Rest -> Inhale)
        if (nextPhase == BreathingPhaseState.INHALE) {
            _currentCycle.value += 1
            _motivationalQuote.value = quotes[(_currentCycle.value - 1) % quotes.size]
        }
    }

    private fun completeSession() {
        _isRunning.value = false
        _phaseState.value = BreathingPhaseState.COMPLETED
        _progress.value = 1f
        Timber.d("Mindfulness session completed!")
    }

    override fun onCleared() {
        super.onCleared()
        timerJob?.cancel()
    }
}
