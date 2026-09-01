package com.kintsugi.app.core.ui

import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.Window
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Central system bar controller enabling Material 3 Android Edge-to-Edge layouts,
 * transparent status and navigation bars, display cutout insets, and dynamic luminance-aware icon contrast.
 */
object SystemBarController {

    fun setupEdgeToEdge(window: Window, isLightIcons: Boolean = true) {
        WindowCompat.setDecorFitsSystemWindows(window, false)

        @Suppress("DEPRECATION")
        window.statusBarColor = Color.TRANSPARENT
        @Suppress("DEPRECATION")
        window.navigationBarColor = Color.TRANSPARENT

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isStatusBarContrastEnforced = false
            window.isNavigationBarContrastEnforced = false
        }

        applySystemBarIconLightness(window, isLightIcons)
    }

    fun applySystemBarIconLightness(window: Window, isLightIcons: Boolean) {
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        // isAppearanceLightStatusBars = true means dark icons (for light backgrounds).
        // isAppearanceLightStatusBars = false means light icons (for dark #0F1018 background).
        controller.isAppearanceLightStatusBars = !isLightIcons
        controller.isAppearanceLightNavigationBars = !isLightIcons
    }
}

/**
 * Reusable View extension for consuming System Bars, Display Cutout, and Gesture Navigation insets.
 */
fun View.applyEdgeToEdgeInsets(
    applyTop: Boolean = true,
    applyBottom: Boolean = true,
    additionalTopPx: Int = 0,
    additionalBottomPx: Int = 0
) {
    ViewCompat.setOnApplyWindowInsetsListener(this) { view, insets ->
        val systemBars = insets.getInsets(
            WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
        )
        val targetTop = if (applyTop) systemBars.top + additionalTopPx else view.paddingTop
        val targetBottom = if (applyBottom) systemBars.bottom + additionalBottomPx else view.paddingBottom
        view.setPadding(view.paddingLeft, targetTop, view.paddingRight, targetBottom)
        insets
    }
}
