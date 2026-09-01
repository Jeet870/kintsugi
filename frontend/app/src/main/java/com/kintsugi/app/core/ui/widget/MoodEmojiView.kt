package com.kintsugi.app.core.ui.widget

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.util.AttributeSet
import android.view.Gravity
import android.view.MotionEvent
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

class MoodEmojiView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val glassBgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.glass_card_bg)
        style = Paint.Style.FILL
    }

    private val ringPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.luxury_gold)
        style = Paint.Style.STROKE
        strokeWidth = 2.5f * resources.displayMetrics.density
    }

    private val rectF = RectF()
    private var isSelectedState = false

    private val emojiTextView = TextView(context).apply {
        textSize = 28f
        gravity = Gravity.CENTER
    }

    private val labelTextView = TextView(context).apply {
        textSize = 11f
        gravity = Gravity.CENTER
        setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
    }

    init {
        setWillNotDraw(false)
        val container = android.widget.LinearLayout(context).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            gravity = Gravity.CENTER
        }
        container.addView(emojiTextView)
        container.addView(labelTextView)

        val lp = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
            gravity = Gravity.CENTER
        }
        addView(container, lp)
        minimumWidth = (64 * resources.displayMetrics.density).toInt()
        minimumHeight = (64 * resources.displayMetrics.density).toInt()
    }

    fun setEmoji(emoji: String) {
        emojiTextView.text = emoji
        contentDescription = "Mood $emoji"
    }

    fun setLabel(label: String) {
        labelTextView.text = label
    }

    fun setSelectedAnimated(selected: Boolean) {
        this.isSelectedState = selected
        labelTextView.setTextColor(
            ContextCompat.getColor(
                context,
                if (selected) R.color.luxury_gold else R.color.text_secondary
            )
        )
        animate().scaleX(if (selected) 1.08f else 1.0f)
            .scaleY(if (selected) 1.08f else 1.0f)
            .setDuration(250)
            .start()
        invalidate()
    }

    override fun isSelected(): Boolean = isSelectedState

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                animate().scaleX(0.94f).scaleY(0.94f).setDuration(100).start()
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                val targetScale = if (isSelectedState) 1.08f else 1.0f
                animate().scaleX(targetScale).scaleY(targetScale).setDuration(150).start()
            }
        }
        return super.onTouchEvent(event)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val inset = ringPaint.strokeWidth / 2f
        rectF.set(inset, inset, w - inset, h - inset)

        val goldStart = ContextCompat.getColor(context, R.color.luxury_gold)
        val goldEnd = ContextCompat.getColor(context, R.color.soft_lavender)
        ringPaint.shader = LinearGradient(0f, 0f, w.toFloat(), h.toFloat(), goldStart, goldEnd, Shader.TileMode.CLAMP)
    }

    override fun onDraw(canvas: Canvas) {
        val cx = width / 2f
        val cy = height / 2f
        val radius = width.coerceAtMost(height) / 2f - ringPaint.strokeWidth

        canvas.drawCircle(cx, cy, radius, glassBgPaint)

        if (isSelectedState) {
            canvas.drawCircle(cx, cy, radius, ringPaint)
        }
        super.onDraw(canvas)
    }
}
