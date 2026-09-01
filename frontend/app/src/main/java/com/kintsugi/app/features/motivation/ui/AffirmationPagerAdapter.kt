package com.kintsugi.app.features.motivation.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import androidx.viewpager2.widget.ViewPager2
import com.kintsugi.app.databinding.ItemAffirmationPageBinding
import kotlin.math.abs

/**
 * ViewPager2 ListAdapter binding daily affirmation cards.
 */
class AffirmationPagerAdapter : ListAdapter<String, AffirmationPagerAdapter.AffirmationViewHolder>(AffirmationDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AffirmationViewHolder {
        val binding = ItemAffirmationPageBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return AffirmationViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AffirmationViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class AffirmationViewHolder(
        private val binding: ItemAffirmationPageBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(text: String) {
            binding.tvAffirmationText.text = text
        }
    }

    private class AffirmationDiffCallback : DiffUtil.ItemCallback<String>() {
        override fun areItemsTheSame(oldItem: String, newItem: String): Boolean = oldItem == newItem
        override fun areContentsTheSame(oldItem: String, newItem: String): Boolean = oldItem == newItem
    }

    /**
     * Custom ViewPager2.PageTransformer applying smooth 0.85x scale and alpha cross-fade page transitions.
     */
    class AffirmationPageTransformer : ViewPager2.PageTransformer {

        override fun transformPage(page: View, position: Float) {
            val minScale = 0.85f
            val minAlpha = 0.5f

            when {
                position < -1 -> { // [-Infinity, -1) Off-screen to the left
                    page.alpha = 0f
                }
                position <= 1 -> { // [-1, 1] Page is active / swiping
                    val scaleFactor = minScale.coerceAtLeast(1 - abs(position) * (1 - minScale))
                    page.scaleX = scaleFactor
                    page.scaleY = scaleFactor

                    page.alpha = minAlpha + (scaleFactor - minScale) / (1 - minScale) * (1 - minAlpha)
                }
                else -> { // (1, +Infinity] Off-screen to the right
                    page.alpha = 0f
                }
            }
        }
    }
}
