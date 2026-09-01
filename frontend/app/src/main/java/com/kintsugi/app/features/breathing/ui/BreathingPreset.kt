package com.kintsugi.app.features.breathing.ui

/**
 * Breathing preset definition.
 *
 * @property id Unique identifier for the preset.
 * @property name Display name of the preset.
 * @property description Brief explanation of the preset effect.
 * @property inhaleSec Duration of inhale phase in seconds.
 * @property holdInSec Duration of hold after inhale in seconds.
 * @property exhaleSec Duration of exhale phase in seconds.
 * @property holdOutSec Duration of hold after exhale in seconds.
 */
data class BreathingPreset(
    val id: String,
    val name: String,
    val description: String,
    val inhaleSec: Int,
    val holdInSec: Int,
    val exhaleSec: Int,
    val holdOutSec: Int = 0
) {
    companion object {
        val BEGINNER = BreathingPreset(
            id = "beginner",
            name = "Beginner",
            description = "4 • 4 • 6 • Easy mindful rhythm",
            inhaleSec = 4,
            holdInSec = 4,
            exhaleSec = 6,
            holdOutSec = 0
        )

        val RELAX = BreathingPreset(
            id = "relax",
            name = "Relax",
            description = "4 • 7 • 8 • Deep nervous system calm",
            inhaleSec = 4,
            holdInSec = 7,
            exhaleSec = 8,
            holdOutSec = 0
        )

        val FOCUS = BreathingPreset(
            id = "focus",
            name = "Focus",
            description = "5 • 5 • 5 • 5 • Equal box breathing",
            inhaleSec = 5,
            holdInSec = 5,
            exhaleSec = 5,
            holdOutSec = 5
        )

        val SLEEP = BreathingPreset(
            id = "sleep",
            name = "Sleep",
            description = "6 • 2 • 8 • Slow evening wind-down",
            inhaleSec = 6,
            holdInSec = 2,
            exhaleSec = 8,
            holdOutSec = 0
        )

        val ALL_PRESETS = listOf(BEGINNER, RELAX, FOCUS, SLEEP)
    }
}

/**
 * Breathing state machine phase enumeration.
 */
enum class BreathingPhaseState(val displayName: String, val instruction: String) {
    IDLE("Ready", "Tap Start to Begin"),
    INHALE("Inhale", "Breath in slowly through your nose..."),
    HOLD_IN("Hold", "Hold your breath calmly..."),
    EXHALE("Exhale", "Release softly through your mouth..."),
    HOLD_OUT("Rest", "Pause and prepare..."),
    PAUSED("Paused", "Session paused"),
    COMPLETED("Completed", "Mindfulness session complete")
}
