package com.kintsugi.app.features.profile

import com.kintsugi.app.features.profile.data.ProfileApiService as DataProfileApiService
import com.kintsugi.app.features.profile.data.ProfileRepository as DataProfileRepository
import com.kintsugi.app.features.profile.ui.ProfileViewModel as UiProfileViewModel
import com.kintsugi.app.features.profile.ui.ProfileFragment as UiProfileFragment

/**
 * Typealiases providing backward compatibility for Profile feature classes.
 */
typealias ProfileApiService = DataProfileApiService
typealias ProfileRepository = DataProfileRepository
typealias ProfileViewModel = UiProfileViewModel
typealias ProfileFragment = UiProfileFragment
