package com.kintsugi.app.core.datastore

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Extensible Theme Architecture.
 * Kintsugi uses a single, carefully crafted Dark Theme experience to maintain visual calm.
 * Future themes can extend ThemeMode without rewriting UI consumers.
 */
sealed class ThemeMode(val code: String, val displayName: String) {
    object KintsugiDark : ThemeMode("kintsugi_dark", "Kintsugi Dark")
}

private val Context.dataStore by preferencesDataStore(name = "kintsugi_theme_settings")

@Singleton
class ThemePreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val keyDarkMode = booleanPreferencesKey("dark_mode_enabled")
    private val keyThemeMode = stringPreferencesKey("theme_mode")

    val isDarkMode: Flow<Boolean> = context.dataStore.data.map { true }

    val themeFlow: Flow<ThemeMode> = context.dataStore.data.map {
        ThemeMode.KintsugiDark
    }

    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[keyDarkMode] = true
            prefs[keyThemeMode] = ThemeMode.KintsugiDark.code
        }
    }

    suspend fun setTheme(mode: ThemeMode) {
        context.dataStore.edit { prefs ->
            prefs[keyThemeMode] = mode.code
            prefs[keyDarkMode] = true
        }
    }
}
