package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class LoadingSkeleton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val rectF = RectF()
    private val cornerRadius = 12f * resources.displayMetrics.density
    private var shimmerOffset = 0f

    private var animator: ValueAnimator? = null

    init {
        startShimmerAnimation()
    }

    private fun startShimmerAnimation() {
        animator = ValueAnimator.ofFloat(-1f, 2f).apply {
            duration = 1200
            repeatCount = ValueAnimator.INFINITE
            addUpdateListener {
                shimmerOffset = it.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        rectF.set(0f, 0f, w.toFloat(), h.toFloat())
    }

    override fun onDraw(canvas: Canvas) {
        val baseColor = ContextCompat.getColor(context, R.color.dark_surface)
        val highlightColor = ContextCompat.getColor(context, R.color.glass_card_bg)

        val width = width.toFloat()
        val startX = width * shimmerOffset
        val endX = startX + width * 0.5f

        bgPaint.shader = LinearGradient(
            startX, 0f, endX, 0f,
            intArrayOf(baseColor, highlightColor, baseColor),
            floatArrayOf(0f, 0.5f, 1f),
            Shader.TileMode.CLAMP
        )

        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, bgPaint)
        super.onDraw(canvas)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}

class GradientProgressView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.dark_surface)
        style = Paint.Style.FILL
    }

    private val progressPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val rectF = RectF()
    private val progressRectF = RectF()
    private var progress = 0.7f // 70% default

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        rectF.set(0f, 0f, w.toFloat(), h.toFloat())

        val colorStart = ContextCompat.getColor(context, R.color.royal_purple)
        val colorEnd = ContextCompat.getColor(context, R.color.luxury_gold)

        progressPaint.shader = LinearGradient(
            0f, 0f, w.toFloat(), 0f,
            colorStart, colorEnd,
            Shader.TileMode.CLAMP
        )
    }

    fun setProgress(value: Float) {
        this.progress = value.coerceIn(0f, 1f)
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        val h = height.toFloat()
        val r = h / 2f
        canvas.drawRoundRect(rectF, r, r, bgPaint)

        progressRectF.set(0f, 0f, width * progress, h)
        canvas.drawRoundRect(progressRectF, r, r, progressPaint)
        super.onDraw(canvas)
    }
}
