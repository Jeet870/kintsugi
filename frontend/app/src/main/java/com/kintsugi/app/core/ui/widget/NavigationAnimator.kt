package com.kintsugi.app.core.ui.widget

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.view.View
import androidx.interpolator.view.animation.FastOutSlowInInterpolator

/**
 * Utility executing smooth 60 FPS framework scale animations for tab selection.
 */
object NavigationAnimator {

    fun animateTabSelected(view: View) {
        val scaleX = ObjectAnimator.ofFloat(view, View.SCALE_X, 1.0f, 1.12f)
        val scaleY = ObjectAnimator.ofFloat(view, View.SCALE_Y, 1.0f, 1.12f)

        AnimatorSet().apply {
            playTogether(scaleX, scaleY)
            duration = 180
            interpolator = FastOutSlowInInterpolator()
            start()
        }
    }

    fun animateTabUnselected(view: View) {
        val scaleX = ObjectAnimator.ofFloat(view, View.SCALE_X, 1.0f)
        val scaleY = ObjectAnimator.ofFloat(view, View.SCALE_Y, 1.0f)

        AnimatorSet().apply {
            playTogether(scaleX, scaleY)
            duration = 180
            interpolator = FastOutSlowInInterpolator()
            start()
        }
    }
}
