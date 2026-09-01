package com.kintsugi.app.features.moodtracker.ui.adapter

import androidx.recyclerview.widget.DiffUtil
import com.kintsugi.app.core.database.entity.MoodEntryEntity

class MoodHistoryDiffCallback : DiffUtil.ItemCallback<MoodEntryEntity>() {

    override fun areItemsTheSame(oldItem: MoodEntryEntity, newItem: MoodEntryEntity): Boolean {
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: MoodEntryEntity, newItem: MoodEntryEntity): Boolean {
        return oldItem == newItem
    }

    override fun getChangePayload(oldItem: MoodEntryEntity, newItem: MoodEntryEntity): Any? {
        val payloads = mutableSetOf<String>()
        if (oldItem.aiMessage != newItem.aiMessage) {
            payloads.add(PAYLOAD_AI_MESSAGE)
        }
        if (oldItem.note != newItem.note) {
            payloads.add(PAYLOAD_NOTE)
        }
        if (oldItem.isSynced != newItem.isSynced) {
            payloads.add(PAYLOAD_STATUS)
        }
        return if (payloads.isNotEmpty()) payloads else super.getChangePayload(oldItem, newItem)
    }

    companion object {
        const val PAYLOAD_AI_MESSAGE = "PAYLOAD_AI_MESSAGE"
        const val PAYLOAD_NOTE = "PAYLOAD_NOTE"
        const val PAYLOAD_STATUS = "PAYLOAD_STATUS"
    }
}
