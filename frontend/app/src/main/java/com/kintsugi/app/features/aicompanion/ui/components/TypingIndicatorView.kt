package com.kintsugi.app.features.aicompanion.ui.components

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class TypingIndicatorView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val dotPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.luxury_gold)
        style = Paint.Style.FILL
    }

    private val animValues = FloatArray(3) { 0.3f }
    private var animators = mutableListOf<ValueAnimator>()

    init {
        startDotAnimations()
    }

    private fun startDotAnimations() {
        for (i in 0..2) {
            val anim = ValueAnimator.ofFloat(0.3f, 1.0f).apply {
                duration = 600
                startDelay = (i * 180).toLong()
                repeatCount = ValueAnimator.INFINITE
                repeatMode = ValueAnimator.REVERSE
                interpolator = AccelerateDecelerateInterpolator()
                addUpdateListener { animation ->
                    animValues[i] = animation.animatedValue as Float
                    invalidate()
                }
            }
            animators.add(anim)
            anim.start()
        }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val desiredWidth = (54 * resources.displayMetrics.density).toInt()
        val desiredHeight = (24 * resources.displayMetrics.density).toInt()
        setMeasuredDimension(
            resolveSize(desiredWidth, widthMeasureSpec),
            resolveSize(desiredHeight, heightMeasureSpec)
        )
    }

    override fun onDraw(canvas: Canvas) {
        val radius = 4f * resources.displayMetrics.density
        val spacing = 14f * resources.displayMetrics.density
        val startX = (width - (spacing * 2)) / 2f
        val centerY = height / 2f

        for (i in 0..2) {
            val cx = startX + (i * spacing)
            dotPaint.alpha = (animValues[i] * 255).toInt()
            val currentRadius = radius * (0.8f + (animValues[i] * 0.4f))
            canvas.drawCircle(cx, centerY, currentRadius, dotPaint)
        }
        super.onDraw(canvas)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animators.forEach { it.cancel() }
    }
}
