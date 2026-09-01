package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.provider.Settings
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import androidx.core.content.ContextCompat
import com.kintsugi.app.R
import kotlin.random.Random

class FloatingParticlesView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private data class Particle(
        var x: Float,
        var y: Float,
        var radius: Float,
        var speedY: Float,
        var speedX: Float,
        var alpha: Float,
        var color: Int
    )

    private val particles = ArrayList<Particle>()
    private val particlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private var animator: ValueAnimator? = null
    private var particleCount = 18
    private var isAnimationEnabled = true

    init {
        val animatorScale = try {
            Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1.0f)
        } catch (e: Exception) {
            1.0f
        }
        isAnimationEnabled = animatorScale > 0f
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (isAnimationEnabled) {
            startParticleEngine()
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }

    private fun startParticleEngine() {
        animator?.cancel()
        animator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 1000
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener {
                updateParticles()
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        particles.clear()

        val colorGold = ContextCompat.getColor(context, R.color.luxury_gold)
        val colorPurple = ContextCompat.getColor(context, R.color.royal_purple_light)
        val colorLavender = ContextCompat.getColor(context, R.color.soft_lavender)
        val palette = intArrayOf(colorGold, colorPurple, colorLavender)

        val density = resources.displayMetrics.density

        repeat(particleCount) {
            particles.add(
                Particle(
                    x = Random.nextFloat() * w,
                    y = Random.nextFloat() * h,
                    radius = (2f + Random.nextFloat() * 4f) * density,
                    speedY = (0.3f + Random.nextFloat() * 0.8f) * density,
                    speedX = (-0.2f + Random.nextFloat() * 0.4f) * density,
                    alpha = 0.15f + Random.nextFloat() * 0.35f,
                    color = palette[Random.nextInt(palette.size)]
                )
            )
        }
    }

    private fun updateParticles() {
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0f || h <= 0f) return

        particles.forEach { p ->
            p.y -= p.speedY
            p.x += p.speedX

            if (p.y < -20f) {
                p.y = h + 20f
                p.x = Random.nextFloat() * w
            }
            if (p.x < -20f) p.x = w + 20f
            if (p.x > w + 20f) p.x = -20f
        }
    }

    override fun onDraw(canvas: Canvas) {
        particles.forEach { p ->
            particlePaint.color = p.color
            particlePaint.alpha = (p.alpha * 255).toInt()
            canvas.drawCircle(p.x, p.y, p.radius, particlePaint)
        }
        super.onDraw(canvas)
    }
}
