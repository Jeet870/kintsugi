package com.kintsugi.app.features.aicompanion.ui.components

import android.content.Context
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.Gravity
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import com.kintsugi.app.R

class SuggestedPromptsView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    var onPromptClickListener: ((String) -> Unit)? = null

    private val prompts = listOf(
        "I feel overwhelmed",
        "Help me relax",
        "I can't sleep",
        "I need motivation"
    )

    init {
        orientation = VERTICAL
        gravity = Gravity.CENTER_HORIZONTAL
        setupPrompts()
    }

    private fun setupPrompts() {
        removeAllViews()

        val density = resources.displayMetrics.density

        // 1. Animated Breathing AI Orb Header
        val orbView = AiOrbView(context).apply {
            val size = (56 * density).toInt()
            layoutParams = LayoutParams(size, size).apply {
                bottomMargin = (16 * density).toInt()
            }
        }
        addView(orbView)

        // 2. Title
        val titleTv = TextView(context).apply {
            text = "How are you feeling today?"
            textSize = 20f
            setTextColor(ContextCompat.getColor(context, R.color.text_primary))
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
        }
        addView(titleTv)

        // 3. Subtitle
        val subTv = TextView(context).apply {
            text = "I'm here to listen without judgment."
            textSize = 14f
            setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
            gravity = Gravity.CENTER
            val padBottom = (24 * density).toInt()
            setPadding(0, (4 * density).toInt(), 0, padBottom)
        }
        addView(subTv)

        // 4. 2-Column Grid of Cards
        val grid = GridLayout(context).apply {
            columnCount = 2
            rowCount = 2
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
        }

        prompts.forEach { promptText ->
            val card = MaterialCardView(context).apply {
                val cardHeight = (110 * density).toInt()
                val margin = (6 * density).toInt()
                layoutParams = GridLayout.LayoutParams().apply {
                    width = 0
                    height = cardHeight
                    columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                    setMargins(margin, margin, margin, margin)
                }
                setCardBackgroundColor(ContextCompat.getColor(context, R.color.card_surface))
                radius = 18 * density
                strokeColor = ContextCompat.getColor(context, R.color.glass_card_border)
                strokeWidth = (1 * density).toInt()
                cardElevation = 0f
                isClickable = true
                isFocusable = true

                val container = LinearLayout(context).apply {
                    orientation = VERTICAL
                    gravity = Gravity.CENTER
                    val pad = (12 * density).toInt()
                    setPadding(pad, pad, pad, pad)

                    val textTv = TextView(context).apply {
                        text = promptText
                        textSize = 13f
                        setTextColor(ContextCompat.getColor(context, R.color.text_primary))
                        typeface = Typeface.DEFAULT_BOLD
                        gravity = Gravity.CENTER
                    }
                    addView(textTv)
                }
                addView(container)

                setOnClickListener {
                    animate().scaleX(1.03f).scaleY(1.03f).setDuration(100).withEndAction {
                        animate().scaleX(1.0f).scaleY(1.0f).setDuration(100).start()
                        onPromptClickListener?.invoke(promptText)
                    }.start()
                }
            }
            grid.addView(card)
        }

        addView(grid)
    }
}
