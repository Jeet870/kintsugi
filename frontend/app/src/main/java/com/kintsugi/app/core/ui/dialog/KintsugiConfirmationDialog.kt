package com.kintsugi.app.core.ui.dialog

import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import androidx.annotation.DrawableRes
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentManager
import com.kintsugi.app.R
import com.kintsugi.app.databinding.DialogKintsugiConfirmationBinding

/**
 * Reusable Kintsugi-themed custom confirmation dialog fragment replacing all default Material AlertDialogs.
 * Displays 28dp glass card (#1A1232), custom icon, title, subtitle, and violet action buttons.
 */
class KintsugiConfirmationDialog : DialogFragment() {

    private var _binding: DialogKintsugiConfirmationBinding? = null
    private val binding get() = _binding!!

    private var titleText: String = "Confirm Action"
    private var subtitleText: String = "Are you sure you want to proceed?"
    private var confirmText: String = "Confirm"
    private var cancelText: String = "Cancel"
    @DrawableRes private var iconResId: Int = R.drawable.ic_drag_handle
    private var onConfirmListener: (() -> Unit)? = null
    private var onCancelListener: (() -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        dialog?.window?.apply {
            requestFeature(Window.FEATURE_NO_TITLE)
            setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            setWindowAnimations(android.R.style.Animation_Dialog)
        }
        _binding = DialogKintsugiConfirmationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onStart() {
        super.onStart()
        dialog?.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.88).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvDialogTitle.text = titleText
        binding.tvDialogSubtitle.text = subtitleText
        binding.btnDialogConfirm.text = confirmText
        binding.ivDialogIcon.setImageResource(iconResId)

        if (cancelText.isEmpty()) {
            binding.btnDialogCancel.visibility = View.GONE
        } else {
            binding.btnDialogCancel.visibility = View.VISIBLE
            binding.btnDialogCancel.text = cancelText
        }

        binding.btnDialogCancel.setOnClickListener {
            onCancelListener?.invoke()
            dismissAllowingStateLoss()
        }

        binding.btnDialogConfirm.setOnClickListener {
            onConfirmListener?.invoke()
            dismissAllowingStateLoss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun show(
            fragmentManager: FragmentManager,
            title: String,
            subtitle: String,
            confirmButtonText: String = "Confirm",
            cancelButtonText: String = "Cancel",
            @DrawableRes iconRes: Int = R.drawable.ic_drag_handle,
            onConfirm: () -> Unit,
            onCancel: (() -> Unit)? = null,
            tag: String = "kintsugi_confirmation_dialog"
        ) {
            val dialog = KintsugiConfirmationDialog().apply {
                titleText = title
                subtitleText = subtitle
                confirmText = confirmButtonText
                cancelText = cancelButtonText
                iconResId = iconRes
                onConfirmListener = onConfirm
                onCancelListener = onCancel
            }
            dialog.show(fragmentManager, tag)
        }
    }
}
