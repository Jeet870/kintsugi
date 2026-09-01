package com.kintsugi.app.features.moodtracker.ui.components

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import java.time.LocalDate
import java.time.ZoneId

/**
 * GitHub-style 7x4 Weekly Consistency Heatmap rendering daily mood logging frequency.
 */
class MoodHeatmapView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val density = resources.displayMetrics.density
    private val cellSize = 22f * density
    private val cellGap = 5f * density
    private val labelHeight = 18f * density
    private val cornerRadius = 4f * density

    private val emptyPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#1F1838")
        style = Paint.Style.FILL
    }

    private val level1Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#4C1D95")
        style = Paint.Style.FILL
    }

    private val level2Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#7C3AED")
        style = Paint.Style.FILL
    }

    private val level3Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#C4B5FD")
        style = Paint.Style.FILL
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#9CA3AF")
        textSize = 10f * density
        textAlign = Paint.Align.CENTER
    }

    private val rectF = RectF()
    private var dateCountMap: Map<LocalDate, Int> = emptyMap()
    private val dayLabels = listOf("M", "T", "W", "T", "F", "S", "S")

    fun submitEntries(entries: List<MoodEntryEntity>) {
        dateCountMap = entries.groupBy {
            it.createdAt.atZone(ZoneId.systemDefault()).toLocalDate()
        }.mapValues { it.value.size }
        invalidate()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val desiredWidth = (7 * (cellSize + cellGap)).toInt()
        val desiredHeight = (labelHeight + 4 * (cellSize + cellGap)).toInt()
        setMeasuredDimension(
            resolveSize(desiredWidth, widthMeasureSpec),
            resolveSize(desiredHeight, heightMeasureSpec)
        )
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val totalGridWidth = 7 * cellSize + 6 * cellGap
        val startX = (width - totalGridWidth) / 2f
        val startY = labelHeight

        // 1. Draw Day Header Labels (M T W T F S S)
        for (col in 0 until 7) {
            val cx = startX + col * (cellSize + cellGap) + cellSize / 2f
            canvas.drawText(dayLabels[col], cx, labelHeight - 4f * density, textPaint)
        }

        // 2. Draw 4 Weeks of Daily Squares (Recent 28 Days)
        val today = LocalDate.now()
        // Align to previous Monday
        val startOfWeek = today.minusDays((today.dayOfWeek.value - 1).toLong())
        val firstDate = startOfWeek.minusWeeks(3)

        for (week in 0 until 4) {
            for (day in 0 until 7) {
                val date = firstDate.plusWeeks(week.toLong()).plusDays(day.toLong())
                val count = dateCountMap[date] ?: 0

                val left = startX + day * (cellSize + cellGap)
                val top = startY + week * (cellSize + cellGap)
                rectF.set(left, top, left + cellSize, top + cellSize)

                val paint = when {
                    count >= 3 -> level3Paint
                    count == 2 -> level2Paint
                    count == 1 -> level1Paint
                    else -> emptyPaint
                }

                canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, paint)
            }
        }
    }
}
