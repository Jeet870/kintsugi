package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import androidx.interpolator.view.animation.FastOutSlowInInterpolator
import com.kintsugi.app.R

/**
 * Premium 32dp x 3dp active top indicator centered perfectly above the active tab icon.
 * Features 1.5dp corner radius, Primary Violet color, and 220ms FastOutSlowInInterpolator animation.
 */
class NavigationIndicatorView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val indicatorPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.royal_purple)
        style = Paint.Style.FILL
    }

    private val rectF = RectF()
    private var currentX = 0f
    private var targetX = 0f
    private var indicatorAlpha = 1f
    private var scaleX = 1f
    private var animator: ValueAnimator? = null

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (currentX <= 0f) return

        val pillWidth = (32f * resources.displayMetrics.density) * scaleX
        val pillHeight = 3f * resources.displayMetrics.density
        val cornerRadius = 1.5f * resources.displayMetrics.density
        val topY = 0f

        rectF.set(
            currentX - (pillWidth / 2f),
            topY,
            currentX + (pillWidth / 2f),
            topY + pillHeight
        )
        indicatorPaint.alpha = (indicatorAlpha * 255).toInt().coerceIn(0, 255)
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, indicatorPaint)
    }

    fun animateToPosition(newX: Float) {
        targetX = newX
        val startX = currentX
        animator?.cancel()

        animator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 220
            interpolator = FastOutSlowInInterpolator()
            addUpdateListener { anim ->
                val fraction = anim.animatedValue as Float
                currentX = startX + (targetX - startX) * fraction
                // Subtle scale pulsation on slide
                scaleX = 0.85f + (0.15f * Math.sin(fraction * Math.PI).toFloat())
                indicatorAlpha = 1f
                invalidate()
            }
            start()
        }
    }

    fun setPosition(newX: Float) {
        currentX = newX
        targetX = newX
        scaleX = 1f
        indicatorAlpha = 1f
        invalidate()
    }
}
