package com.kintsugi.app.features.motivation.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.databinding.ItemSelfCareCardBinding

/**
 * Data model for a self-care suggestion item.
 */
data class SelfCareItem(
    val icon: String,
    val title: String,
    val description: String
)

/**
 * ListAdapter binding daily self-care suggestions.
 */
class SelfCareAdapter : ListAdapter<SelfCareItem, SelfCareAdapter.SelfCareViewHolder>(SelfCareDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SelfCareViewHolder {
        val binding = ItemSelfCareCardBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return SelfCareViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SelfCareViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class SelfCareViewHolder(
        private val binding: ItemSelfCareCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: SelfCareItem) {
            binding.tvSelfCareIcon.text = item.icon
            binding.tvSelfCareTitle.text = item.title
            binding.tvSelfCareDesc.text = item.description
        }
    }

    private class SelfCareDiffCallback : DiffUtil.ItemCallback<SelfCareItem>() {
        override fun areItemsTheSame(oldItem: SelfCareItem, newItem: SelfCareItem): Boolean = oldItem.title == newItem.title
        override fun areContentsTheSame(oldItem: SelfCareItem, newItem: SelfCareItem): Boolean = oldItem == newItem
    }
}
