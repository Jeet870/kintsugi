package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Shader
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class LoadingShimmerView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val shimmerPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private var shimmerTranslateX = 0f
    private var animator: ValueAnimator? = null

    init {
        startShimmerAnimation()
    }

    private fun startShimmerAnimation() {
        animator = ValueAnimator.ofFloat(-1f, 2f).apply {
            duration = 1800
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener { anim ->
                shimmerTranslateX = anim.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val baseColor = ContextCompat.getColor(context, R.color.glass_card_bg)
        val highlightColor = ContextCompat.getColor(context, R.color.royal_purple_light)

        shimmerPaint.shader = LinearGradient(
            0f, 0f, w.toFloat() * 0.6f, 0f,
            intArrayOf(baseColor, highlightColor, baseColor),
            floatArrayOf(0f, 0.5f, 1f),
            Shader.TileMode.CLAMP
        )
    }

    override fun onDraw(canvas: Canvas) {
        canvas.save()
        canvas.translate(shimmerTranslateX * width, 0f)
        canvas.drawRoundRect(0f, 0f, width.toFloat(), height.toFloat(), 16f, 16f, shimmerPaint)
        canvas.restore()
        super.onDraw(canvas)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}
