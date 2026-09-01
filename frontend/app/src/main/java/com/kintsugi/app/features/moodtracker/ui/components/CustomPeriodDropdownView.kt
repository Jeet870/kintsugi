package com.kintsugi.app.features.moodtracker.ui.components

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.Gravity
import android.view.LayoutInflater
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.TextView
import com.kintsugi.app.databinding.ViewCustomDropdownBinding
import com.kintsugi.app.features.moodtracker.ui.model.AnalyticsPeriod

/**
 * Custom 18dp rounded glass dropdown selector matching the purple design system.
 */
class CustomPeriodDropdownView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewCustomDropdownBinding.inflate(LayoutInflater.from(context), this, true)

    var selectedPeriod: AnalyticsPeriod = AnalyticsPeriod.SEVEN_DAYS
        private set

    var onPeriodSelected: ((AnalyticsPeriod) -> Unit)? = null

    init {
        updateLabelText()
        setOnClickListener {
            showCustomPopup()
        }
    }

    fun setSelectedPeriod(period: AnalyticsPeriod) {
        this.selectedPeriod = period
        updateLabelText()
    }

    private fun updateLabelText() {
        binding.tvDropdownLabel.text = "📅 ${selectedPeriod.label}"
    }

    private fun showCustomPopup() {
        binding.ivChevron.animate().rotation(180f).setDuration(200).start()

        val popupView = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            val popupBg = GradientDrawable().apply {
                setColor(Color.parseColor("#1A1330"))
                cornerRadius = 18f * resources.displayMetrics.density
                setStroke((1 * resources.displayMetrics.density).toInt(), Color.parseColor("#33FFFFFF"))
            }
            background = popupBg
            setPadding((8 * resources.displayMetrics.density).toInt(), (8 * resources.displayMetrics.density).toInt(), (8 * resources.displayMetrics.density).toInt(), (8 * resources.displayMetrics.density).toInt())
        }

        val popupWindow = PopupWindow(
            popupView,
            (160 * resources.displayMetrics.density).toInt(),
            LayoutParams.WRAP_CONTENT,
            true
        ).apply {
            elevation = 16f * resources.displayMetrics.density
            setOnDismissListener {
                binding.ivChevron.animate().rotation(0f).setDuration(200).start()
            }
        }

        AnalyticsPeriod.entries.forEach { period ->
            val row = TextView(context).apply {
                text = period.label
                textSize = 13f
                setPadding(
                    (14 * resources.displayMetrics.density).toInt(),
                    (10 * resources.displayMetrics.density).toInt(),
                    (14 * resources.displayMetrics.density).toInt(),
                    (10 * resources.displayMetrics.density).toInt()
                )
                if (period == selectedPeriod) {
                    setTextColor(Color.parseColor("#C4B5FD"))
                    setBackgroundColor(Color.parseColor("#267C3AED"))
                } else {
                    setTextColor(Color.WHITE)
                }
                setOnClickListener {
                    setSelectedPeriod(period)
                    onPeriodSelected?.invoke(period)
                    popupWindow.dismiss()
                }
            }
            popupView.addView(row)
        }

        popupWindow.showAsDropDown(this, 0, (6 * resources.displayMetrics.density).toInt(), Gravity.END)
    }
}
