package com.kintsugi.app.features.moodtracker.ui.components

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.ValueFormatter
import com.kintsugi.app.R
import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.databinding.ViewMoodChartBinding
import com.kintsugi.app.features.moodtracker.ui.model.MoodTrendPoint

/**
 * Responsive cubic bezier LineChart displaying aggregated mood trend points
 * with custom purple design system (No gold).
 */
class MoodHistoryChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewMoodChartBinding.inflate(LayoutInflater.from(context), this, true)
    private val lineChart: LineChart get() = binding.lineChart

    init {
        setupChartStyling()
    }

    private fun setupChartStyling() {
        lineChart.apply {
            description.isEnabled = false
            legend.isEnabled = false
            setTouchEnabled(true)
            isDragEnabled = true
            setScaleEnabled(false)
            setPinchZoom(false)
            setBackgroundColor(Color.TRANSPARENT)
            setDrawGridBackground(false)
            setViewPortOffsets(70f, 30f, 30f, 60f)

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
                textSize = 12f
                axisMinimum = 0.5f
                axisMaximum = 6.5f
                granularity = 1f
                valueFormatter = object : ValueFormatter() {
                    override fun getFormattedValue(value: Float): String {
                        return MoodOptions.fromChartValue(value.toInt()).emoji
                    }
                }
            }

            axisRight.isEnabled = false
        }
    }

    fun submitTrendPoints(points: List<MoodTrendPoint>) {
        if (points.isEmpty()) {
            lineChart.clear()
            return
        }

        val entries = mutableListOf<Entry>()
        val labels = mutableListOf<String>()

        points.forEachIndexed { index, point ->
            entries.add(Entry(index.toFloat(), point.averageScore))
            labels.add(point.xLabel)
        }

        lineChart.xAxis.valueFormatter = object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                val idx = value.toInt()
                return if (idx in labels.indices) labels[idx] else ""
            }
        }

        val primaryPurple = Color.parseColor("#7C3AED")
        val accentLavender = Color.parseColor("#C4B5FD")

        val dataSet = LineDataSet(entries, "Mood Trend").apply {
            mode = LineDataSet.Mode.CUBIC_BEZIER
            cubicIntensity = 0.22f
            color = primaryPurple
            lineWidth = 3.0f
            setCircleColor(accentLavender)
            circleRadius = 5f
            circleHoleRadius = 2.5f
            circleHoleColor = Color.WHITE
            setDrawCircles(true)
            setDrawValues(false)
            highLightColor = primaryPurple

            setDrawFilled(true)
            val fillGradient = GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                intArrayOf(
                    Color.parseColor("#507C3AED"),
                    Color.parseColor("#007C3AED")
                )
            )
            fillDrawable = fillGradient
        }

        lineChart.data = LineData(dataSet)
        lineChart.animateX(400)
        lineChart.invalidate()
    }
}
