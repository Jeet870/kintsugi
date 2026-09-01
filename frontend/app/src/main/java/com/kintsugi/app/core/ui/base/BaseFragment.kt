package com.kintsugi.app.core.ui.base

import android.os.Bundle
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.fragment.app.Fragment

/**
 * Reusable Base Fragment establishing standardized Edge-to-Edge window handling,
 * WindowInsets consumption, and common UI motion helpers across all Kintsugi screens.
 */
abstract class BaseFragment : Fragment() {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.window?.let { window ->
            WindowCompat.setDecorFitsSystemWindows(window, false)
        }
    }

    /**
     * Reusable helper function for applying system insets to a target view container.
     */
    protected fun applySystemInsets(
        targetView: View,
        applyTop: Boolean = true,
        applyBottom: Boolean = true,
        additionalBottomMarginDp: Int = 0
    ) {
        val density = resources.displayMetrics.density
        val baseMargin = (additionalBottomMarginDp * density).toInt()

        ViewCompat.setOnApplyWindowInsetsListener(targetView) { v, insets ->
            val statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars() or WindowInsetsCompat.Type.displayCutout())
            val navBarInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())

            val topPadding = if (applyTop) statusBarInsets.top else v.paddingTop
            val bottomMargin = if (applyBottom) {
                if (imeInsets.bottom > 0) {
                    imeInsets.bottom + (8 * density).toInt()
                } else {
                    navBarInsets.bottom + baseMargin
                }
            } else 0

            if (applyBottom && v.layoutParams is android.view.ViewGroup.MarginLayoutParams) {
                val lp = v.layoutParams as android.view.ViewGroup.MarginLayoutParams
                lp.bottomMargin = bottomMargin
                v.layoutParams = lp
            }

            if (applyTop) {
                v.setPadding(v.paddingLeft, topPadding, v.paddingRight, v.paddingBottom)
            }

            insets
        }
    }
}
