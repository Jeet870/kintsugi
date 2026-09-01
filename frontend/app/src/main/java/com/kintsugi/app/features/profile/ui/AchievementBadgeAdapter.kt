package com.kintsugi.app.features.profile.ui

import android.animation.ObjectAnimator
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.R
import com.kintsugi.app.core.model.AchievementDto
import com.kintsugi.app.databinding.ItemAchievementBadgeBinding

/**
 * Modern 3-column Grid Gallery ListAdapter for displaying earned and locked achievement badges.
 */
class AchievementBadgeAdapter : ListAdapter<AchievementDto, AchievementBadgeAdapter.BadgeViewHolder>(BadgeDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BadgeViewHolder {
        val binding = ItemAchievementBadgeBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return BadgeViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BadgeViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class BadgeViewHolder(
        private val binding: ItemAchievementBadgeBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: AchievementDto) {
            binding.tvBadgeTitle.text = item.title

            val colorGold = ContextCompat.getColor(binding.root.context, R.color.luxury_gold)
            val colorMuted = ContextCompat.getColor(binding.root.context, R.color.gold_accent_alpha15)

            if (item.isUnlocked) {
                binding.cardAchievement.strokeColor = colorGold
                binding.cardAchievement.strokeWidth = (1.5f * binding.root.resources.displayMetrics.density).toInt()
                binding.tvBadgeIcon.text = getBadgeEmoji(item.id)
                binding.tvBadgeIcon.alpha = 1.0f
                binding.tvLockOverlay.visibility = View.GONE

                // Remove grayscale filter
                binding.tvBadgeIcon.paint.colorFilter = null
            } else {
                binding.cardAchievement.strokeColor = colorMuted
                binding.cardAchievement.strokeWidth = (1f * binding.root.resources.displayMetrics.density).toInt()
                binding.tvBadgeIcon.text = getBadgeEmoji(item.id)
                binding.tvBadgeIcon.alpha = 0.4f
                binding.tvLockOverlay.visibility = View.VISIBLE

                // Apply Grayscale Filter for locked badges
                val matrix = ColorMatrix().apply { setSaturation(0f) }
                binding.tvBadgeIcon.paint.colorFilter = ColorMatrixColorFilter(matrix)
            }
        }

        fun playUnlockPulseAnimation() {
            binding.cardAchievement.scaleX = 0.8f
            binding.cardAchievement.scaleY = 0.8f
            binding.cardAchievement.animate()
                .scaleX(1.1f)
                .scaleY(1.1f)
                .setDuration(300)
                .withEndAction {
                    binding.cardAchievement.animate()
                        .scaleX(1.0f)
                        .scaleY(1.0f)
                        .setDuration(200)
                        .start()
                }
                .start()
        }

        private fun getBadgeEmoji(id: String): String = when {
            id.contains("1") || id.contains("first") -> "🌟"
            id.contains("2") || id.contains("breath") -> "🫁"
            id.contains("3") || id.contains("journal") -> "📝"
            id.contains("4") || id.contains("streak") -> "🔥"
            else -> "🏆"
        }
    }

    private class BadgeDiffCallback : DiffUtil.ItemCallback<AchievementDto>() {
        override fun areItemsTheSame(oldItem: AchievementDto, newItem: AchievementDto): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: AchievementDto, newItem: AchievementDto): Boolean =
            oldItem == newItem
    }
}
