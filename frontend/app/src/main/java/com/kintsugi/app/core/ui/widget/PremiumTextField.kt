package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatEditText
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class PremiumTextField @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = android.R.attr.editTextStyle
) : AppCompatEditText(context, attrs, defStyleAttr) {

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
        setHintTextColor(ContextCompat.getColor(context, R.color.text_muted))
        textSize = 14f
        background = null
        val padH = (16 * resources.displayMetrics.density).toInt()
        val padV = (14 * resources.displayMetrics.density).toInt()
        setPadding(padH, padV, padH, padV)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val inset = strokePaint.strokeWidth / 2f
        rectF.set(inset, inset, w - inset, h - inset)
    }

    override fun onFocusChanged(focused: Boolean, direction: Int, previouslyFocusedRect: android.graphics.Rect?) {
        super.onFocusChanged(focused, direction, previouslyFocusedRect)
        strokePaint.color = if (focused) {
            ContextCompat.getColor(context, R.color.royal_purple)
        } else {
            ContextCompat.getColor(context, R.color.glass_card_border)
        }
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, bgPaint)
        canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, strokePaint)
        super.onDraw(canvas)
    }
}
