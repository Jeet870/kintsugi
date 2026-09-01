package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class SecondaryButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatButton(context, attrs, defStyleAttr) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.glass_card_bg)
        style = Paint.Style.FILL
    }

    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.glass_card_border)
        style = Paint.Style.STROKE
        strokeWidth = 1.5f * resources.displayMetrics.density
    }

    private val cornerRadius = 14f * resources.displayMetrics.density
    private val rectF = RectF()

    init {
        setTextColor(ContextCompat.getColor(context, R.color.text_primary))
        textSize = 14f
        isAllCaps = false
        background = null
        val padV = (12 * resources.displayMetrics.density).toInt()
        val padH = (20 * resources.displayMetrics.density).toInt()
        setPadding(padH, padV, padH, padV)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val inset = strokePaint.strokeWidth / 2f
        rectF.set(inset, inset, w - inset, h - inset)
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, bgPaint)
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, strokePaint)
        super.onDraw(canvas)
    }
}

class GhostButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatButton(context, attrs, defStyleAttr) {

    init {
        setTextColor(ContextCompat.getColor(context, R.color.soft_lavender))
        textSize = 14f
        isAllCaps = false
        background = null
    }
}
