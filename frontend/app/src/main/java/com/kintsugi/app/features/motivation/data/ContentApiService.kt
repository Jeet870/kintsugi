package com.kintsugi.app.features.motivation.data

import com.kintsugi.app.core.model.ContentDto
import com.kintsugi.app.core.network.ApiConstants
import retrofit2.http.GET

/**
 * Retrofit service responsible for fetching daily motivational content from the REST API.
 */
interface ContentApiService {

    /**
     * Fetches daily motivational quote, affirmations, and self-care tips.
     */
    @GET(ApiConstants.DailyContent.MOTIVATION)
    suspend fun getDailyContent(): ContentDto

    /**
     * Fetches daily affirmations list.
     */
    @GET(ApiConstants.DailyContent.AFFIRMATIONS)
    suspend fun getAffirmations(): List<String>
}
