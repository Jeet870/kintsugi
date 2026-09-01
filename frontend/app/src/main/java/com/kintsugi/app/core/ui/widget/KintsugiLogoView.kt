package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator

/**
 * Custom Brand Emblem for the Kintsugi Royal Violet Edition.
 * Features an organic 4-point star geometric core with smooth pulse animations and soft lavender glow.
 */
class KintsugiLogoView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val outerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val innerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val corePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val whiteCorePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.parseColor("#FFFFFF")
    }

    private val outerPath = Path()
    private val innerPath = Path()
    private val corePath = Path()

    private var pulseScale = 1.0f
    private var glowAlpha = 0.5f
    private var animator: ValueAnimator? = null
    private var initialized = false

    init {
        contentDescription = "Kintsugi Royal Violet Emblem"
        startPulseAnimation()
    }

    private fun startPulseAnimation() {
        animator = ValueAnimator.ofFloat(0.92f, 1.05f).apply {
            duration = 2500
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = AccelerateDecelerateInterpolator()
            addUpdateListener { anim ->
                pulseScale = anim.animatedValue as Float
                glowAlpha = 0.4f + (pulseScale - 0.92f) * 2f
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (w > 0 && h > 0) {
            setupGeometry(w, h)
        }
    }

    private fun setupGeometry(w: Int, h: Int) {
        val sx = w / 100f
        val sy = h / 100f

        // Ambient Violet Radial Glow
        glowPaint.shader = RadialGradient(
            50f * sx, 50f * sy, 48f * sx,
            intArrayOf(Color.parseColor("#7C5CFF"), Color.parseColor("#A88BFF"), Color.TRANSPARENT),
            floatArrayOf(0f, 0.45f, 1f),
            Shader.TileMode.CLAMP
        )

        // Outer Organic Petal Star Gradient (#7C5CFF -> #5A38E0 -> #4326B8)
        outerPaint.shader = LinearGradient(
            0f, 0f, w.toFloat(), h.toFloat(),
            intArrayOf(Color.parseColor("#7C5CFF"), Color.parseColor("#5A38E0"), Color.parseColor("#4326B8")),
            floatArrayOf(0f, 0.6f, 1f),
            Shader.TileMode.CLAMP
        )

        // Inner Vibrant Lavender Star Gradient (#CBB9FF -> #A88BFF -> #7C5CFF)
        innerPaint.shader = LinearGradient(
            w.toFloat(), 0f, 0f, h.toFloat(),
            intArrayOf(Color.parseColor("#CBB9FF"), Color.parseColor("#A88BFF"), Color.parseColor("#7C5CFF")),
            floatArrayOf(0f, 0.5f, 1f),
            Shader.TileMode.CLAMP
        )

        // Core Fill Gradient (#EBE5FF -> #CBB9FF -> #A88BFF)
        corePaint.shader = LinearGradient(
            20f * sx, 20f * sy, 80f * sx, 80f * sy,
            intArrayOf(Color.parseColor("#EBE5FF"), Color.parseColor("#CBB9FF"), Color.parseColor("#A88BFF")),
            floatArrayOf(0f, 0.4f, 1f),
            Shader.TileMode.CLAMP
        )

        // 1. Outer Path
        outerPath.reset()
        outerPath.moveTo(50f * sx, 6f * sy)
        outerPath.cubicTo(50f * sx, 30f * sy, 30f * sx, 50f * sy, 6f * sx, 50f * sy)
        outerPath.cubicTo(30f * sx, 50f * sy, 50f * sx, 70f * sy, 50f * sx, 94f * sy)
        outerPath.cubicTo(50f * sx, 70f * sy, 70f * sx, 50f * sy, 94f * sx, 50f * sy)
        outerPath.cubicTo(70f * sx, 50f * sy, 50f * sx, 30f * sy, 50f * sx, 6f * sy)
        outerPath.close()

        // 2. Inner Path
        innerPath.reset()
        innerPath.moveTo(50f * sx, 14f * sy)
        innerPath.cubicTo(50f * sx, 34f * sy, 34f * sx, 50f * sy, 14f * sx, 50f * sy)
        innerPath.cubicTo(34f * sx, 50f * sy, 50f * sx, 66f * sy, 50f * sx, 86f * sy)
        innerPath.cubicTo(50f * sx, 66f * sy, 66f * sx, 50f * sy, 86f * sx, 50f * sy)
        innerPath.cubicTo(66f * sx, 50f * sy, 50f * sx, 34f * sy, 50f * sx, 14f * sx)
        innerPath.close()

        // 3. Core Path
        corePath.reset()
        corePath.moveTo(50f * sx, 22f * sy)
        corePath.cubicTo(50f * sx, 38f * sy, 38f * sx, 50f * sy, 22f * sx, 50f * sy)
        corePath.cubicTo(38f * sx, 50f * sy, 50f * sx, 62f * sy, 50f * sx, 78f * sy)
        corePath.cubicTo(50f * sx, 62f * sy, 62f * sx, 50f * sy, 78f * sx, 50f * sy)
        corePath.cubicTo(62f * sx, 50f * sy, 50f * sx, 38f * sy, 50f * sx, 22f * sy)
        corePath.close()

        initialized = true
    }

    override fun onDraw(canvas: Canvas) {
        if (width <= 0 || height <= 0) return

        if (!initialized) {
            setupGeometry(width, height)
        }

        val cx = width / 2f
        val cy = height / 2f
        val radius = width.coerceAtMost(height) / 2f

        // Draw Ambient Radial Glow
        glowPaint.alpha = (glowAlpha * 140).toInt().coerceIn(0, 255)
        canvas.drawCircle(cx, cy, radius, glowPaint)

        // Draw Outer Petal Star
        canvas.drawPath(outerPath, outerPaint)

        // Draw Inner Star
        canvas.drawPath(innerPath, innerPaint)

        // Draw Center Core with Pulse Animation
        canvas.save()
        canvas.scale(pulseScale, pulseScale, cx, cy)
        canvas.drawPath(corePath, corePaint)
        canvas.drawCircle(cx, cy, 4.5f * (width / 100f), whiteCorePaint)
        canvas.restore()

        super.onDraw(canvas)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}
