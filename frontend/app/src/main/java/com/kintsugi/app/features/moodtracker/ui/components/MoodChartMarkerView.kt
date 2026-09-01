package com.kintsugi.app.features.moodtracker.ui.components

import android.content.Context
import android.widget.TextView
import com.github.mikephil.charting.components.MarkerView
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.highlight.Highlight
import com.github.mikephil.charting.utils.MPPointF
import com.kintsugi.app.R
import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class MoodChartMarkerView(
    context: Context,
    private val entriesSupplier: () -> List<MoodEntryEntity>
) : MarkerView(context, R.layout.view_chart_marker) {

    private val tvEmoji: TextView = findViewById(R.id.tv_marker_emoji)
    private val tvLabel: TextView = findViewById(R.id.tv_marker_label)
    private val tvDate: TextView = findViewById(R.id.tv_marker_date)

    private val dateFormatter = DateTimeFormatter.ofPattern("MM/dd • h:mm a").withZone(ZoneId.systemDefault())

    override fun refreshContent(e: Entry?, highlight: Highlight?) {
        if (e == null) return
        val index = e.x.toInt()
        val entries = entriesSupplier()

        if (index in entries.indices) {
            val item = entries[index]
            val mood = MoodOptions.fromApiValue(item.moodType)

            tvEmoji.text = mood.emoji
            tvLabel.text = mood.label
            tvDate.text = dateFormatter.format(item.createdAt)
        }
        super.refreshContent(e, highlight)
    }

    override fun getOffset(): MPPointF {
        return MPPointF(-(width / 2f), -height.toFloat() - 15f)
    }
}
