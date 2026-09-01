package com.kintsugi.app.features.aicompanion.ui.components

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader
import android.provider.Settings
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

/**
 * Custom 60 FPS pulsating glowing AI orb view for Kintsugi AI Companion header & thinking state.
 * Features a slow breathing pulse (2500ms duration) with layered radial violet glows.
 */
class AiOrbView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val outerGlowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val corePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private var pulseProgress = 0.5f
    private var animator: ValueAnimator? = null

    init {
        checkReduceMotionAndStartAnimation()
    }

    private fun checkReduceMotionAndStartAnimation() {
        val animatorScale = try {
            Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1.0f)
        } catch (_: Exception) {
            1.0f
        }

        if (animatorScale > 0f) {
            startPulseAnimation()
        } else {
            pulseProgress = 0.5f
        }
    }

    private fun startPulseAnimation() {
        animator = ValueAnimator.ofFloat(0.3f, 1.0f).apply {
            duration = 2500
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = LinearInterpolator()
            addUpdateListener { anim ->
                pulseProgress = anim.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (w <= 0 || h <= 0) return

        val centerX = w * 0.5f
        val centerY = h * 0.5f
        val maxRadius = Math.min(w, h) * 0.5f

        val primaryViolet = ContextCompat.getColor(context, R.color.royal_purple)
        val brightHighlight = ContextCompat.getColor(context, R.color.soft_lavender)

        outerGlowPaint.shader = RadialGradient(
            centerX,
            centerY,
            maxRadius,
            intArrayOf(
                (0x66 shl 24) or (primaryViolet and 0x00FFFFFF),
                (0x00 shl 24) or (primaryViolet and 0x00FFFFFF)
            ),
            floatArrayOf(0.0f, 1.0f),
            Shader.TileMode.CLAMP
        )

        corePaint.shader = RadialGradient(
            centerX,
            centerY,
            maxRadius * 0.45f,
            intArrayOf(
                (0xE6 shl 24) or (brightHighlight and 0x00FFFFFF),
                (0x80 shl 24) or (primaryViolet and 0x00FFFFFF)
            ),
            floatArrayOf(0.0f, 1.0f),
            Shader.TileMode.CLAMP
        )
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0f || h <= 0f) return

        val centerX = w * 0.5f
        val centerY = h * 0.5f
        val maxRadius = Math.min(w, h) * 0.5f

        canvas.save()
        val outerScale = 0.8f + (pulseProgress * 0.2f)
        canvas.scale(outerScale, outerScale, centerX, centerY)
        canvas.drawCircle(centerX, centerY, maxRadius, outerGlowPaint)
        canvas.restore()

        canvas.save()
        val coreScale = 0.9f + (pulseProgress * 0.1f)
        canvas.scale(coreScale, coreScale, centerX, centerY)
        canvas.drawCircle(centerX, centerY, maxRadius * 0.45f, corePaint)
        canvas.restore()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}
