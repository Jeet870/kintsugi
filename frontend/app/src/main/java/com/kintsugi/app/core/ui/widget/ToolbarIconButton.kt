package com.kintsugi.app.core.ui.widget

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Context
import android.util.AttributeSet
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import com.kintsugi.app.R

/**
 * Standardized 44dp x 44dp Toolbar Icon Button component:
 * 22dp corner radius, soft glass card background (#1A1232), 1dp purple outline (#2E224D),
 * centered 24dp vector icon, press scale animation, haptic feedback, and optional unread badge indicator.
 */
class ToolbarIconButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : MaterialCardView(context, attrs, defStyleAttr) {

    private val ivIcon = ImageView(context).apply {
        val size = (24 * resources.displayMetrics.density).toInt()
        layoutParams = FrameLayout.LayoutParams(size, size, Gravity.CENTER)
    }

    private val tvBadge = TextView(context).apply {
        val px8 = (8 * resources.displayMetrics.density).toInt()
        val px18 = (18 * resources.displayMetrics.density).toInt()
        layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            px18,
            Gravity.TOP or Gravity.END
        ).apply {
            setMargins(0, (2 * resources.displayMetrics.density).toInt(), (2 * resources.displayMetrics.density).toInt(), 0)
        }
        setPadding(px8 / 2, 0, px8 / 2, 0)
        minWidth = px18
        textSize = 10f
        setTextColor(ContextCompat.getColor(context, android.R.color.white))
        typeface = android.graphics.Typeface.DEFAULT_BOLD
        gravity = Gravity.CENTER
        background = ContextCompat.getDrawable(context, R.drawable.bg_gold_glow_circle)
        backgroundTintList = android.content.res.ColorStateList.valueOf(ContextCompat.getColor(context, R.color.royal_purple))
        visibility = GONE
    }

    init {
        val size44 = (44 * resources.displayMetrics.density).toInt()
        layoutParams = FrameLayout.LayoutParams(size44, size44)

        setCardBackgroundColor(ContextCompat.getColor(context, R.color.card_surface))
        radius = 22f * resources.displayMetrics.density
        cardElevation = 2f * resources.displayMetrics.density
        strokeColor = ContextCompat.getColor(context, R.color.glass_card_border)
        strokeWidth = (1f * resources.displayMetrics.density).toInt()
        isClickable = true
        isFocusable = true

        addView(ivIcon)
        addView(tvBadge)
    }

    fun setIcon(@DrawableRes iconRes: Int) {
        ivIcon.setImageResource(iconRes)
        ivIcon.setColorFilter(ContextCompat.getColor(context, R.color.royal_purple))
    }

    fun setBadgeCount(count: Int) {
        if (count > 0) {
            tvBadge.text = if (count > 9) "9+" else count.toString()
            tvBadge.visibility = VISIBLE
        } else {
            tvBadge.visibility = GONE
        }
    }

    fun setBadgeDot(show: Boolean) {
        if (show) {
            tvBadge.text = "●"
            tvBadge.textSize = 8f
            tvBadge.visibility = VISIBLE
        } else {
            tvBadge.visibility = GONE
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                animateScale(0.92f)
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> animateScale(1.0f)
        }
        return super.onTouchEvent(event)
    }

    private fun animateScale(targetScale: Float) {
        val scaleXAnim = ObjectAnimator.ofFloat(this, "scaleX", targetScale)
        val scaleYAnim = ObjectAnimator.ofFloat(this, "scaleY", targetScale)
        AnimatorSet().apply {
            duration = 180
            interpolator = DecelerateInterpolator()
            playTogether(scaleXAnim, scaleYAnim)
            start()
        }
    }
}
