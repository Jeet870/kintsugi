package com.kintsugi.app.features.journal.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.R
import com.kintsugi.app.core.common.parseAsHtml
import com.kintsugi.app.core.common.stripHtmlTags
import com.kintsugi.app.core.database.entity.JournalEntryEntity
import com.kintsugi.app.databinding.ItemJournalCardBinding
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

class JournalListAdapter(
    private val onEntryClick: (JournalEntryEntity) -> Unit,
    private val onDeleteClick: (JournalEntryEntity) -> Unit,
    private val onFavoriteClick: ((JournalEntryEntity) -> Unit)? = null,
    private val onPinClick: ((JournalEntryEntity) -> Unit)? = null
) : ListAdapter<JournalEntryEntity, JournalListAdapter.JournalViewHolder>(JournalDiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JournalViewHolder {
        val binding = ItemJournalCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return JournalViewHolder(binding)
    }

    override fun onBindViewHolder(holder: JournalViewHolder, position: Int) {
        holder.bind(getItem(position))
        setAnimation(holder.itemView, position)
    }

    private var lastPosition = -1
    private fun setAnimation(viewToAnimate: View, position: Int) {
        if (position > lastPosition) {
            val animation = AnimationUtils.loadAnimation(viewToAnimate.context, android.R.anim.fade_in)
            animation.duration = 250
            viewToAnimate.startAnimation(animation)
            lastPosition = position
        }
    }

    inner class JournalViewHolder(
        private val binding: ItemJournalCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(entry: JournalEntryEntity) {
            val cleanTitle = entry.title.stripHtmlTags()
            binding.tvJournalTitle.text = if (cleanTitle.isNotBlank()) cleanTitle else "Untitled Reflection"
            com.kintsugi.app.core.ui.widget.MarkdownRenderer.render(binding.tvJournalPreview, entry.content)
            binding.tvJournalDate.text = formatRelativeDate(entry.updatedAt)

            // Dynamic Left Icon based on content / mood
            val titleLower = entry.title.lowercase()
            val moodLower = entry.moodTag.lowercase()
            when {
                titleLower.contains("grat") || moodLower.contains("happy") || titleLower.contains("small") -> {
                    binding.ivJournalIcon.setImageResource(R.drawable.ic_sparkles)
                }
                titleLower.contains("begin") || moodLower.contains("excit") || moodLower.contains("love") -> {
                    binding.ivJournalIcon.setImageResource(R.drawable.ic_heart_hands)
                }
                else -> {
                    binding.ivJournalIcon.setImageResource(R.drawable.ic_chat)
                }
            }

            // Favorite Icon state
            if (entry.isFavorite) {
                binding.ivFavoriteIc.setImageResource(R.drawable.ic_emergency_filled)
                binding.ivFavoriteIc.setColorFilter(Color.parseColor("#FB7185"))
            } else {
                binding.ivFavoriteIc.setImageResource(R.drawable.ic_emergency_outline)
                binding.ivFavoriteIc.setColorFilter(Color.parseColor("#8B88A0"))
            }

            // Pin Icon state
            if (entry.isPinned) {
                binding.ivPinIc.setColorFilter(Color.parseColor("#A855F7"))
            } else {
                binding.ivPinIc.setColorFilter(Color.parseColor("#8B88A0"))
            }

            // Mood Tag Chip & Colors
            if (entry.moodTag.isNotBlank()) {
                binding.tvMoodTag.text = entry.moodTag
                binding.tvMoodTag.visibility = View.VISIBLE

                when (moodLower) {
                    "happy" -> binding.tvMoodTag.setTextColor(Color.parseColor("#FACC15"))
                    "excited" -> binding.tvMoodTag.setTextColor(Color.parseColor("#4ADE80"))
                    else -> binding.tvMoodTag.setTextColor(Color.parseColor("#A855F7"))
                }
            } else {
                binding.tvMoodTag.visibility = View.GONE
            }

            // Estimated Reading Time & Word Count
            val words = entry.content.stripHtmlTags().trim().split("\\s+".toRegex()).filter { it.isNotBlank() }.size
            val readTimeMinutes = (words / 200).coerceAtLeast(1)
            binding.tvReadTime.text = "• $readTimeMinutes min read ($words words)"

            // Listeners
            binding.cardJournalEntry.setOnClickListener {
                onEntryClick(entry)
            }

            binding.btnDeleteJournal.setOnClickListener {
                onDeleteClick(entry)
            }

            binding.ivFavoriteIc.setOnClickListener {
                onFavoriteClick?.invoke(entry)
            }

            binding.ivPinIc.setOnClickListener {
                onPinClick?.invoke(entry)
            }
        }

        private fun formatRelativeDate(updatedAt: Instant): String {
            val now = Instant.now()
            val duration = Duration.between(updatedAt, now)
            val days = duration.toDays()

            val relativePrefix = when {
                days == 0L -> "TODAY"
                days == 1L -> "YESTERDAY"
                else -> null
            }

            val timeFormatter = DateTimeFormatter.ofPattern("h:mm a", Locale.getDefault())
                .withZone(ZoneId.systemDefault())
            val formattedTime = timeFormatter.format(updatedAt)

            return if (relativePrefix != null) {
                "$relativePrefix • $formattedTime"
            } else {
                val dateFormatter = DateTimeFormatter.ofPattern("MMM d • h:mm a", Locale.getDefault())
                    .withZone(ZoneId.systemDefault())
                dateFormatter.format(updatedAt).uppercase()
            }
        }
    }

    companion object {
        private object JournalDiffCallback : DiffUtil.ItemCallback<JournalEntryEntity>() {
            override fun areItemsTheSame(
                oldItem: JournalEntryEntity,
                newItem: JournalEntryEntity
            ): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(
                oldItem: JournalEntryEntity,
                newItem: JournalEntryEntity
            ): Boolean {
                return oldItem == newItem
            }
        }
    }
}
