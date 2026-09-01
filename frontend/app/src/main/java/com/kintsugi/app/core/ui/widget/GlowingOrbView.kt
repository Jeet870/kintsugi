package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

/**
 * Animated Ambient Glowing Orb View rendering concentric translucent purple glowing rings
 * with dynamic breathing pulse animation, matching the Kintsugi hero card aesthetic.
 */
class GlowingOrbView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val outerPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val midPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val innerPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val iconDrawable = ContextCompat.getDrawable(context, R.drawable.ic_cloud_mood)

    private var pulseScale = 1.0f

    private val animator = ValueAnimator.ofFloat(0.92f, 1.08f).apply {
        duration = 3200
        repeatCount = ValueAnimator.INFINITE
        repeatMode = ValueAnimator.REVERSE
        interpolator = AccelerateDecelerateInterpolator()
        addUpdateListener { animation ->
            pulseScale = animation.animatedValue as Float
            invalidate()
        }
    }

    init {
        animator.start()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator.cancel()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val cx = width / 2f
        val cy = height / 2f
        val maxRadius = (minOf(width, height) / 2f) * 0.9f

        // Outer glow
        val r1 = maxRadius * pulseScale
        outerPaint.shader = RadialGradient(
            cx, cy, r1,
            intArrayOf(Color.parseColor("#4C8B5CF6"), Color.parseColor("#108B5CF6"), Color.TRANSPARENT),
            floatArrayOf(0.0f, 0.6f, 1.0f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(cx, cy, r1, outerPaint)

        // Middle glow
        val r2 = maxRadius * 0.72f * pulseScale
        midPaint.shader = RadialGradient(
            cx, cy, r2,
            intArrayOf(Color.parseColor("#80A855F7"), Color.parseColor("#307C3AED"), Color.TRANSPARENT),
            floatArrayOf(0.0f, 0.7f, 1.0f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(cx, cy, r2, midPaint)

        // Inner glowing core
        val r3 = maxRadius * 0.45f
        innerPaint.shader = RadialGradient(
            cx, cy, r3,
            intArrayOf(Color.parseColor("#CC9333EA"), Color.parseColor("#806B21A8"), Color.TRANSPARENT),
            floatArrayOf(0.0f, 0.8f, 1.0f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(cx, cy, r3, innerPaint)

        // Draw central cloud icon
        iconDrawable?.let { drawable ->
            val iconSize = (maxRadius * 0.6f).toInt()
            drawable.setBounds(
                (cx - iconSize / 2).toInt(),
                (cy - iconSize / 2).toInt(),
                (cx + iconSize / 2).toInt(),
                (cy + iconSize / 2).toInt()
            )
            drawable.setTint(Color.parseColor("#F3E8FF"))
            drawable.draw(canvas)
        }
    }
}
