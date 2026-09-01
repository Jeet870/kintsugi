package com.kintsugi.app.features.minigame.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.databinding.ItemMatchCardBinding
import com.kintsugi.app.features.minigame.model.MatchCard

/**
 * ListAdapter displaying memory match cards with 3D Y-axis flip rotations and glassmorphic purple aesthetics.
 */
class MatchCardAdapter(
    private val onCardClick: (Int) -> Unit
) : ListAdapter<MatchCard, MatchCardAdapter.CardViewHolder>(MatchCardDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CardViewHolder {
        val binding = ItemMatchCardBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return CardViewHolder(binding, onCardClick)
    }

    override fun onBindViewHolder(holder: CardViewHolder, position: Int) {
        holder.bind(getItem(position), position)
    }

    class CardViewHolder(
        private val binding: ItemMatchCardBinding,
        private val onCardClick: (Int) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: MatchCard, position: Int) {
            val context = binding.root.context
            val purpleAccent = Color.parseColor("#A855F7")
            val strokeMuted = Color.parseColor("#2E224D")

            // Configure 3D camera distance perspective
            val scale = context.resources.displayMetrics.density
            binding.cardMatch.cameraDistance = 8000 * scale

            if (item.isFlipped || item.isMatched) {
                binding.layoutCardBack.visibility = View.GONE
                binding.layoutCardFront.visibility = View.VISIBLE
                binding.ivCardFrontIcon.setImageResource(item.iconResId)

                if (item.isMatched) {
                    binding.cardMatch.strokeColor = purpleAccent
                    binding.cardMatch.strokeWidth = (2f * scale).toInt()
                    binding.cardMatch.alpha = 0.95f
                } else {
                    binding.cardMatch.strokeColor = purpleAccent
                    binding.cardMatch.strokeWidth = (1.5f * scale).toInt()
                    binding.cardMatch.alpha = 1.0f
                }
            } else {
                binding.layoutCardBack.visibility = View.VISIBLE
                binding.layoutCardFront.visibility = View.GONE
                binding.cardMatch.strokeColor = strokeMuted
                binding.cardMatch.strokeWidth = (1.5f * scale).toInt()
                binding.cardMatch.alpha = 1.0f
            }

            binding.root.setOnClickListener {
                // Micro tap scale animation
                binding.root.animate()
                    .scaleX(0.95f)
                    .scaleY(0.95f)
                    .setDuration(80)
                    .withEndAction {
                        binding.root.animate()
                            .scaleX(1.0f)
                            .scaleY(1.0f)
                            .setDuration(80)
                            .start()
                    }
                    .start()

                onCardClick(position)
            }
        }
    }

    private class MatchCardDiffCallback : DiffUtil.ItemCallback<MatchCard>() {
        override fun areItemsTheSame(oldItem: MatchCard, newItem: MatchCard): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: MatchCard, newItem: MatchCard): Boolean =
            oldItem == newItem
    }
}
