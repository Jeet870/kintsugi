package com.kintsugi.app.features.settings.data

import com.kintsugi.app.core.model.UpdateProfileRequest
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.network.ApiConstants
import retrofit2.http.Body
import retrofit2.http.PATCH

/**
 * Retrofit API service interface for updating profile preferences and user settings.
 */
interface SettingsApiService {

    /**
     * Updates one or more properties of the authenticated user's profile.
     */
    @PATCH(ApiConstants.Users.ME)
    suspend fun updateProfile(
        @Body request: UpdateProfileRequest
    ): UserDto
}
