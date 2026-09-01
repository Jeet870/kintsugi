package com.kintsugi.app.core.model

/**
 * Data representation for a country item in the Country Picker Bottom Sheet.
 */
data class CountryDto(
    val isoCode: String,
    val name: String,
    val flagEmoji: String,
    val region: String,
    val helplineCount: Int = 0
)
