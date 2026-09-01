package com.kintsugi.app.features.about.ui

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

/**
 * ViewModel for the About Kintsugi storytelling screen.
 */
@HiltViewModel
class AboutViewModel @Inject constructor() : ViewModel() {
    val appVersion: String = "v1.0.0 (Build 100)"
}
