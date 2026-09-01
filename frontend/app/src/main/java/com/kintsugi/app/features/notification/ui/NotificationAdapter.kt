package com.kintsugi.app.features.notification.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.core.model.NotificationDto
import com.kintsugi.app.databinding.ItemNotificationBinding

/**
 * ListAdapter rendering Notification Center items with unread indicators and section headers.
 */
class NotificationAdapter(
    private val onItemClick: (NotificationDto) -> Unit
) : ListAdapter<NotificationDto, NotificationAdapter.ViewHolder>(DiffCallback) {

    class ViewHolder(val binding: ItemNotificationBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemNotificationBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = getItem(position)
        holder.binding.apply {
            tvNotificationTitle.text = item.title
            tvNotificationDesc.text = item.description
            tvNotificationTime.text = item.timeAgo
            ivNotificationIcon.setImageResource(item.iconResId)

            if (item.isRead) {
                viewUnreadDot.visibility = View.GONE
                root.alpha = 0.65f
            } else {
                viewUnreadDot.visibility = View.VISIBLE
                root.alpha = 1.0f
            }

            root.setOnClickListener {
                onItemClick(item)
            }
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<NotificationDto>() {
            override fun areItemsTheSame(oldItem: NotificationDto, newItem: NotificationDto): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: NotificationDto, newItem: NotificationDto): Boolean {
                return oldItem == newItem
            }
        }
    }
}
