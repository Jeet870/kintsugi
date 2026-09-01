package com.kintsugi.app.features.aicompanion.ui.adapter

import android.text.format.DateUtils
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.core.model.ChatSessionDto
import com.kintsugi.app.databinding.ItemChatSessionCardBinding
import com.kintsugi.app.databinding.ItemSessionHeaderBinding

sealed class SessionListItem {
    data class HeaderItem(val title: String) : SessionListItem()
    data class SessionCardItem(val session: ChatSessionDto) : SessionListItem()
}

class ChatSessionsAdapter(
    private val onSessionClick: (ChatSessionDto) -> Unit,
    private val onSessionLongClick: (ChatSessionDto) -> Unit
) : ListAdapter<SessionListItem, RecyclerView.ViewHolder>(DiffCallback) {

    companion object {
        private const val TYPE_HEADER = 0
        private const val TYPE_CARD = 1

        private object DiffCallback : DiffUtil.ItemCallback<SessionListItem>() {
            override fun areItemsTheSame(oldItem: SessionListItem, newItem: SessionListItem): Boolean {
                return when {
                    oldItem is SessionListItem.HeaderItem && newItem is SessionListItem.HeaderItem ->
                        oldItem.title == newItem.title
                    oldItem is SessionListItem.SessionCardItem && newItem is SessionListItem.SessionCardItem ->
                        oldItem.session.id == newItem.session.id
                    else -> false
                }
            }

            override fun areContentsTheSame(oldItem: SessionListItem, newItem: SessionListItem): Boolean {
                return oldItem == newItem
            }
        }
    }

    override fun getItemViewType(position: Int): Int {
        return when (getItem(position)) {
            is SessionListItem.HeaderItem -> TYPE_HEADER
            is SessionListItem.SessionCardItem -> TYPE_CARD
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == TYPE_HEADER) {
            HeaderViewHolder(ItemSessionHeaderBinding.inflate(inflater, parent, false))
        } else {
            CardViewHolder(ItemChatSessionCardBinding.inflate(inflater, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val item = getItem(position)) {
            is SessionListItem.HeaderItem -> (holder as HeaderViewHolder).bind(item)
            is SessionListItem.SessionCardItem -> (holder as CardViewHolder).bind(item.session)
        }
    }

    inner class HeaderViewHolder(private val binding: ItemSessionHeaderBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: SessionListItem.HeaderItem) {
            binding.tvHeaderTitle.text = item.title.uppercase()
        }
    }

    inner class CardViewHolder(private val binding: ItemChatSessionCardBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(session: ChatSessionDto) {
            binding.tvSessionTitle.text = session.cleanTitle
            binding.tvSessionPreview.text = session.cleanPreview

            val formattedTime = try {
                DateUtils.getRelativeTimeSpanString(
                    session.updatedAt,
                    System.currentTimeMillis(),
                    DateUtils.MINUTE_IN_MILLIS,
                    DateUtils.FORMAT_ABBREV_RELATIVE
                ).toString()
            } catch (_: Exception) {
                "Just now"
            }
            binding.tvSessionTimestamp.text = formattedTime

            binding.cardSession.setOnClickListener {
                it.animate()
                    .scaleX(0.98f)
                    .scaleY(0.98f)
                    .setDuration(90)
                    .withEndAction {
                        it.animate().scaleX(1.0f).scaleY(1.0f).setDuration(90).start()
                        onSessionClick(session)
                    }
                    .start()
            }

            binding.cardSession.setOnLongClickListener {
                onSessionLongClick(session)
                true
            }
        }
    }
}
