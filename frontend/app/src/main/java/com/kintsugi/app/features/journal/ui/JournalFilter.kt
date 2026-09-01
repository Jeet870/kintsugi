package com.kintsugi.app.features.journal.ui

/**
 * Filter contract options for Journal Sanctuary entries list.
 */
enum class JournalFilter(val label: String) {
    ALL("All Entries"),
    TODAY("Today"),
    YESTERDAY("Yesterday"),
    THIS_WEEK("This Week"),
    LAST_7_DAYS("Last 7 Days"),
    THIS_MONTH("This Month"),
    LAST_30_DAYS("Last 30 Days"),
    LAST_90_DAYS("Last 90 Days"),
    FAVORITES("Favorites"),
    PINNED("Pinned"),
    AI_GENERATED("AI Generated"),
    MOOD_HAPPY("Mood: Happy"),
    MOOD_CALM("Mood: Calm"),
    MOOD_SAD("Mood: Sad"),
    MOOD_ANXIOUS("Mood: Anxious"),
    MOOD_ANGRY("Mood: Angry"),
    MOOD_TIRED("Mood: Tired");

    companion object {
        fun fromLabel(label: String): JournalFilter {
            return entries.firstOrNull { it.label.equals(label, ignoreCase = true) } ?: ALL
        }
    }
}
