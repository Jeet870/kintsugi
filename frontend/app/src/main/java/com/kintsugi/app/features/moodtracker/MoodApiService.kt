package com.kintsugi.app.features.moodtracker

import com.kintsugi.app.core.model.MoodEntryDto
import com.kintsugi.app.core.network.ApiConstants
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

@Serializable
data class MoodLogRequest(
    @SerialName("mood_type") val moodType: String,
    @SerialName("mood_score") val moodScore: Int,
    @SerialName("note") val note: String? = null
)

@Serializable
data class MoodStatsDto(
    @SerialName("total_entries") val totalEntries: Int = 0,
    @SerialName("average_score") val averageScore: Float = 0.0f,
    @SerialName("dominant_mood") val dominantMood: String = "Calm",
    @SerialName("streak_days") val streakDays: Int = 1
)

interface MoodApiService {

    @POST(ApiConstants.Mood.LOG)
    suspend fun logMood(
        @Body request: MoodLogRequest
    ): Response<MoodEntryDto>

    @GET(ApiConstants.Mood.HISTORY)
    suspend fun getMoodHistory(): Response<List<MoodEntryDto>>

    @GET(ApiConstants.Mood.STATS)
    suspend fun getMoodStats(): Response<MoodStatsDto>
}
