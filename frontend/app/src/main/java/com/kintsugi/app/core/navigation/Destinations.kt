package com.kintsugi.app.core.navigation

import com.kintsugi.app.R

object Destinations {

    val ROOT_GRAPH = R.id.nav_graph

    object Splash {
        val DESTINATION_ID = R.id.nav_splash
    }

    object Auth {
        val DESTINATION_ID = R.id.nav_auth_pager
        val LOGIN_DESTINATION_ID = R.id.nav_auth_pager
    }

    object Home {
        val DESTINATION_ID = R.id.nav_dashboard
    }

    object MoodTracker {
        val DESTINATION_ID = R.id.nav_mood
    }

    object AICompanion {
        val DESTINATION_ID = R.id.nav_companion
    }

    val AIChat = AICompanion

    object Journal {
        val DESTINATION_ID = R.id.nav_journal
        val LIST_DESTINATION_ID = R.id.nav_journal
        val EDITOR_DESTINATION_ID = R.id.nav_journal_editor
    }

    object Breathing {
        val DESTINATION_ID = R.id.nav_breathing
    }

    object DailyMotivation {
        val DESTINATION_ID = R.id.nav_motivation
    }

    object Emergency {
        val DESTINATION_ID = R.id.nav_emergency
    }

    val EmergencyHelp = Emergency

    object MindGame {
        val DESTINATION_ID = R.id.nav_minigame
    }

    val Minigame = MindGame

    object Profile {
        val DESTINATION_ID = R.id.nav_profile
    }

    object Settings {
        val DESTINATION_ID = R.id.nav_settings
    }

    object Notification {
        val DESTINATION_ID = R.id.nav_notification
    }
}
