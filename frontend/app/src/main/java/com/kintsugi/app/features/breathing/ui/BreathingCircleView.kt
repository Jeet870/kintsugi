package com.kintsugi.app.features.breathing.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.kintsugi.app.R
import kotlin.math.PI
import kotlin.math.sin

/**
 * Signature Custom Canvas View for Kintsugi Mindfulness Breathing.
 *
 * Visual Layers:
 * 1. Outer Ambient Glow (20–30% opacity Gold/Amber/Teal radial gradient)
 * 2. Soft Ripple Layer (expands/contracts with breath)
 * 3. Sweeping Gold Circular Progress Ring
 * 4. Main Radial Gold Gradient Circle (Warm Gold -> Amber -> Soft Cream)
 * 5. Inner Specular Highlight Glow
 *
 * Scale Behavior:
 * - Inhale: 0.60 -> 1.00 (Cubic Ease Out)
 * - Hold: 1.00 with ambient pulse
 * - Exhale: 1.00 -> 0.60 (Cubic Ease In-Out)
 * - Rest: 0.60
 */
class BreathingCircleView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var currentPhase: BreathingPhaseState = BreathingPhaseState.IDLE
    private var phaseProgress: Float = 0f

    // Cached Paint objects to ensure 60fps rendering with 0 allocations during onDraw()
    private val ambientGlowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val ripplePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
    private val progressRingPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 6.toPx()
    }
    private val progressBgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3.toPx()
    }
    private val mainCirclePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val specularPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }

    private val progressBounds = RectF()

    // Color definitions
    private val colorGold = ContextCompat.getColor(context, R.color.luxury_gold)
    private val colorAmber = Color.parseColor("#FFBF00")
    private val colorCream = Color.parseColor("#FDFBF7")
    private val colorTeal = ContextCompat.getColor(context, R.color.emerald_green)
    private val colorTransparent = ContextCompat.getColor(context, android.R.color.transparent)

    // Cached Shaders
    private var cachedGlowShader: RadialGradient? = null
    private var cachedMainShader: RadialGradient? = null
    private var cachedSpecularShader: LinearGradient? = null
    private var lastShaderRadius = -1f

    /**
     * Set phase and progress (0.0f to 1.0f).
     */
    fun setProgress(phase: BreathingPhaseState, progress: Float) {
        this.currentPhase = phase
        this.phaseProgress = progress.coerceIn(0f, 1f)
        postInvalidateOnAnimation()
    }

    /**
     * Alias for [setProgress].
     */
    fun updateState(phase: BreathingPhaseState, progress: Float) {
        setProgress(phase, progress)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val cx = width / 2f
        val cy = height / 2f
        val maxRadius = width.coerceAtMost(height) / 2.6f

        // Organic Scale Factor calculation
        val scaleFactor = calculateScaleFactor(currentPhase, phaseProgress)
        val orbRadius = maxRadius * scaleFactor

        // Recreate cached Shaders only if size changed
        if (lastShaderRadius != orbRadius && orbRadius > 0) {
            lastShaderRadius = orbRadius
            cachedGlowShader = RadialGradient(
                cx, cy, orbRadius * 1.5f,
                intArrayOf(colorGold, colorAmber, colorTeal, colorTransparent),
                floatArrayOf(0f, 0.4f, 0.7f, 1f),
                Shader.TileMode.CLAMP
            )

            cachedMainShader = RadialGradient(
                cx, cy - (orbRadius * 0.2f), orbRadius,
                intArrayOf(colorCream, colorGold, colorAmber),
                floatArrayOf(0f, 0.6f, 1f),
                Shader.TileMode.CLAMP
            )

            cachedSpecularShader = LinearGradient(
                cx - orbRadius, cy - orbRadius, cx, cy,
                Color.argb(90, 255, 255, 255), colorTransparent,
                Shader.TileMode.CLAMP
            )
        }

        // LAYER 1: Outer Ambient Glow (20-30% opacity)
        if (cachedGlowShader != null) {
            ambientGlowPaint.shader = cachedGlowShader
            ambientGlowPaint.alpha = (50 + (scaleFactor * 80)).toInt().coerceIn(0, 255)
            canvas.drawCircle(cx, cy, orbRadius * 1.45f, ambientGlowPaint)
        }

        // LAYER 2: Soft Ripple Ring
        val rippleRadius = orbRadius + (16.toPx() * phaseProgress)
        ripplePaint.color = colorGold
        ripplePaint.strokeWidth = 2.toPx()
        ripplePaint.alpha = ((1f - phaseProgress) * 70).toInt().coerceIn(0, 255)
        canvas.drawCircle(cx, cy, rippleRadius, ripplePaint)

        // LAYER 3: Sweeping Circular Gold Progress Ring
        val ringRadius = maxRadius + 14.toPx()
        progressBounds.set(cx - ringRadius, cy - ringRadius, cx + ringRadius, cy + ringRadius)
        progressBgPaint.color = ContextCompat.getColor(context, R.color.gold_accent_alpha15)
        canvas.drawCircle(cx, cy, ringRadius, progressBgPaint)

        if (currentPhase != BreathingPhaseState.IDLE && currentPhase != BreathingPhaseState.PAUSED) {
            progressRingPaint.color = colorGold
            val sweepAngle = phaseProgress * 360f
            canvas.drawArc(progressBounds, -90f, sweepAngle, false, progressRingPaint)
        }

        // LAYER 4: Main Radial Gold Gradient Circle
        if (cachedMainShader != null) {
            mainCirclePaint.shader = cachedMainShader
            canvas.drawCircle(cx, cy, orbRadius, mainCirclePaint)
        }

        // LAYER 5: Inner Specular Highlight Glow
        if (cachedSpecularShader != null) {
            specularPaint.shader = cachedSpecularShader
            canvas.drawCircle(cx - (orbRadius * 0.2f), cy - (orbRadius * 0.2f), orbRadius * 0.5f, specularPaint)
        }
    }

    private fun calculateScaleFactor(phase: BreathingPhaseState, progress: Float): Float {
        return when (phase) {
            BreathingPhaseState.IDLE -> 0.60f
            BreathingPhaseState.INHALE -> 0.60f + (0.40f * cubicEaseOut(progress))
            BreathingPhaseState.HOLD_IN -> 1.00f + (0.02f * sin(progress * PI * 2).toFloat())
            BreathingPhaseState.EXHALE -> 1.00f - (0.40f * cubicEaseInOut(progress))
            BreathingPhaseState.HOLD_OUT -> 0.60f + (0.01f * sin(progress * PI * 2).toFloat())
            BreathingPhaseState.PAUSED -> 0.65f
            BreathingPhaseState.COMPLETED -> 0.90f
        }
    }

    private fun cubicEaseOut(t: Float): Float {
        val f = t - 1f
        return f * f * f + 1f
    }

    private fun cubicEaseInOut(t: Float): Float {
        return if (t < 0.5f) {
            4f * t * t * t
        } else {
            val f = (2f * t) - 2f
            0.5f * f * f * f + 1f
        }
    }

    private fun Int.toPx(): Float = this * resources.displayMetrics.density
}
