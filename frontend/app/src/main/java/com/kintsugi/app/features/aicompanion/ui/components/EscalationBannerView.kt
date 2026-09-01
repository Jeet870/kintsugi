package com.kintsugi.app.features.aicompanion.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import com.kintsugi.app.databinding.ViewEscalationBannerBinding
import com.kintsugi.app.features.aicompanion.data.ChatEscalationPayload

class EscalationBannerView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewEscalationBannerBinding.inflate(LayoutInflater.from(context), this, true)

    var onTalkToSomeoneClick: (() -> Unit)? = null

    init {
        visibility = View.GONE
        binding.btnDismiss.setOnClickListener {
            dismissBanner()
        }
    }

    fun bind(payload: ChatEscalationPayload) {
        val number = payload.helplineNumber.ifBlank { "988" }
        binding.btnTalkToSomeone.text = "Talk to Someone ($number) 📞"
        binding.btnTalkToSomeone.setOnClickListener {
            onTalkToSomeoneClick?.invoke() ?: launchDialer(number)
        }

        alpha = 0f
        translationY = -30f
        scaleX = 0.97f
        scaleY = 0.97f
        visibility = View.VISIBLE

        animate()
            .alpha(1f)
            .translationY(0f)
            .scaleX(1f)
            .scaleY(1f)
            .setDuration(300)
            .start()
    }

    fun bindPayload(payload: ChatEscalationPayload) {
        bind(payload)
    }

    private fun dismissBanner() {
        animate()
            .alpha(0f)
            .scaleX(0.95f)
            .scaleY(0.95f)
            .setDuration(250)
            .withEndAction {
                visibility = View.GONE
            }
            .start()
    }

    private fun launchDialer(number: String) {
        try {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number"))
            context.startActivity(intent)
        } catch (e: Exception) {
            // Dialer fallback
        }
    }
}
