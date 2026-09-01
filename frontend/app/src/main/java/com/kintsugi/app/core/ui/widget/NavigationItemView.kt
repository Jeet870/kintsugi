package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.kintsugi.app.R
import com.kintsugi.app.databinding.BottomNavigationItemBinding

/**
 * Custom navigation item view managing VectorDrawable outline/filled morphing,
 * typography states (14sp SemiBold vs 12sp Medium), and selection animations.
 */
class NavigationItemView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding: BottomNavigationItemBinding =
        BottomNavigationItemBinding.inflate(LayoutInflater.from(context), this)

    private var navItem: NavigationItem? = null
    var isTabSelected: Boolean = false
        private set

    init {
        foreground = ContextCompat.getDrawable(context, R.drawable.navigation_item_background)
        isClickable = true
        isFocusable = true
    }

    fun setNavigationItem(item: NavigationItem) {
        this.navItem = item
        binding.tvNavLabel.text = item.title
        contentDescription = item.title
        setSelectedState(isTabSelected, animate = false)
    }

    fun setSelectedState(selected: Boolean, animate: Boolean = true) {
        this.isTabSelected = selected
        val item = navItem ?: return

        val iconRes = if (selected) item.filledIconRes else item.outlineIconRes
        binding.ivNavIcon.setImageResource(iconRes)

        if (selected) {
            binding.ivNavIcon.setColorFilter(ContextCompat.getColor(context, R.color.royal_purple))
            binding.tvNavLabel.setTextColor(ContextCompat.getColor(context, R.color.royal_purple))
            binding.tvNavLabel.textSize = 14f
            binding.tvNavLabel.typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
            if (animate) {
                NavigationAnimator.animateTabSelected(binding.ivNavIcon)
            }
        } else {
            binding.ivNavIcon.setColorFilter(ContextCompat.getColor(context, R.color.text_muted))
            binding.tvNavLabel.setTextColor(ContextCompat.getColor(context, R.color.text_muted))
            binding.tvNavLabel.textSize = 12f
            binding.tvNavLabel.typeface = Typeface.create("sans-serif", Typeface.NORMAL)
            if (animate) {
                NavigationAnimator.animateTabUnselected(binding.ivNavIcon)
            }
        }
    }
}
