package com.kintsugi.app.features.dashboard.data

import androidx.annotation.ColorInt
import androidx.annotation.DrawableRes
import com.kintsugi.app.R
import com.kintsugi.app.core.navigation.Destinations

/**
 * Data model representing a customizable Quick Action card on the Dashboard.
 */
data class QuickActionModel(
    val id: String,
    val title: String,
    val subtitle: String,
    @DrawableRes val iconResId: Int,
    @ColorInt val tintColor: Int,
    val destinationId: Int,
    val isVisible: Boolean = true
)

object QuickActionRegistry {
    val ALL_ACTIONS = listOf(
        QuickActionModel("nav_mood", "Log Mood", "Track how you feel", R.drawable.ic_mood_filled, 0xFFA855F7.toInt(), Destinations.MoodTracker.DESTINATION_ID),
        QuickActionModel("nav_companion", "AI Companion", "Reflect with AI", R.drawable.ic_sparkles, 0xFF8B5CF6.toInt(), Destinations.AIChat.DESTINATION_ID),
        QuickActionModel("nav_journal", "Journal", "Private entries", R.drawable.ic_journal_filled, 0xFF818CF8.toInt(), Destinations.Journal.DESTINATION_ID),
        QuickActionModel("nav_minigame", "Mind Game", "Focus & memory", R.drawable.ic_game, 0xFFF59E0B.toInt(), Destinations.MindGame.DESTINATION_ID),
        QuickActionModel("nav_breathing", "Breathing", "Guided exercises", R.drawable.ic_breathing, 0xFF2DD4BF.toInt(), Destinations.Breathing.DESTINATION_ID),
        QuickActionModel("nav_motivation", "Motivation", "Quotes & tips", R.drawable.ic_leaf, 0xFF34D399.toInt(), Destinations.DailyMotivation.DESTINATION_ID),
        QuickActionModel("nav_emergency", "Emergency", "Immediate help", R.drawable.ic_phone_call, 0xFFF87171.toInt(), Destinations.EmergencyHelp.DESTINATION_ID),
        QuickActionModel("nav_profile", "Profile", "Wellness center", R.drawable.ic_user_profile, 0xFFC084FC.toInt(), Destinations.Profile.DESTINATION_ID),
        QuickActionModel("nav_settings", "Settings", "Preferences", R.drawable.ic_settings, 0xFFA855F7.toInt(), Destinations.Settings.DESTINATION_ID)
    )

    val DEFAULT_IDS = listOf(
        "nav_mood",
        "nav_companion",
        "nav_journal",
        "nav_minigame",
        "nav_breathing",
        "nav_motivation"
    )
}
