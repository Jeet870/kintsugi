package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.util.AttributeSet
import android.view.animation.LinearInterpolator
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class AnimatedBorderView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2f * resources.displayMetrics.density
    }

    private val rectF = RectF()
    private val cornerRadius = 28f * resources.displayMetrics.density

    private var animPhase = 0f
    private var animator: ValueAnimator? = null

    init {
        setWillNotDraw(false)
        startBorderAnimation()
    }

    private fun startBorderAnimation() {
        animator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 4000
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener { anim ->
                animPhase = anim.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val inset = borderPaint.strokeWidth / 2f
        rectF.set(inset, inset, w - inset, h - inset)
        updateShader(w, h)
    }

    private fun updateShader(w: Int, h: Int) {
        val colorGold = ContextCompat.getColor(context, R.color.luxury_gold)
        val colorPurple = ContextCompat.getColor(context, R.color.royal_purple)
        val colorLavender = ContextCompat.getColor(context, R.color.soft_lavender)

        borderPaint.shader = LinearGradient(
            0f, 0f, w.toFloat(), h.toFloat(),
            intArrayOf(colorGold, colorPurple, colorLavender, colorGold),
            floatArrayOf(0f, 0.33f, 0.66f, 1f),
            Shader.TileMode.MIRROR
        )
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, borderPaint)
        super.onDraw(canvas)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}
