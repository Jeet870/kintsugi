package com.kintsugi.app.features.moodtracker.ui.components

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.view.ViewGroup
import android.widget.FrameLayout
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.components.Legend
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import com.github.mikephil.charting.formatter.PercentFormatter
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.database.entity.mood

/**
 * Animated Donut PieChart displaying percentage emotional distribution across logged moods.
 */
class MoodDistributionDonutChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val pieChart = PieChart(context).apply {
        layoutParams = LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    }

    init {
        addView(pieChart)
        setupChartStyling()
    }

    private fun setupChartStyling() {
        pieChart.apply {
            description.isEnabled = false
            setUsePercentValues(true)
            isDrawHoleEnabled = true
            setHoleColor(Color.TRANSPARENT)
            setTransparentCircleColor(Color.TRANSPARENT)
            holeRadius = 58f
            transparentCircleRadius = 62f
            setDrawCenterText(true)
            centerText = "Emotional\nDistribution"
            setCenterTextColor(Color.WHITE)
            setCenterTextSize(12f)
            setEntryLabelColor(Color.WHITE)
            setEntryLabelTextSize(10f)

            legend.apply {
                isEnabled = true
                verticalAlignment = Legend.LegendVerticalAlignment.BOTTOM
                horizontalAlignment = Legend.LegendHorizontalAlignment.CENTER
                orientation = Legend.LegendOrientation.HORIZONTAL
                setDrawInside(false)
                textColor = Color.parseColor("#C4B5FD")
                textSize = 10f
                xEntrySpace = 12f
            }
        }
    }

    fun submitEntries(entries: List<MoodEntryEntity>) {
        if (entries.isEmpty()) {
            pieChart.clear()
            return
        }

        val total = entries.size.toFloat()
        val countsMap = entries.groupingBy { it.mood }.eachCount()

        val pieEntries = countsMap.map { (mood, count) ->
            PieEntry(count / total, "${mood.emoji} ${mood.label}")
        }

        val colors = listOf(
            Color.parseColor("#7C3AED"),
            Color.parseColor("#9F67FF"),
            Color.parseColor("#C4B5FD"),
            Color.parseColor("#A855F7"),
            Color.parseColor("#818CF8"),
            Color.parseColor("#2DD4BF")
        )

        val dataSet = PieDataSet(pieEntries, "").apply {
            sliceSpace = 3f
            selectionShift = 5f
            setColors(colors)
            valueTextColor = Color.WHITE
            valueTextSize = 10f
            valueFormatter = PercentFormatter(pieChart)
        }

        val pieData = PieData(dataSet)
        pieChart.data = pieData
        pieChart.animateY(800)
        pieChart.invalidate()
    }
}
