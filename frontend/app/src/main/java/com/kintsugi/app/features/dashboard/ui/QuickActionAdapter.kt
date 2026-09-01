package com.kintsugi.app.features.dashboard.ui

import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.features.dashboard.data.QuickActionModel
import com.kintsugi.app.features.dashboard.ui.widget.DashboardQuickActionCard

/**
 * ListAdapter rendering dynamic Quick Action cards on the Dashboard using DiffUtil.
 */
class QuickActionAdapter(
    private val onActionClick: (Int) -> Unit
) : ListAdapter<QuickActionModel, QuickActionAdapter.ViewHolder>(DiffCallback) {

    class ViewHolder(val card: DashboardQuickActionCard) : RecyclerView.ViewHolder(card)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val card = DashboardQuickActionCard(parent.context).apply {
            layoutParams = ViewGroup.MarginLayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                val margin = (4 * parent.context.resources.displayMetrics.density).toInt()
                setMargins(margin, margin, margin, margin)
            }
        }
        return ViewHolder(card)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = getItem(position)
        holder.card.setCardData(
            iconRes = item.iconResId,
            title = item.title,
            subtitle = item.subtitle,
            tintColor = item.tintColor
        )

        holder.card.setOnClickListener {
            onActionClick(item.destinationId)
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<QuickActionModel>() {
            override fun areItemsTheSame(oldItem: QuickActionModel, newItem: QuickActionModel): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: QuickActionModel, newItem: QuickActionModel): Boolean {
                return oldItem == newItem
            }
        }
    }
}
