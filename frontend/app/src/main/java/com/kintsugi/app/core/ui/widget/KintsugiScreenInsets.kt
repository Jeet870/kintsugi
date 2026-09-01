package com.kintsugi.app.core.ui.widget

import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

/**
 * Global Safe Area & Layout Alignment Utility for the Kintsugi Design System.
 * Ensures consistent top status bar insets and bottom navigation bar insets across all screens.
 */
object KintsugiScreenInsets {

    /**
     * Dynamically applies safe-area padding to scrollable content or views, preventing
     * overlapping with BottomNavigation and System Navigation Bars.
     */
    fun applyBottomNavigationPadding(targetView: View, extraBottomPaddingDp: Int = 100) {
        ViewCompat.setOnApplyWindowInsetsListener(targetView) { v, insets ->
            val navBars = insets.getInsets(
                WindowInsetsCompat.Type.navigationBars() or WindowInsetsCompat.Type.displayCutout()
            )
            val density = v.resources.displayMetrics.density
            val extraBottomPx = (extraBottomPaddingDp * density).toInt()
            
            v.setPadding(
                v.paddingLeft,
                v.paddingTop,
                v.paddingRight,
                navBars.bottom + extraBottomPx
            )
            insets
        }
    }
}
