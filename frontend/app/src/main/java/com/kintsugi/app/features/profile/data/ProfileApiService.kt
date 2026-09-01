package com.kintsugi.app.features.profile.data

import com.kintsugi.app.core.model.AchievementDto
import com.kintsugi.app.core.model.StreakDto
import com.kintsugi.app.core.model.UserDto
import retrofit2.http.GET

/**
 * Retrofit API service interface for retrieving authenticated profile data, streak stats, and achievements.
 */
interface ProfileApiService {

    /**
     * Retrieves current user profile details.
     */
    @GET("profile/me")
    suspend fun getProfile(): UserDto

    /**
     * Retrieves current streak information.
     */
    @GET("profile/streak")
    suspend fun getStreak(): StreakDto

    /**
     * Retrieves list of earned and locked achievements.
     */
    @GET("profile/achievements")
    suspend fun getAchievements(): List<AchievementDto>
}
