package com.kintsugi.app.features.profile.ui

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.view.Gravity
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.google.android.material.card.MaterialCardView
import com.kintsugi.app.core.database.entity.Mood
import com.kintsugi.app.features.moodtracker.ui.model.AnalyticsPeriod

/**
 * Custom Analytics View for Mood Frequency Distribution.
 * Renders tailored mood bars in Kintsugi violet aesthetics, TODAY/7D/30D/90D selector chips,
 * and smooth animated bar growth.
 */
class MoodStatsChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private var currentStats: Map<Mood, Int> = emptyMap()
    private var onPeriodChangedListener: ((AnalyticsPeriod) -> Unit)? = null
    private var selectedPeriod: AnalyticsPeriod = AnalyticsPeriod.THIRTY_DAYS

    private val containerCard: MaterialCardView
    private val barsContainer: LinearLayout
    private val emptyStateView: TextView
    private val chipToday: TextView
    private val chip7: TextView
    private val chip30: TextView
    private val chip90: TextView

    init {
        containerCard = MaterialCardView(context).apply {
            radius = 20.toPx()
            setCardBackgroundColor(Color.parseColor("#1A1232"))
            strokeColor = Color.parseColor("#2E224D")
            strokeWidth = (1f * resources.displayMetrics.density).toInt()
            cardElevation = 4.toPx()
        }

        val rootLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(20.toPx().toInt(), 20.toPx().toInt(), 20.toPx().toInt(), 20.toPx().toInt())
        }

        // Header Layout
        val headerLayout = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        val titleLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        val tvTitle = TextView(context).apply {
            text = "MOOD INSIGHTS"
            textSize = 11f
            setTextColor(Color.parseColor("#A855F7"))
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            letterSpacing = 0.08f
        }

        val tvSubtitle = TextView(context).apply {
            text = "Your emotional patterns"
            textSize = 13f
            setTextColor(Color.parseColor("#C9B8FF"))
        }

        titleLayout.addView(tvTitle)
        titleLayout.addView(tvSubtitle)
        headerLayout.addView(titleLayout)

        // Segmented Period Selector Container
        val chipContainer = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            background = ContextCompatDrawable(context, "#21173D")
            setPadding(3.toPx().toInt(), 3.toPx().toInt(), 3.toPx().toInt(), 3.toPx().toInt())
        }

        chipToday = createChip("TODAY", AnalyticsPeriod.TODAY)
        chip7 = createChip("7D", AnalyticsPeriod.SEVEN_DAYS)
        chip30 = createChip("30D", AnalyticsPeriod.THIRTY_DAYS)
        chip90 = createChip("90D", AnalyticsPeriod.NINETY_DAYS)

        // Only display 30D / 90D summary on Profile overview
        chipContainer.addView(chip30)
        chipContainer.addView(chip90)
        headerLayout.addView(chipContainer)

        rootLayout.addView(headerLayout)

        // Empty State View
        emptyStateView = TextView(context).apply {
            text = "No mood data yet for this period.\nLog your feelings to reveal insights."
            textSize = 13f
            gravity = Gravity.CENTER
            setTextColor(Color.parseColor("#8B88A0"))
            setPadding(0, 24.toPx().toInt(), 0, 16.toPx().toInt())
            visibility = View.GONE
        }
        rootLayout.addView(emptyStateView)

        // Bars Container
        barsContainer = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = 16.toPx().toInt()
            }
        }
        rootLayout.addView(barsContainer)

        containerCard.addView(rootLayout)
        addView(containerCard)

        updateChipSelections()
    }

    fun setOnPeriodChangedListener(listener: (AnalyticsPeriod) -> Unit) {
        onPeriodChangedListener = listener
    }

    fun submitStats(stats: Map<Mood, Int>) {
        currentStats = stats
        renderBars()
    }

    private fun createChip(label: String, period: AnalyticsPeriod): TextView {
        return TextView(context).apply {
            text = label
            textSize = 10f
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(10.toPx().toInt(), 6.toPx().toInt(), 10.toPx().toInt(), 6.toPx().toInt())
            setOnClickListener {
                selectedPeriod = period
                updateChipSelections()
                onPeriodChangedListener?.invoke(period)
            }
        }
    }

    private fun updateChipSelections() {
        val chips = listOf(
            chipToday to AnalyticsPeriod.TODAY,
            chip7 to AnalyticsPeriod.SEVEN_DAYS,
            chip30 to AnalyticsPeriod.THIRTY_DAYS,
            chip90 to AnalyticsPeriod.NINETY_DAYS
        )

        chips.forEach { (view, period) ->
            if (period == selectedPeriod) {
                view.setTextColor(Color.WHITE)
                view.background = ContextCompatDrawable(context, "#A855F7")
            } else {
                view.setTextColor(Color.parseColor("#8B88A0"))
                view.background = null
            }
        }
    }

    private fun renderBars() {
        barsContainer.removeAllViews()

        if (currentStats.isEmpty()) {
            emptyStateView.visibility = View.VISIBLE
            barsContainer.visibility = View.GONE
            return
        }

        emptyStateView.visibility = View.GONE
        barsContainer.visibility = View.VISIBLE

        val maxCount = (currentStats.values.maxOrNull() ?: 1).coerceAtLeast(1)

        currentStats.forEach { (mood, count) ->
            val barRow = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = 12.toPx().toInt()
                }
            }

            val tvLabel = TextView(context).apply {
                text = "${mood.emoji} ${mood.name.lowercase().replaceFirstChar { it.uppercase() }}"
                textSize = 13f
                setTextColor(Color.WHITE)
                layoutParams = LinearLayout.LayoutParams(100.toPx().toInt(), LinearLayout.LayoutParams.WRAP_CONTENT)
            }

            val barFrame = FrameLayout(context).apply {
                layoutParams = LinearLayout.LayoutParams(0, 14.toPx().toInt(), 1f).apply {
                    marginStart = 8.toPx().toInt()
                    marginEnd = 12.toPx().toInt()
                }
                background = ContextCompatDrawable(context, "#21173D")
            }

            val barFill = View(context).apply {
                background = ContextCompatDrawable(context, getMoodColorHex(mood))
                layoutParams = FrameLayout.LayoutParams(0, FrameLayout.LayoutParams.MATCH_PARENT)
            }
            barFrame.addView(barFill)

            val tvValue = TextView(context).apply {
                text = count.toString()
                textSize = 13f
                setTextColor(Color.parseColor("#A855F7"))
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            barRow.addView(tvLabel)
            barRow.addView(barFrame)
            barRow.addView(tvValue)
            barsContainer.addView(barRow)

            // Animate bar width growth
            barFrame.post {
                val targetWidth = (barFrame.width * (count.toFloat() / maxCount)).toInt()
                val animator = ValueAnimator.ofInt(0, targetWidth).apply {
                    duration = 600
                    interpolator = DecelerateInterpolator()
                    addUpdateListener { anim ->
                        val lp = barFill.layoutParams
                        lp.width = anim.animatedValue as Int
                        barFill.layoutParams = lp
                    }
                }
                animator.start()
            }
        }
    }

    private fun getMoodColorHex(mood: Mood): String {
        return when (mood) {
            Mood.CALM -> "#34D399"
            Mood.HAPPY -> "#FACC15"
            Mood.SAD -> "#60A5FA"
            Mood.ANXIOUS -> "#C084FC"
            Mood.ANGRY -> "#F87171"
            Mood.TIRED -> "#9CA3AF"
        }
    }

    private fun ContextCompatDrawable(context: Context, hexColor: String): android.graphics.drawable.GradientDrawable {
        return android.graphics.drawable.GradientDrawable().apply {
            shape = android.graphics.drawable.GradientDrawable.RECTANGLE
            cornerRadius = 8.toPx()
            setColor(Color.parseColor(hexColor))
        }
    }

    private fun Float.toPx(): Float = this * resources.displayMetrics.density
    private fun Int.toPx(): Float = this * resources.displayMetrics.density
}
