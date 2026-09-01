package com.kintsugi.app.features.settings

import com.kintsugi.app.features.settings.data.SettingsApiService as DataSettingsApiService
import com.kintsugi.app.features.settings.data.SettingsRepository as DataSettingsRepository
import com.kintsugi.app.features.settings.ui.SettingsViewModel as UiSettingsViewModel
import com.kintsugi.app.features.settings.ui.SettingsFragment as UiSettingsFragment

/**
 * Typealiases providing backward compatibility for Settings feature classes.
 */
typealias SettingsApiService = DataSettingsApiService
typealias SettingsRepository = DataSettingsRepository
typealias SettingsViewModel = UiSettingsViewModel
typealias SettingsFragment = UiSettingsFragment
