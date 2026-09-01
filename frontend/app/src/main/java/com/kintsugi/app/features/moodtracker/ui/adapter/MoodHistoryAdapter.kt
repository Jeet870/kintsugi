package com.kintsugi.app.features.moodtracker.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.ListAdapter
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.databinding.ItemMoodHistoryEntryBinding

class MoodHistoryAdapter(
    private val onDeleteClick: (String) -> Unit = {}
) : ListAdapter<MoodEntryEntity, MoodHistoryViewHolder>(MoodHistoryDiffCallback()) {

    init {
        setHasStableIds(true)
    }

    override fun getItemId(position: Int): Long {
        return getItem(position).id.hashCode().toLong()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MoodHistoryViewHolder {
        val binding = ItemMoodHistoryEntryBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return MoodHistoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: MoodHistoryViewHolder, position: Int) {
        holder.bind(getItem(position), onDeleteClick)
    }

    override fun onBindViewHolder(holder: MoodHistoryViewHolder, position: Int, payloads: MutableList<Any>) {
        if (payloads.isNotEmpty()) {
            val item = getItem(position)
            for (payload in payloads) {
                if (payload is Set<*>) {
                    if (payload.contains(MoodHistoryDiffCallback.PAYLOAD_AI_MESSAGE)) {
                        holder.updateAiMessage(item.aiMessage)
                    }
                    if (payload.contains(MoodHistoryDiffCallback.PAYLOAD_NOTE)) {
                        holder.updateNote(item.note)
                    }
                } else if (payload == MoodHistoryDiffCallback.PAYLOAD_AI_MESSAGE) {
                    holder.updateAiMessage(item.aiMessage)
                }
            }
        } else {
            super.onBindViewHolder(holder, position, payloads)
        }
    }
}
