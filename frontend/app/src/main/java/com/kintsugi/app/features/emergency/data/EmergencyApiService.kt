package com.kintsugi.app.features.emergency.data

import com.kintsugi.app.core.model.HelplineDto
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * Retrofit API interface responsible for retrieving emergency resources, country helplines, and calming tips.
 */
interface EmergencyApiService {

    /**
     * Retrieves emergency helplines filtered by optional country code.
     */
    @GET("emergency/helplines")
    suspend fun getHelplines(
        @Query("country") countryCode: String? = "US"
    ): List<HelplineDto>

    /**
     * Retrieves calming tips for immediate anxiety reduction.
     */
    @GET("emergency/calming-tips")
    suspend fun getCalmingTips(): List<String>
}
