package com.kintsugi.app.features.emergency.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.kintsugi.app.R
import com.kintsugi.app.core.model.CountryDto
import com.kintsugi.app.databinding.ItemCountryRowBinding

/**
 * ListAdapter rendering supported countries with selected state highlights and checkmark indicators.
 */
class CountryAdapter(
    private var selectedIsoCode: String,
    private val onCountrySelected: (CountryDto) -> Unit
) : ListAdapter<CountryDto, CountryAdapter.ViewHolder>(DiffCallback) {

    class ViewHolder(val binding: ItemCountryRowBinding) : RecyclerView.ViewHolder(binding.root)

    fun updateSelectedCode(newCode: String) {
        selectedIsoCode = newCode
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemCountryRowBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val country = getItem(position)
        val isSelected = country.isoCode.equals(selectedIsoCode, ignoreCase = true)

        holder.binding.apply {
            tvFlagEmoji.text = country.flagEmoji
            tvCountryName.text = country.name
            tvCountryRegion.text = "${country.region} • ${country.helplineCount} Helplines"

            if (isSelected) {
                cardCountryRow.setCardBackgroundColor(Color.parseColor("#21173D"))
                cardCountryRow.strokeColor = Color.parseColor("#A855F7")
                ivCheckmark.visibility = View.VISIBLE
                tvChevron.visibility = View.GONE
            } else {
                cardCountryRow.setCardBackgroundColor(Color.parseColor("#1A1232"))
                cardCountryRow.strokeColor = Color.parseColor("#2E224D")
                ivCheckmark.visibility = View.GONE
                tvChevron.visibility = View.VISIBLE
            }

            root.setOnClickListener {
                updateSelectedCode(country.isoCode)
                onCountrySelected(country)
            }
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<CountryDto>() {
            override fun areItemsTheSame(oldItem: CountryDto, newItem: CountryDto): Boolean {
                return oldItem.isoCode == newItem.isoCode
            }

            override fun areContentsTheSame(oldItem: CountryDto, newItem: CountryDto): Boolean {
                return oldItem == newItem
            }
        }
    }
}
