package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.util.AttributeSet
import android.view.MotionEvent
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

/**
 * Premium Material 3 Primary Button with Royal Violet & Soft Lavender gradient fill,
 * 16dp corner radius, and subtle scale-down touch animation.
 */
class PrimaryGradientButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatButton(context, attrs, defStyleAttr) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val cornerRadius = 16f * resources.displayMetrics.density
    private val rectF = RectF()
    private var scaleFactor = 1.0f

    init {
        setTextColor(ContextCompat.getColor(context, R.color.text_primary))
        textSize = 15f
        isAllCaps = false
        background = null
        val verticalPadding = (14 * resources.displayMetrics.density).toInt()
        val horizontalPadding = (24 * resources.displayMetrics.density).toInt()
        setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        rectF.set(0f, 0f, w.toFloat(), h.toFloat())

        val colorStart = ContextCompat.getColor(context, R.color.royal_purple)
        val colorEnd = ContextCompat.getColor(context, R.color.soft_lavender)

        bgPaint.shader = LinearGradient(
            0f, 0f, w.toFloat(), 0f,
            colorStart, colorEnd,
            Shader.TileMode.CLAMP
        )
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> animateScale(0.96f)
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> animateScale(1.0f)
        }
        return super.onTouchEvent(event)
    }

    private fun animateScale(targetScale: Float) {
        ValueAnimator.ofFloat(scaleFactor, targetScale).apply {
            duration = 100
            addUpdateListener {
                scaleFactor = it.animatedValue as Float
                scaleX = scaleFactor
                scaleY = scaleFactor
            }
            start()
        }
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, bgPaint)
        super.onDraw(canvas)
    }
}
