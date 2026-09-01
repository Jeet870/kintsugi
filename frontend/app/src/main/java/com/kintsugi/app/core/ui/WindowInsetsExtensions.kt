package com.kintsugi.app.core.ui

import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

/**
 * Reusable WindowInsets extension functions for seamless gesture navigation padding.
 */
fun View.safePaddingTop() {
    ViewCompat.setOnApplyWindowInsetsListener(this) { v, insets ->
        val statusBarHeight = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
        v.setPadding(v.paddingLeft, statusBarHeight, v.paddingRight, v.paddingBottom)
        insets
    }
}

fun View.safePaddingBottom() {
    ViewCompat.setOnApplyWindowInsetsListener(this) { v, insets ->
        val navBarHeight = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
        v.setPadding(v.paddingLeft, v.paddingTop, v.paddingRight, navBarHeight)
        insets
    }
}

fun View.applyStatusInsets() {
    ViewCompat.setOnApplyWindowInsetsListener(this) { v, insets ->
        val statusBarHeight = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
        val lp = v.layoutParams
        if (lp != null && lp.height != statusBarHeight) {
            lp.height = statusBarHeight
            v.layoutParams = lp
        }
        insets
    }
}

fun View.applyNavigationInsets() {
    ViewCompat.setOnApplyWindowInsetsListener(this) { v, insets ->
        val navBarHeight = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
        v.setPadding(v.paddingLeft, v.paddingTop, v.paddingRight, navBarHeight)
        insets
    }
}
