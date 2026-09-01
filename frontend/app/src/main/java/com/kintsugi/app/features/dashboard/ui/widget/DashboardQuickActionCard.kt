package com.kintsugi.app.features.dashboard.ui.widget

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.view.Gravity
import android.view.MotionEvent
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.ColorInt
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import com.kintsugi.app.R

/**
 * Compact Material 3 Dashboard Quick Action Card (18dp corner radius):
 * Circular tinted icon container, 15sp title, 11sp subtitle, 1dp #3B2A5E border, and soft lift animation.
 */
class DashboardQuickActionCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : MaterialCardView(context, attrs, defStyleAttr) {

    private val ivIcon = ImageView(context).apply {
        val size = (22 * resources.displayMetrics.density).toInt()
        layoutParams = FrameLayout.LayoutParams(size, size, Gravity.CENTER)
    }

    private val iconCircleContainer = FrameLayout(context).apply {
        val size = (42 * resources.displayMetrics.density).toInt()
        layoutParams = LinearLayout.LayoutParams(size, size)
        background = ContextCompat.getDrawable(context, R.drawable.bottom_navigation_background)
        addView(ivIcon)
    }

    private val tvTitle = TextView(context).apply {
        textSize = 15f
        setTextColor(ContextCompat.getColor(context, R.color.text_primary))
        typeface = android.graphics.Typeface.DEFAULT_BOLD
        setSingleLine(true)
        ellipsize = android.text.TextUtils.TruncateAt.END
    }

    private val tvSubtitle = TextView(context).apply {
        textSize = 11f
        setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
        setSingleLine(true)
        ellipsize = android.text.TextUtils.TruncateAt.END
    }

    init {
        setCardBackgroundColor(ContextCompat.getColor(context, R.color.card_surface))
        radius = 18f * resources.displayMetrics.density
        cardElevation = 2f * resources.displayMetrics.density
        strokeColor = ContextCompat.getColor(context, R.color.glass_card_border)
        strokeWidth = (1f * resources.displayMetrics.density).toInt()
        isClickable = true
        isFocusable = true

        val contentLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            val padH = (12 * resources.displayMetrics.density).toInt()
            val padV = (14 * resources.displayMetrics.density).toInt()
            setPadding(padH, padV, padH, padV)

            addView(iconCircleContainer)

            val lpTitle = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = (10 * resources.displayMetrics.density).toInt()
            }
            addView(tvTitle, lpTitle)

            val lpSub = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = (2 * resources.displayMetrics.density).toInt()
            }
            addView(tvSubtitle, lpSub)
        }

        addView(contentLayout)

        attrs?.let {
            val typedArray = context.obtainStyledAttributes(it, R.styleable.DashboardQuickActionCard)
            val titleStr = typedArray.getString(R.styleable.DashboardQuickActionCard_cardTitle)
            val subStr = typedArray.getString(R.styleable.DashboardQuickActionCard_cardSubtitle)
            val iconResId = typedArray.getResourceId(R.styleable.DashboardQuickActionCard_cardIcon, 0)
            typedArray.recycle()

            if (!titleStr.isNullOrEmpty()) tvTitle.text = titleStr
            if (!subStr.isNullOrEmpty()) tvSubtitle.text = subStr
            if (iconResId != 0) setIcon(iconResId)
        }
    }

    fun setCardData(@DrawableRes iconRes: Int, title: String, subtitle: String, @ColorInt tintColor: Int? = null) {
        setIcon(iconRes, tintColor)
        tvTitle.text = title
        tvSubtitle.text = subtitle
    }

    fun setIcon(@DrawableRes iconRes: Int, @ColorInt tintColor: Int? = null) {
        ivIcon.setImageResource(iconRes)
        val tint = tintColor ?: ContextCompat.getColor(context, R.color.royal_purple)
        ivIcon.setColorFilter(tint)
    }

    fun setSubtitle(subtitle: String) {
        tvSubtitle.text = subtitle
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> animateLift(true)
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> animateLift(false)
        }
        return super.onTouchEvent(event)
    }

    private fun animateLift(pressed: Boolean) {
        val targetScale = if (pressed) 0.96f else 1.0f
        val scaleXAnim = ObjectAnimator.ofFloat(this, "scaleX", targetScale)
        val scaleYAnim = ObjectAnimator.ofFloat(this, "scaleY", targetScale)
        AnimatorSet().apply {
            duration = 120
            interpolator = DecelerateInterpolator()
            playTogether(scaleXAnim, scaleYAnim)
            start()
        }
    }
}
