package com.kintsugi.app.features.moodtracker.ui.adapter

import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.databinding.ItemMoodHistoryEntryBinding
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class MoodHistoryViewHolder(
    private val binding: ItemMoodHistoryEntryBinding
) : RecyclerView.ViewHolder(binding.root) {

    private val dateFormatter = DateTimeFormatter.ofPattern("EEE, MMM d • h:mm a").withZone(ZoneId.systemDefault())
    private var isExpanded = false

    fun bind(item: MoodEntryEntity, onDelete: (String) -> Unit) {
        val mood = MoodOptions.fromApiValue(item.moodType)
        binding.tvEmoji.text = mood.emoji
        binding.tvMoodTitle.text = mood.label
        binding.tvTimestamp.text = dateFormatter.format(item.createdAt)

        if (!item.note.isNullOrBlank()) {
            binding.tvNote.text = item.note
            binding.tvNote.visibility = View.VISIBLE
        } else {
            binding.tvNote.visibility = View.GONE
        }

        updateAiMessage(item.aiMessage)

        binding.cardContainer.setOnClickListener {
            isExpanded = !isExpanded
            binding.layoutExpandedActions.visibility = if (isExpanded) View.VISIBLE else View.GONE
            binding.ivExpandChevron.rotation = if (isExpanded) 270f else 90f
        }

        binding.btnDeleteEntry.setOnClickListener {
            onDelete(item.id)
        }

        playEntryAnimation()
    }

    fun updateAiMessage(aiMessage: String?) {
        binding.aiCardView.bindAiMessage(aiMessage)
        binding.aiCardView.visibility = View.VISIBLE
    }

    fun updateNote(note: String?) {
        if (!note.isNullOrBlank()) {
            binding.tvNote.text = note
            binding.tvNote.visibility = View.VISIBLE
        } else {
            binding.tvNote.visibility = View.GONE
        }
    }

    private fun playEntryAnimation() {
        binding.root.alpha = 0f
        binding.root.translationY = 20f
        binding.root.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(350)
            .start()
    }
}
