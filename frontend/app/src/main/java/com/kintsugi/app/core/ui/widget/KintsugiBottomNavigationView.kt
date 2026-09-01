package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.util.AttributeSet
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.core.content.ContextCompat
import com.kintsugi.app.R

/**
 * Flagship Kintsugi Custom Floating Glass Bottom Navigation System.
 * Height 72dp, 16dp corner radius, #141418 surface, padding (16dp horizontal, 8dp top, 10dp bottom),
 * custom filled/outlined vector XML icon state morphing, and smooth 180ms tab switching.
 */
class KintsugiBottomNavigationView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private var selectedIndex = 0
    private var onTabSelectedListener: ((Int) -> Unit)? = null

    private val primaryTabs = listOf(
        NavigationItem(R.id.nav_dashboard, "Home", R.drawable.ic_home_outline, R.drawable.ic_home_filled),
        NavigationItem(R.id.nav_mood, "Mood", R.drawable.ic_mood_outline, R.drawable.ic_mood_filled),
        NavigationItem(R.id.nav_companion, "AI", R.drawable.ic_ai_outline, R.drawable.ic_ai_filled),
        NavigationItem(R.id.nav_journal, "Journal", R.drawable.ic_journal_outline, R.drawable.ic_journal_filled),
        NavigationItem(R.id.nav_profile, "Profile", R.drawable.ic_profile_outline, R.drawable.ic_profile_filled)
    )

    private val itemViews = mutableListOf<NavigationItemView>()

    private val navContainer = LinearLayout(context).apply {
        orientation = LinearLayout.HORIZONTAL
        weightSum = 5f
        gravity = Gravity.CENTER_VERTICAL
    }

    init {
        background = ContextCompat.getDrawable(context, R.drawable.bottom_navigation_background)
        elevation = 8f * resources.displayMetrics.density

        val padH = (16 * resources.displayMetrics.density).toInt()
        val padTop = (8 * resources.displayMetrics.density).toInt()
        val padBottom = (10 * resources.displayMetrics.density).toInt()
        setPadding(padH, padTop, padH, padBottom)

        primaryTabs.forEachIndexed { index, item ->
            val itemView = NavigationItemView(context).apply {
                setNavigationItem(item)
                setOnClickListener {
                    if (selectedIndex != index) {
                        selectTabByIndex(index, animate = true)
                        onTabSelectedListener?.invoke(item.destinationId)
                    }
                }
            }

            itemViews.add(itemView)
            val lp = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            navContainer.addView(itemView, lp)
        }

        addView(navContainer, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
        selectTabByIndex(0, animate = false)
    }

    fun setOnTabSelectedListener(listener: (Int) -> Unit) {
        this.onTabSelectedListener = listener
    }

    fun setSelectedTab(destinationId: Int) {
        val index = primaryTabs.indexOfFirst { it.destinationId == destinationId }
        if (index >= 0 && index != selectedIndex) {
            selectTabByIndex(index, animate = true)
        }
    }

    private fun selectTabByIndex(index: Int, animate: Boolean) {
        selectedIndex = index
        itemViews.forEachIndexed { i, view ->
            view.setSelectedState(i == index, animate = animate && (i == index))
        }
    }
}
