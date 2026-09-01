package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.kintsugi.app.R

/**
 * Single Reusable Global Toolbar Component for all Kintsugi screens.
 * Designed directly after the flagship Profile screen toolbar with 32sp SemiBold White title,
 * 16sp Medium Soft Lavender subtitle, WindowInsets handling, and 44dp ToolbarIconButton actions.
 */
open class KintsugiToolbar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    val btnLeft = ToolbarIconButton(context).apply {
        setIcon(R.drawable.ic_back_outline)
        visibility = GONE
    }

    val tvTitle = TextView(context).apply {
        textSize = 28f
        setTextColor(ContextCompat.getColor(context, R.color.text_primary))
        typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
        maxLines = 1
        ellipsize = android.text.TextUtils.TruncateAt.END
    }

    val tvSubtitle = TextView(context).apply {
        textSize = 14f
        setTextColor(ContextCompat.getColor(context, R.color.soft_lavender))
        typeface = Typeface.create("sans-serif", Typeface.NORMAL)
        visibility = GONE
    }

    val btnNotification = ToolbarIconButton(context).apply {
        setIcon(R.drawable.ic_notification_outline)
        visibility = GONE
    }

    val btnSettings = ToolbarIconButton(context).apply {
        setIcon(R.drawable.ic_settings_outline)
        visibility = GONE
    }

    private val actionsContainer = LinearLayout(context).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        val gap12 = (12 * resources.displayMetrics.density).toInt()

        addView(btnNotification, LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
            marginEnd = gap12
        })
        addView(btnSettings)
    }

    init {
        setBackgroundColor(ContextCompat.getColor(context, android.R.color.transparent))

        val titleContainer = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1f).apply {
                marginStart = (12 * resources.displayMetrics.density).toInt()
                marginEnd = (12 * resources.displayMetrics.density).toInt()
            }
            addView(tvTitle)
            addView(tvSubtitle)
        }

        val contentLayout = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            val padH = (20 * resources.displayMetrics.density).toInt()
            val padTop = (4 * resources.displayMetrics.density).toInt()
            val padBottom = (6 * resources.displayMetrics.density).toInt()
            setPadding(padH, padTop, padH, padBottom)
            minimumHeight = (60 * resources.displayMetrics.density).toInt()

            addView(btnLeft)
            addView(titleContainer)
            addView(actionsContainer)
        }

        addView(contentLayout, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))

        setupInsets()

        attrs?.let {
            val typedArray = context.obtainStyledAttributes(it, R.styleable.KintsugiToolbar)
            val titleStr = typedArray.getString(R.styleable.KintsugiToolbar_title)
            val subStr = typedArray.getString(R.styleable.KintsugiToolbar_subtitle)
            typedArray.recycle()

            if (!titleStr.isNullOrEmpty()) setTitle(titleStr)
            if (!subStr.isNullOrEmpty()) setSubtitle(subStr)
        }
    }

    private fun setupInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(this) { _, insets ->
            val statusBars = insets.getInsets(
                WindowInsetsCompat.Type.statusBars() or WindowInsetsCompat.Type.displayCutout()
            )
            setPadding(
                paddingLeft,
                statusBars.top,
                paddingRight,
                paddingBottom
            )
            insets
        }
    }

    fun setTitle(title: String) {
        tvTitle.text = title
    }

    fun setSubtitle(subtitle: String?) {
        if (!subtitle.isNullOrBlank()) {
            tvSubtitle.text = subtitle
            tvSubtitle.visibility = VISIBLE
        } else {
            tvSubtitle.visibility = GONE
        }
    }

    fun showHomeButton(onClick: () -> Unit) {
        btnLeft.setIcon(R.drawable.ic_home)
        btnLeft.setOnClickListener { onClick() }
        btnLeft.visibility = VISIBLE
    }

    fun showBackButton(onClick: () -> Unit) {
        btnLeft.setIcon(R.drawable.ic_back_outline)
        btnLeft.setOnClickListener { onClick() }
        btnLeft.visibility = VISIBLE
    }

    fun showNotificationButton(badgeCount: Int = 0, onClick: () -> Unit) {
        btnNotification.setBadgeCount(badgeCount)
        btnNotification.setOnClickListener { onClick() }
        btnNotification.visibility = VISIBLE
    }

    fun showSettingsButton(onClick: () -> Unit) {
        btnSettings.setOnClickListener { onClick() }
        btnSettings.visibility = VISIBLE
    }

    fun setNotificationBadge(count: Int) {
        btnNotification.setBadgeCount(count)
    }

    fun addActionIcon(@DrawableRes iconRes: Int, contentDesc: String, onClick: () -> Unit) {
        val actionBtn = ToolbarIconButton(context).apply {
            setIcon(iconRes)
            contentDescription = contentDesc
            setOnClickListener { onClick() }
        }
        val gap12 = (12 * resources.displayMetrics.density).toInt()
        actionsContainer.addView(actionBtn, 0, LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
            marginEnd = gap12
        })
    }

    fun addCustomActionView(view: View) {
        val gap12 = (12 * resources.displayMetrics.density).toInt()
        actionsContainer.addView(view, 0, LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT).apply {
            marginEnd = gap12
        })
    }

    fun setOnNavigationClickListener(listener: OnClickListener) {
        showBackButton { listener.onClick(this) }
    }
}
