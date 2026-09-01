package com.kintsugi.app.core.ui.widget

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.kintsugi.app.R

class PremiumBottomSheet : BottomSheetDialogFragment()

class PremiumDialog(context: Context) : Dialog(context) {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        window?.setBackgroundDrawableResource(android.R.color.transparent)
    }

    fun setCustomContent(title: String, message: String, onConfirm: () -> Unit) {
        val glassCard = GlassCardView(context)
        val container = android.widget.LinearLayout(context).apply {
            orientation = android.widget.LinearLayout.VERTICAL
        }

        val titleTv = TextView(context).apply {
            text = title
            textSize = 18f
            setTextColor(ContextCompat.getColor(context, R.color.text_primary))
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }

        val messageTv = TextView(context).apply {
            text = message
            textSize = 14f
            setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
            setPadding(0, (8 * resources.displayMetrics.density).toInt(), 0, (16 * resources.displayMetrics.density).toInt())
        }

        val btn = PrimaryGradientButton(context).apply {
            text = "Confirm"
            setOnClickListener {
                onConfirm()
                dismiss()
            }
        }

        container.addView(titleTv)
        container.addView(messageTv)
        container.addView(btn)
        glassCard.addView(container)

        setContentView(glassCard, ViewGroup.LayoutParams((300 * context.resources.displayMetrics.density).toInt(), ViewGroup.LayoutParams.WRAP_CONTENT))
    }
}

object PremiumSnackbar {
    fun show(rootView: View, message: String) {
        val context = rootView.context
        val container = FrameLayout(context).apply {
            val glassCard = GlassCardView(context)
            val tv = TextView(context).apply {
                text = message
                setTextColor(ContextCompat.getColor(context, R.color.text_primary))
                textSize = 14f
            }
            glassCard.addView(tv)
            addView(glassCard, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT).apply {
                gravity = Gravity.BOTTOM
                setMargins(40, 0, 40, 100)
            })
        }
        (rootView as? ViewGroup)?.addView(container)
        rootView.postDelayed({ (rootView as? ViewGroup)?.removeView(container) }, 3000)
    }
}
