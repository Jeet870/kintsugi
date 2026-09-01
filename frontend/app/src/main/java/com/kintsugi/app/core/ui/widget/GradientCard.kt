package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.util.AttributeSet
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class GradientCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.luxury_gold)
        style = Paint.Style.STROKE
        strokeWidth = 1.5f * resources.displayMetrics.density
    }

    private val cornerRadius = 24f * resources.displayMetrics.density
    private val rectF = RectF()

    init {
        setWillNotDraw(false)
        val pad = (20 * resources.displayMetrics.density).toInt()
        setPadding(pad, pad, pad, pad)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val inset = strokePaint.strokeWidth / 2f
        rectF.set(inset, inset, w - inset, h - inset)

        val colorStart = ContextCompat.getColor(context, R.color.royal_purple)
        val colorEnd = ContextCompat.getColor(context, R.color.deep_violet)

        bgPaint.shader = LinearGradient(
            0f, 0f, w.toFloat(), h.toFloat(),
            colorStart, colorEnd,
            Shader.TileMode.CLAMP
        )
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, bgPaint)
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, strokePaint)
        super.onDraw(canvas)
    }
}
