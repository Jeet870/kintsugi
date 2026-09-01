package com.kintsugi.app.features.emergency.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.core.model.HelplineDto
import com.kintsugi.app.databinding.ItemHelplineBinding

/**
 * ListAdapter displaying emergency helpline contacts.
 *
 * @param onCallClick Callback triggered when user taps the Call action button or phone number.
 */
class HelplineAdapter(
    private val onCallClick: (HelplineDto) -> Unit
) : ListAdapter<HelplineDto, HelplineAdapter.HelplineViewHolder>(HelplineDiffCallback()) {

    init {
        setHasStableIds(true)
    }

    override fun getItemId(position: Int): Long {
        return getItem(position).name.hashCode().toLong()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HelplineViewHolder {
        val binding = ItemHelplineBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return HelplineViewHolder(binding, onCallClick)
    }

    override fun onBindViewHolder(holder: HelplineViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class HelplineViewHolder(
        private val binding: ItemHelplineBinding,
        private val onCallClick: (HelplineDto) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: HelplineDto) {
            binding.tvHelplineName.text = item.name
            binding.tvHelplineHours.text = item.hours
            binding.tvHelplinePhone.text = "Call or Text ${item.phoneNumber}"

            binding.btnCallHelpline.setOnClickListener {
                onCallClick(item)
            }

            binding.tvHelplinePhone.setOnClickListener {
                onCallClick(item)
            }

            binding.root.setOnClickListener {
                onCallClick(item)
            }
        }
    }

    private class HelplineDiffCallback : DiffUtil.ItemCallback<HelplineDto>() {
        override fun areItemsTheSame(oldItem: HelplineDto, newItem: HelplineDto): Boolean =
            oldItem.name == newItem.name

        override fun areContentsTheSame(oldItem: HelplineDto, newItem: HelplineDto): Boolean =
            oldItem == newItem
    }
}
