package com.kintsugi.app.features.motivation

import com.kintsugi.app.features.motivation.data.ContentApiService as DataContentApiService
import com.kintsugi.app.features.motivation.data.ContentRepository as DataContentRepository
import com.kintsugi.app.features.motivation.ui.DailyMotivationViewModel as UiDailyMotivationViewModel
import com.kintsugi.app.features.motivation.ui.DailyMotivationFragment as UiDailyMotivationFragment

/**
 * Typealiases providing backward compatibility for Daily Motivation feature classes.
 */
typealias ContentApiService = DataContentApiService
typealias ContentRepository = DataContentRepository
typealias DailyMotivationViewModel = UiDailyMotivationViewModel
typealias DailyMotivationFragment = UiDailyMotivationFragment
