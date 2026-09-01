package com.kintsugi.app.core.common

import androidx.annotation.ColorRes
import com.kintsugi.app.R

enum class MoodOptions(
    val emoji: String,
    val label: String,
    val apiValue: String,
    val chartValue: Int,
    @ColorRes val colorRes: Int,
    val contentDescription: String
) {
    HAPPY("😊", "Happy", "happy", 6, R.color.royal_purple, "Feeling Happy"),
    CALM("😌", "Calm", "calm", 5, R.color.emerald_green, "Feeling Calm"),
    TIRED("🥱", "Tired", "tired", 4, R.color.soft_lavender, "Feeling Tired"),
    SAD("😔", "Sad", "sad", 3, R.color.royal_purple_light, "Feeling Sad"),
    ANXIOUS("😰", "Anxious", "anxious", 2, R.color.royal_purple, "Feeling Anxious"),
    ANGRY("😤", "Angry", "angry", 1, R.color.warm_red, "Feeling Angry");

    companion object {
        fun fromApiValue(apiValue: String): MoodOptions {
            return entries.find { it.apiValue.equals(apiValue, ignoreCase = true) } ?: CALM
        }

        fun fromChartValue(chartValue: Int): MoodOptions {
            return entries.find { it.chartValue == chartValue } ?: CALM
        }

        fun valuesSorted(): List<MoodOptions> = entries.sortedByDescending { it.chartValue }

        fun positiveMoods(): List<MoodOptions> = listOf(HAPPY, CALM)

        fun negativeMoods(): List<MoodOptions> = listOf(SAD, ANGRY, ANXIOUS)
    }
}

/**
 * Typealias mapping Mood to MoodOptions.
 */
typealias Mood = MoodOptions
