package com.kintsugi.app.features.emergency.ui

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.FragmentManager
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.kintsugi.app.core.model.CountryDto
import com.kintsugi.app.databinding.BottomSheetCountryPickerBinding
import com.kintsugi.app.features.emergency.data.CountryRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

/**
 * Reusable Country Picker Bottom Sheet Fragment.
 * Provides searchable list of countries (75% screen height) with real-time filtering and selection persistence.
 */
@AndroidEntryPoint
class CountryPickerBottomSheet : BottomSheetDialogFragment() {

    private var _binding: BottomSheetCountryPickerBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var countryRepository: CountryRepository

    private lateinit var adapter: CountryAdapter
    private var allCountries: List<CountryDto> = emptyList()
    private var selectedCountry: CountryDto? = null
    private var onCountrySelectedListener: ((CountryDto) -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetCountryPickerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupBottomSheetBehavior()
        loadData()
        setupSearch()
        setupActions()
    }

    private fun setupBottomSheetBehavior() {
        (dialog as? BottomSheetDialog)?.behavior?.apply {
            val displayMetrics = resources.displayMetrics
            peekHeight = (displayMetrics.heightPixels * 0.75).toInt()
            state = BottomSheetBehavior.STATE_EXPANDED
            skipCollapsed = true
        }
    }

    private fun loadData() {
        allCountries = countryRepository.getSupportedCountries()
        selectedCountry = countryRepository.getSelectedCountry()

        adapter = CountryAdapter(selectedCountry?.isoCode ?: "IN") { country ->
            selectedCountry = country
            binding.btnConfirmCountry.isEnabled = true
        }
        binding.rvCountries.adapter = adapter
        adapter.submitList(allCountries)
    }

    private fun setupSearch() {
        binding.etSearchCountry.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterList(s?.toString().orEmpty())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnClearSearch.setOnClickListener {
            binding.etSearchCountry.text?.clear()
        }
    }

    private fun filterList(query: String) {
        val q = query.trim().lowercase()
        if (q.isNotEmpty()) {
            binding.btnClearSearch.visibility = View.VISIBLE
        } else {
            binding.btnClearSearch.visibility = View.GONE
        }

        val filtered = if (q.isEmpty()) {
            allCountries
        } else {
            allCountries.filter { country ->
                country.name.lowercase().contains(q) ||
                        country.isoCode.lowercase().contains(q) ||
                        country.region.lowercase().contains(q)
            }
        }

        if (filtered.isEmpty()) {
            binding.rvCountries.visibility = View.GONE
            binding.cardEmptySearch.visibility = View.VISIBLE
        } else {
            binding.cardEmptySearch.visibility = View.GONE
            binding.rvCountries.visibility = View.VISIBLE
            adapter.submitList(filtered)
        }
    }

    private fun setupActions() {
        binding.btnConfirmCountry.setOnClickListener {
            selectedCountry?.let { country ->
                countryRepository.setSelectedCountry(country.isoCode)
                onCountrySelectedListener?.invoke(country)
            }
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun show(
            fragmentManager: FragmentManager,
            onCountrySelected: (CountryDto) -> Unit
        ) {
            val sheet = CountryPickerBottomSheet().apply {
                onCountrySelectedListener = onCountrySelected
            }
            sheet.show(fragmentManager, "country_picker_bottom_sheet")
        }
    }
}
