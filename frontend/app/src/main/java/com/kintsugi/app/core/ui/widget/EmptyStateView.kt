package com.kintsugi.app.core.ui.widget

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import com.kintsugi.app.databinding.ViewEmptyStateBinding
import com.kintsugi.app.databinding.ViewErrorStateBinding

class EmptyStateView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewEmptyStateBinding.inflate(LayoutInflater.from(context), this, true)

    fun setTitle(title: String) {
        binding.tvTitle.text = title
    }

    fun setDescription(description: String) {
        binding.tvDescription.text = description
    }

    fun setActionText(text: String) {
        binding.btnAction.text = text
    }

    fun showAction(visible: Boolean) {
        binding.btnAction.visibility = if (visible) View.VISIBLE else View.GONE
    }

    fun setOnActionClickListener(listener: OnClickListener) {
        binding.btnAction.setOnClickListener(listener)
    }

    fun bind(title: String, description: String, buttonText: String? = null, onAction: (() -> Unit)? = null) {
        binding.tvTitle.text = title
        binding.tvDescription.text = description
        if (buttonText != null) {
            binding.btnAction.text = buttonText
            binding.btnAction.visibility = View.VISIBLE
            if (onAction != null) {
                binding.btnAction.setOnClickListener { onAction() }
            }
        } else {
            binding.btnAction.visibility = View.GONE
        }
    }
}

class ErrorStateView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewErrorStateBinding.inflate(LayoutInflater.from(context), this, true)

    fun setTitle(title: String) {
        binding.tvTitle.text = title
    }

    fun setDescription(description: String) {
        binding.tvDescription.text = description
    }

    fun setRetryText(text: String) {
        binding.btnRetry.text = text
    }

    fun showRetry(visible: Boolean) {
        binding.btnRetry.visibility = if (visible) View.VISIBLE else View.GONE
    }

    fun setOnRetryClickListener(listener: OnClickListener) {
        binding.btnRetry.setOnClickListener(listener)
    }

    fun bind(errorMessage: String, onRetry: (() -> Unit)? = null) {
        binding.tvTitle.text = errorMessage
        if (onRetry != null) {
            binding.btnRetry.setOnClickListener { onRetry() }
            binding.btnRetry.visibility = View.VISIBLE
        } else {
            binding.btnRetry.visibility = View.GONE
        }
    }
}
