package com.kintsugi.app.features.journal.ui

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.PopupWindow
import com.kintsugi.app.databinding.ItemJournalFilterOptionBinding
import com.kintsugi.app.databinding.PopupJournalFilterBinding

class JournalFilterPopup(
    private val context: Context,
    private val currentFilter: JournalFilter,
    private val onFilterSelected: (JournalFilter) -> Unit
) {

    private val popupWindow: PopupWindow
    private val binding: PopupJournalFilterBinding

    init {
        val inflater = LayoutInflater.from(context)
        binding = PopupJournalFilterBinding.inflate(inflater, null, false)

        popupWindow = PopupWindow(
            binding.root,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            true
        ).apply {
            setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            elevation = 24f
            isOutsideTouchable = true
            isFocusable = true
        }

        populateOptions(inflater)
    }

    private fun populateOptions(inflater: LayoutInflater) {
        binding.containerFilterOptions.removeAllViews()

        JournalFilter.entries.forEach { filter ->
            val optionBinding = ItemJournalFilterOptionBinding.inflate(
                inflater,
                binding.containerFilterOptions,
                false
            )

            optionBinding.tvFilterOptionLabel.text = filter.label

            if (filter == currentFilter) {
                optionBinding.tvFilterOptionLabel.setTextColor(Color.parseColor("#A855F7"))
                optionBinding.tvFilterOptionLabel.setTypeface(null, android.graphics.Typeface.BOLD)
                optionBinding.ivFilterSelectedCheck.visibility = View.VISIBLE
            } else {
                optionBinding.tvFilterOptionLabel.setTextColor(Color.parseColor("#FFFFFF"))
                optionBinding.tvFilterOptionLabel.setTypeface(null, android.graphics.Typeface.NORMAL)
                optionBinding.ivFilterSelectedCheck.visibility = View.GONE
            }

            optionBinding.root.setOnClickListener {
                onFilterSelected(filter)
                dismiss()
            }

            binding.containerFilterOptions.addView(optionBinding.root)
        }
    }

    fun show(anchor: View) {
        popupWindow.showAsDropDown(anchor, 0, 10)
    }

    fun dismiss() {
        if (popupWindow.isShowing) {
            popupWindow.dismiss()
        }
    }
}
