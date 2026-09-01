package com.kintsugi.app.core.ui.widget

import androidx.annotation.DrawableRes
import androidx.annotation.IdRes

/**
 * Data representation of a handcrafted Kintsugi Bottom Navigation Item.
 */
data class NavigationItem(
    @IdRes val destinationId: Int,
    val title: String,
    @DrawableRes val outlineIconRes: Int,
    @DrawableRes val filledIconRes: Int,
    val badgeCount: Int = 0
)
