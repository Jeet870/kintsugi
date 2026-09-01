package com.kintsugi.app.features.moodtracker.ui.components

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.formatter.ValueFormatter
import com.kintsugi.app.R
import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.database.entity.mood

/**
 * Animated Frequency BarChart rendering mood entry counts for Happy, Calm, Anxious, Sad, Tired, Angry.
 */
class MoodFrequencyBarChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val barChart = BarChart(context).apply {
        layoutParams = LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    }

    init {
        addView(barChart)
        setupChartStyling()
    }

    private fun setupChartStyling() {
        barChart.apply {
            description.isEnabled = false
            legend.isEnabled = false
            setTouchEnabled(true)
            setScaleEnabled(false)
            setPinchZoom(false)
            setDrawGridBackground(false)
            setBackgroundColor(Color.TRANSPARENT)
            setViewPortOffsets(40f, 20f, 40f, 50f)

            xAxis.apply {
                position = XAxis.XAxisPosition.BOTTOM
                setDrawGridLines(false)
                setDrawAxisLine(false)
                textColor = ContextCompat.getColor(context, R.color.text_secondary)
                textSize = 10f
                granularity = 1f
            }

            axisLeft.apply {
                setDrawGridLines(false)
                setDrawAxisLine(false)
                textColor = ContextCompat.getColor(context, R.color.soft_lavender)
                textSize = 10f
                axisMinimum = 0f
                granularity = 1f
            }

            axisRight.isEnabled = false
        }
    }

    fun submitEntries(entries: List<MoodEntryEntity>) {
        if (entries.isEmpty()) {
            barChart.clear()
            return
        }

        val targetMoods = listOf(
            MoodOptions.HAPPY,
            MoodOptions.CALM,
            MoodOptions.ANXIOUS,
            MoodOptions.SAD,
            MoodOptions.TIRED,
            MoodOptions.ANGRY
        )

        val countsMap = entries.groupingBy { it.mood }.eachCount()
        val barEntries = mutableListOf<BarEntry>()
        val moodLabels = mutableListOf<String>()

        targetMoods.forEachIndexed { index, moodOption ->
            val count = countsMap[moodOption] ?: 0
            barEntries.add(BarEntry(index.toFloat(), count.toFloat()))
            moodLabels.add("${moodOption.emoji} ${moodOption.label}")
        }

        barChart.xAxis.valueFormatter = object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                val idx = value.toInt()
                return if (idx in moodLabels.indices) moodLabels[idx] else ""
            }
        }

        val primaryPurple = Color.parseColor("#7C3AED")
        val dataSet = BarDataSet(barEntries, "Mood Frequency").apply {
            color = primaryPurple
            valueTextColor = Color.WHITE
            valueTextSize = 11f
            setDrawValues(true)
            valueFormatter = object : ValueFormatter() {
                override fun getFormattedValue(value: Float): String {
                    return if (value > 0) value.toInt().toString() else ""
                }
            }
        }

        val barData = BarData(dataSet).apply {
            barWidth = 0.55f
        }

        barChart.data = barData
        barChart.animateY(700)
        barChart.invalidate()
    }
}
