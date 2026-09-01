package com.kintsugi.app.features.emergency.data

import android.content.Context
import com.kintsugi.app.core.model.CountryDto
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Singleton repository managing supported countries list and persistent user region preference.
 */
@Singleton
class CountryRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {

    private val prefs = context.getSharedPreferences("kintsugi_country_prefs", Context.MODE_PRIVATE)

    private val countries = listOf(
        CountryDto("IN", "India", "🇮🇳", "Asia", 14),
        CountryDto("US", "United States", "🇺🇸", "North America", 18),
        CountryDto("GB", "United Kingdom", "🇬🇧", "Europe", 12),
        CountryDto("CA", "Canada", "🇨🇦", "North America", 10),
        CountryDto("AU", "Australia", "🇦🇺", "Oceania", 8),
        CountryDto("DE", "Germany", "🇩🇪", "Europe", 9),
        CountryDto("FR", "France", "🇫🇷", "Europe", 7),
        CountryDto("JP", "Japan", "🇯🇵", "Asia", 6),
        CountryDto("SG", "Singapore", "🇸🇬", "Asia", 5),
        CountryDto("NZ", "New Zealand", "🇳🇿", "Oceania", 4),
        CountryDto("ALL", "All Regions", "🌐", "Global", 50)
    )

    private val _selectedCountryCodeState = MutableStateFlow(
        prefs.getString("key_selected_country", "IN") ?: "IN"
    )
    val selectedCountryCodeState: StateFlow<String> = _selectedCountryCodeState.asStateFlow()

    fun getSupportedCountries(): List<CountryDto> = countries

    fun setSelectedCountry(isoCode: String) {
        prefs.edit().putString("key_selected_country", isoCode).apply()
        _selectedCountryCodeState.value = isoCode
    }

    fun getSelectedCountry(): CountryDto {
        val currentCode = _selectedCountryCodeState.value
        return countries.find { it.isoCode.equals(currentCode, ignoreCase = true) }
            ?: countries.first()
    }
}
