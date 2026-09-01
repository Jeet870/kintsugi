package com.kintsugi.app.features.aicompanion.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.core.model.ChatMessageDto
import com.kintsugi.app.core.model.ChatSender
import com.kintsugi.app.databinding.ItemChatMessageAiBinding
import com.kintsugi.app.databinding.ItemChatMessageSystemBinding
import com.kintsugi.app.databinding.ItemChatMessageUserBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ChatMessageDiffCallback : DiffUtil.ItemCallback<ChatMessageDto>() {
    override fun areItemsTheSame(oldItem: ChatMessageDto, newItem: ChatMessageDto): Boolean {
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: ChatMessageDto, newItem: ChatMessageDto): Boolean {
        return oldItem == newItem
    }

    override fun getChangePayload(oldItem: ChatMessageDto, newItem: ChatMessageDto): Any? {
        return if (oldItem.messageText != newItem.messageText || oldItem.extractedReasoning != newItem.extractedReasoning || oldItem.isStreaming != newItem.isStreaming) {
            PAYLOAD_TEXT_UPDATE
        } else null
    }

    companion object {
        const val PAYLOAD_TEXT_UPDATE = "PAYLOAD_TEXT_UPDATE"
    }
}

class ChatMessageAdapter : ListAdapter<ChatMessageDto, RecyclerView.ViewHolder>(ChatMessageDiffCallback()) {

    companion object {
        private const val VIEW_TYPE_USER = 1
        private const val VIEW_TYPE_AI = 2
        private const val VIEW_TYPE_SYSTEM = 3
        private val timeFormatter = SimpleDateFormat("h:mm a", Locale.getDefault())
    }

    init {
        setHasStableIds(true)
    }

    override fun getItemId(position: Int): Long {
        return getItem(position).id.hashCode().toLong()
    }

    override fun getItemViewType(position: Int): Int {
        return when (getItem(position).sender) {
            ChatSender.USER -> VIEW_TYPE_USER
            ChatSender.AI -> VIEW_TYPE_AI
            ChatSender.SYSTEM -> VIEW_TYPE_SYSTEM
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            VIEW_TYPE_USER -> {
                val binding = ItemChatMessageUserBinding.inflate(inflater, parent, false)
                UserMessageViewHolder(binding)
            }
            VIEW_TYPE_SYSTEM -> {
                val binding = ItemChatMessageSystemBinding.inflate(inflater, parent, false)
                SystemMessageViewHolder(binding)
            }
            else -> {
                val binding = ItemChatMessageAiBinding.inflate(inflater, parent, false)
                AiMessageViewHolder(binding)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        onBindViewHolder(holder, position, emptyList())
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int, payloads: List<Any>) {
        val item = getItem(position)
        when (holder) {
            is UserMessageViewHolder -> holder.bind(item, isPayloadUpdate = payloads.isNotEmpty())
            is AiMessageViewHolder -> holder.bind(item, isPayloadUpdate = payloads.isNotEmpty())
            is SystemMessageViewHolder -> holder.bind(item)
        }
    }

    class UserMessageViewHolder(private val binding: ItemChatMessageUserBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ChatMessageDto, isPayloadUpdate: Boolean = false) {
            binding.tvUserMessage.text = item.messageText
            binding.tvTimestamp.text = timeFormatter.format(Date(item.createdAt))
            if (!isPayloadUpdate) {
                playMaterialEntranceAnimation()
            }
        }

        private fun playMaterialEntranceAnimation() {
            binding.root.alpha = 0f
            binding.root.translationY = 24f
            binding.root.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(200)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }
    }

    class AiMessageViewHolder(private val binding: ItemChatMessageAiBinding) : RecyclerView.ViewHolder(binding.root) {
        private var isReasoningExpanded = false

        fun bind(item: ChatMessageDto, isPayloadUpdate: Boolean = false) {
            binding.tvAiMessage.text = item.messageText
            binding.tvTimestamp.text = timeFormatter.format(Date(item.createdAt))

            val reasoningText = item.extractedReasoning
            if (!reasoningText.isNullOrBlank()) {
                binding.layoutReasoningContainer.visibility = View.VISIBLE
                binding.tvReasoningText.text = reasoningText
                updateReasoningExpansionState()

                binding.btnToggleReasoning.setOnClickListener {
                    isReasoningExpanded = !isReasoningExpanded
                    updateReasoningExpansionState()
                }
            } else {
                binding.layoutReasoningContainer.visibility = View.GONE
            }

            if (!isPayloadUpdate) {
                playMaterialEntranceAnimation()
            }
        }

        private fun updateReasoningExpansionState() {
            if (isReasoningExpanded) {
                binding.btnToggleReasoning.text = "▼ AI Clinical Reasoning"
                binding.cardReasoningContent.visibility = View.VISIBLE
            } else {
                binding.btnToggleReasoning.text = "▶ AI Clinical Reasoning"
                binding.cardReasoningContent.visibility = View.GONE
            }
        }

        private fun playMaterialEntranceAnimation() {
            binding.root.alpha = 0f
            binding.root.translationY = 24f
            binding.root.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(200)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }
    }

    class SystemMessageViewHolder(private val binding: ItemChatMessageSystemBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ChatMessageDto) {
            binding.tvSystemMessage.text = item.messageText
        }
    }
}
