package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class FloatingGlowView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private var pulseAlpha = 0.5f
    private var animator: ValueAnimator? = null

    init {
        startGlowPulseAnimation()
    }

    private fun startGlowPulseAnimation() {
        animator = ValueAnimator.ofFloat(0.3f, 0.7f).apply {
            duration = 3500
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = AccelerateDecelerateInterpolator()
            addUpdateListener { anim ->
                pulseAlpha = anim.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val glowColor = ContextCompat.getColor(context, R.color.royal_purple)
        val transparentColor = ContextCompat.getColor(context, android.R.color.transparent)

        glowPaint.shader = RadialGradient(
            w / 2f, h / 2f, (w.coerceAtMost(h) / 2f),
            intArrayOf(glowColor, transparentColor),
            floatArrayOf(0f, 1f),
            Shader.TileMode.CLAMP
        )
    }

    override fun onDraw(canvas: Canvas) {
        glowPaint.alpha = (pulseAlpha * 150).toInt().coerceIn(0, 255)
        canvas.drawCircle(width / 2f, height / 2f, width.coerceAtMost(height) / 2f, glowPaint)
        super.onDraw(canvas)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}
