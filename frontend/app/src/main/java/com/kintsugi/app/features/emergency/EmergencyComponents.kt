package com.kintsugi.app.features.emergency

import com.kintsugi.app.features.emergency.data.EmergencyApiService as DataEmergencyApiService
import com.kintsugi.app.features.emergency.data.EmergencyRepository as DataEmergencyRepository
import com.kintsugi.app.features.emergency.ui.EmergencyHelpViewModel as UiEmergencyHelpViewModel
import com.kintsugi.app.features.emergency.ui.EmergencyHelpFragment as UiEmergencyHelpFragment

/**
 * Typealiases providing backward compatibility for Emergency Help feature classes.
 */
typealias EmergencyApiService = DataEmergencyApiService
typealias EmergencyRepository = DataEmergencyRepository
typealias EmergencyHelpViewModel = UiEmergencyHelpViewModel
typealias EmergencyHelpFragment = UiEmergencyHelpFragment
