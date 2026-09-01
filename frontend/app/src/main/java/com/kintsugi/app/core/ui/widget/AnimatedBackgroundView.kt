package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader
import android.provider.Settings
import android.util.AttributeSet
import android.view.animation.LinearInterpolator
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

/**
 * Reusable animated background container for the Kintsugi Deep Purple Edition.
 * Renders [R.drawable.background_app_gradient], dynamic soft violet radial ambient glow pulse,
 * and embedded floating particles for visual consistency across every screen.
 */
class AnimatedBackgroundView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val ambientGlowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private var animProgress = 0.5f
    private var animator: ValueAnimator? = null
    private val particlesView = FloatingParticlesView(context)

    init {
        setWillNotDraw(false)
        background = ContextCompat.getDrawable(context, R.drawable.background_app_gradient)
        addView(particlesView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        checkReduceMotionAndStartAnimation()
    }

    private fun checkReduceMotionAndStartAnimation() {
        val animatorScale = try {
            Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1.0f)
        } catch (_: Exception) {
            1.0f
        }

        if (animatorScale > 0f) {
            startNativeBackgroundAnimation()
        } else {
            animProgress = 0.5f
        }
    }

    private fun startNativeBackgroundAnimation() {
        animator = ValueAnimator.ofFloat(0.3f, 0.7f).apply {
            duration = 10000
            repeatCount = ValueAnimator.INFINITE
            repeatMode = ValueAnimator.REVERSE
            interpolator = LinearInterpolator()
            addUpdateListener { anim ->
                animProgress = anim.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        updateRadialShader(w.toFloat(), h.toFloat())
    }

    private fun updateRadialShader(w: Float, h: Float) {
        if (w <= 0f || h <= 0f) return
        val radius = Math.max(w, h) * 0.75f
        val violetColor = ContextCompat.getColor(context, R.color.royal_purple)
        val alphaViolet = (0x1C shl 24) or (violetColor and 0x00FFFFFF)
        val transparentViolet = (0x00 shl 24) or (violetColor and 0x00FFFFFF)

        ambientGlowPaint.shader = RadialGradient(
            w * 0.5f,
            h * 0.35f,
            radius,
            intArrayOf(alphaViolet, transparentViolet),
            floatArrayOf(0.0f, 1.0f),
            Shader.TileMode.CLAMP
        )
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.save()
        canvas.scale(1.0f + (animProgress * 0.05f), 1.0f + (animProgress * 0.05f), width * 0.5f, height * 0.35f)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), ambientGlowPaint)
        canvas.restore()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}
