package com.kintsugi.app.features.moodtracker.ui.components

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.kintsugi.app.R
import com.kintsugi.app.core.common.MoodOptions

class PremiumMoodCardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.card_surface)
        style = Paint.Style.FILL
    }

    private val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.glass_card_border)
        style = Paint.Style.STROKE
        strokeWidth = 1.5f * resources.displayMetrics.density
    }

    private val purpleSelectionPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.royal_purple)
        style = Paint.Style.STROKE
        strokeWidth = 2.5f * resources.displayMetrics.density
    }

    private val selectedBgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#268B5CF6")
        style = Paint.Style.FILL
    }

    private val rectF = RectF()
    private val cornerRadius = 18f * resources.displayMetrics.density

    private val emojiTv = TextView(context).apply {
        textSize = 34f
        gravity = Gravity.CENTER
    }

    private val labelTv = TextView(context).apply {
        textSize = 13f
        gravity = Gravity.CENTER
        setTextColor(ContextCompat.getColor(context, R.color.text_primary))
        typeface = android.graphics.Typeface.DEFAULT_BOLD
    }

    private val checkBadge = TextView(context).apply {
        text = "✓"
        textSize = 10f
        gravity = Gravity.CENTER
        setTextColor(Color.WHITE)
        background = ContextCompat.getDrawable(context, R.drawable.bg_gold_glow_circle)?.apply {
            setTint(ContextCompat.getColor(context, R.color.royal_purple))
        }
        val size = (18 * resources.displayMetrics.density).toInt()
        layoutParams = LayoutParams(size, size, Gravity.TOP or Gravity.END).apply {
            topMargin = (6 * resources.displayMetrics.density).toInt()
            marginEnd = (6 * resources.displayMetrics.density).toInt()
        }
        visibility = View.GONE
    }

    var moodOptions: MoodOptions = MoodOptions.CALM
        private set

    var isSelectedMood: Boolean = false
        private set

    init {
        setWillNotDraw(false)
        val padH = (12 * resources.displayMetrics.density).toInt()
        val padV = (14 * resources.displayMetrics.density).toInt()
        setPadding(padH, padV, padH, padV)

        val container = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            addView(emojiTv, LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT))
            addView(labelTv, LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
                topMargin = (6 * resources.displayMetrics.density).toInt()
            })
        }

        addView(container, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT, Gravity.CENTER))
        addView(checkBadge)
    }

    fun bindMood(mood: MoodOptions, selected: Boolean) {
        this.moodOptions = mood
        this.isSelectedMood = selected
        emojiTv.text = mood.emoji
        labelTv.text = mood.label

        if (selected) {
            labelTv.setTextColor(ContextCompat.getColor(context, R.color.soft_lavender))
            checkBadge.visibility = View.VISIBLE
            scaleX = 1.02f
            scaleY = 1.02f
        } else {
            labelTv.setTextColor(ContextCompat.getColor(context, R.color.text_primary))
            checkBadge.visibility = View.GONE
            scaleX = 1.0f
            scaleY = 1.0f
        }
        invalidate()
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                animate().scaleX(0.95f).scaleY(0.95f).setDuration(100).start()
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                val targetScale = if (isSelectedMood) 1.02f else 1.0f
                animate().scaleX(targetScale).scaleY(targetScale).setDuration(150).start()
            }
        }
        return super.onTouchEvent(event)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val inset = purpleSelectionPaint.strokeWidth / 2f
        rectF.set(inset, inset, w - inset, h - inset)
    }

    override fun onDraw(canvas: Canvas) {
        if (isSelectedMood) {
            canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, selectedBgPaint)
            canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, purpleSelectionPaint)
        } else {
            canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, bgPaint)
            canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, borderPaint)
        }
        super.onDraw(canvas)
    }
}
