package com.kintsugi.app.features.moodtracker.ui.components

import android.animation.ValueAnimator
import android.content.Context
import android.util.AttributeSet
import android.view.Gravity
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.kintsugi.app.R
import com.kintsugi.app.core.ui.widget.GlassCardView
import com.kintsugi.app.core.ui.widget.LoadingShimmerView

class AISupportMessageCardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val glassCard = GlassCardView(context)

    private val headerLayout = LinearLayout(context).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
    }

    private val iconSparkle = ImageView(context).apply {
        setImageResource(R.drawable.ic_home) // default icon fallback
        setColorFilter(ContextCompat.getColor(context, R.color.royal_purple))
    }

    private val headerTitle = TextView(context).apply {
        text = "COMPANION REFLECTION ✦"
        textSize = 11f
        setTextColor(ContextCompat.getColor(context, R.color.royal_purple))
        typeface = android.graphics.Typeface.DEFAULT_BOLD
        letterSpacing = 0.08f
        setPadding((8 * resources.displayMetrics.density).toInt(), 0, 0, 0)
    }

    private val messageTv = TextView(context).apply {
        textSize = 14f
        setTextColor(ContextCompat.getColor(context, R.color.text_primary))
        setLineSpacing(4f * resources.displayMetrics.density, 1.0f)
        setPadding(0, (8 * resources.displayMetrics.density).toInt(), 0, 0)
    }

    private val shimmerView = LoadingShimmerView(context).apply {
        visibility = View.GONE
    }

    private val reflectingStatusTv = TextView(context).apply {
        text = "Your companion is reflecting..."
        textSize = 13f
        setTextColor(ContextCompat.getColor(context, R.color.soft_lavender))
        typeface = android.graphics.Typeface.defaultFromStyle(android.graphics.Typeface.ITALIC)
        setPadding(0, (6 * resources.displayMetrics.density).toInt(), 0, 0)
        visibility = View.GONE
    }

    private var pulseAnimator: ValueAnimator? = null

    init {
        val contentContainer = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            headerLayout.addView(iconSparkle, LinearLayout.LayoutParams((18 * resources.displayMetrics.density).toInt(), (18 * resources.displayMetrics.density).toInt()))
            headerLayout.addView(headerTitle)
            addView(headerLayout)
            addView(reflectingStatusTv)
            addView(shimmerView, LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, (12 * resources.displayMetrics.density).toInt()).apply {
                topMargin = (8 * resources.displayMetrics.density).toInt()
            })
            addView(messageTv)
        }

        glassCard.addView(contentContainer)
        addView(glassCard, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
    }

    fun bindAiMessage(message: String?) {
        if (message.isNullOrBlank()) {
            // Pending reflection state
            messageTv.visibility = View.GONE
            reflectingStatusTv.visibility = View.VISIBLE
            shimmerView.visibility = View.VISIBLE
            startBreathingEffect()
        } else {
            // Received reflection state
            stopBreathingEffect()
            reflectingStatusTv.visibility = View.GONE
            shimmerView.visibility = View.GONE
            messageTv.text = message
            messageTv.alpha = 0f
            messageTv.visibility = View.VISIBLE
            messageTv.animate().alpha(1f).setDuration(600).start()
        }
    }

    private fun startBreathingEffect() {
        pulseAnimator?.cancel()
        pulseAnimator = ValueAnimator.ofFloat(0.5f, 1.0f).apply {
            duration = 1500
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = AccelerateDecelerateInterpolator()
            addUpdateListener { anim ->
                reflectingStatusTv.alpha = anim.animatedValue as Float
            }
            start()
        }
    }

    private fun stopBreathingEffect() {
        pulseAnimator?.cancel()
        reflectingStatusTv.alpha = 1.0f
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        pulseAnimator?.cancel()
    }
}
