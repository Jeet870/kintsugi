package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.view.Gravity
import android.view.View
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

/**
 * Custom gold notification badge view.
 * Supports count formatting ("1", "9", "99+") with scale/pulse animations.
 */
class NavigationBadgeView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : TextView(context, attrs, defStyleAttr) {

    init {
        background = ContextCompat.getDrawable(context, R.drawable.bottom_navigation_badge)
        setTextColor(ContextCompat.getColor(context, R.color.background_warm))
        textSize = 10f
        typeface = android.graphics.Typeface.DEFAULT_BOLD
        gravity = Gravity.CENTER
        visibility = View.GONE

        val padH = (6 * resources.displayMetrics.density).toInt()
        val padV = (2 * resources.displayMetrics.density).toInt()
        setPadding(padH, padV, padH, padV)
    }

    fun setBadgeCount(count: Int) {
        if (count <= 0) {
            visibility = View.GONE
            return
        }

        text = if (count > 99) "99+" else count.toString()
        visibility = View.VISIBLE

        scaleX = 0.5f
        scaleY = 0.5f
        animate()
            .scaleX(1.15f)
            .scaleY(1.15f)
            .setDuration(180)
            .withEndAction {
                animate().scaleX(1.0f).scaleY(1.0f).setDuration(120).start()
            }
            .start()
    }
}
