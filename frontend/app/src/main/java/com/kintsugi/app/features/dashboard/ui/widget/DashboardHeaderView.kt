package com.kintsugi.app.features.dashboard.ui.widget

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.kintsugi.app.R
import com.kintsugi.app.databinding.ViewDashboardHeaderBinding

/**
 * Premium Dashboard Header View displaying user avatar with online badge, dynamic greeting,
 * user name, notification bell shortcut, settings gear shortcut, and flame streak badge pill.
 */
class DashboardHeaderView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewDashboardHeaderBinding.inflate(LayoutInflater.from(context), this, true)

    init {
        binding.btnNotification.setIcon(R.drawable.ic_notification_outline)
        binding.btnSettings.setIcon(R.drawable.ic_settings_outline)
    }

    var onSettingsClickListener: (() -> Unit)? = null
        set(value) {
            field = value
            binding.btnSettings.setOnClickListener { field?.invoke() }
        }

    var onNotificationClickListener: (() -> Unit)? = null
        set(value) {
            field = value
            binding.btnNotification.setOnClickListener { field?.invoke() }
        }

    fun setHeaderData(greeting: String, userName: String, streakDays: Int) {
        binding.tvGreetingLabel.text = greeting.uppercase()
        binding.tvUserName.text = userName
        binding.tvStreakBadge.text = "$streakDays Days Streak"
    }

    fun setNotificationBadge(count: Int) {
        binding.btnNotification.setBadgeCount(count)
    }
}
