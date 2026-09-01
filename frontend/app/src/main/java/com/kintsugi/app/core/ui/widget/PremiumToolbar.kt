package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.util.AttributeSet
import android.view.View

/**
 * Convenience subclass alias of [KintsugiToolbar] ensuring backward compatibility
 * while guaranteeing 100% visual parity across all screens.
 */
class PremiumToolbar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : KintsugiToolbar(context, attrs, defStyleAttr)
