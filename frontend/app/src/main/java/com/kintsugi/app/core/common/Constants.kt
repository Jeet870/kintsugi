package com.kintsugi.app.core.common

object Constants {
    // Local Backend Server Connection (ADB Reverse port forwarding: 127.0.0.1:8000)
    const val BASE_URL = "http://192.168.31.44:8000/api/v1/"
    const val WEBSOCKET_URL = "ws://192.168.31.44:8000/api/v1/ws/companion"
    const val PREFS_NAME = "kintsugi_secure_preferences"
    const val DATABASE_NAME = "kintsugi_app_db"

    object Pagination {
        const val MOOD_HISTORY_PAGE_SIZE = 20
        const val JOURNAL_PAGE_SIZE = 15
    }

    object Network {
        const val API_TIMEOUT_MS = 30000L
        const val CACHE_SIZE_MB = 50L
    }

    object WebSocket {
        const val MIN_BACKOFF_MS = 1000L
        const val MAX_BACKOFF_MS = 30000L
        const val PING_INTERVAL_MS = 15000L
        const val CONNECTION_TIMEOUT_MS = 20000L
    }

    object Animation {
        const val DURATION_FAST = 200L
        const val DURATION_NORMAL = 400L
        const val DURATION_SLOW = 800L
        const val BREATHING_DURATION = 4000L
        const val SPRING_DURATION = 350L
    }

    object UI {
        const val BOTTOM_BAR_ANIMATION_MS = 250L
        const val SNACKBAR_DURATION_MS = 3500L
        const val MAX_JOURNAL_TITLE_LENGTH = 100
    }
}
