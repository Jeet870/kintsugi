package com.kintsugi.app.features.emergency.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.HelplineDto
import com.kintsugi.app.features.emergency.data.CountryRepository
import com.kintsugi.app.features.emergency.data.EmergencyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Hilt ViewModel exposing emergency helplines and calming tips directly from [EmergencyRepository].
 */
@HiltViewModel
class EmergencyHelpViewModel @Inject constructor(
    private val emergencyRepository: EmergencyRepository,
    private val countryRepository: CountryRepository
) : ViewModel() {

    val rawHelplinesState: StateFlow<Result<List<HelplineDto>>> = emergencyRepository.helplinesState
    val calmingTipsState: StateFlow<Result<List<String>>> = emergencyRepository.calmingTipsState

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    val selectedCountryCodeState: StateFlow<String> = countryRepository.selectedCountryCodeState

    /**
     * Filtered helplines state flow combining raw helplines, search query, and selected country code.
     */
    val filteredHelplinesState: StateFlow<Result<List<HelplineDto>>> = combine(
        rawHelplinesState,
        _searchQuery,
        selectedCountryCodeState
    ) { result, query, countryCode ->
        if (result is Result.Success) {
            val selectedCountryObj = countryRepository.getSelectedCountry()
            val countryName = selectedCountryObj.name
            val filtered = result.data.filter { helpline ->
                val matchesQuery = query.isBlank() ||
                        helpline.name.contains(query, ignoreCase = true) ||
                        helpline.phoneNumber.contains(query, ignoreCase = true) ||
                        helpline.category.contains(query, ignoreCase = true)
                val matchesCountry = countryCode == "ALL" ||
                        helpline.country.equals(countryName, ignoreCase = true) ||
                        helpline.country.equals(countryCode, ignoreCase = true)
                matchesQuery && matchesCountry
            }
            Result.Success(filtered)
        } else {
            result
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = Result.Loading
    )

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setSelectedCountryCode(isoCode: String) {
        countryRepository.setSelectedCountry(isoCode)
    }

    fun getSelectedCountry() = countryRepository.getSelectedCountry()

    fun refresh() {
        viewModelScope.launch {
            emergencyRepository.refresh()
        }
    }
}
