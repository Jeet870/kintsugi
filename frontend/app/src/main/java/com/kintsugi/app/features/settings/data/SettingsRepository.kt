package com.kintsugi.app.features.settings.data

import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.datastore.ThemeMode
import com.kintsugi.app.core.datastore.ThemePreferences
import com.kintsugi.app.core.model.UpdateProfileRequest
import com.kintsugi.app.core.repository.SessionRepository
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Single source of truth repository for user settings and preferences.
 *
 * Updates [SessionRepository.currentUser] immediately upon receiving a successful response
 * from the backend, guaranteeing automatic UI synchronization across the app.
 */
@Singleton
class SettingsRepository @Inject constructor(
    private val settingsApiService: SettingsApiService,
    private val sessionRepository: SessionRepository,
    private val themePreferences: ThemePreferences,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    /**
     * Observable stream of the current user's theme preference.
     */
    val themeModeFlow: Flow<ThemeMode> = themePreferences.themeFlow

    /**
     * Updates one or more properties of the authenticated user's profile.
     *
     * @param name Optional new display name.
     * @param avatarUrl Optional new avatar URL.
     * @param notificationEnabled Optional notification preference flag.
     */
    suspend fun updateProfile(
        name: String? = null,
        avatarUrl: String? = null,
        notificationEnabled: Boolean? = null
    ): Result<Unit> = withContext(ioDispatcher) {
        val current = sessionRepository.currentUser.value
        if (current != null) {
            val nameUnchanged = name == null || name == current.name
            val avatarUnchanged = avatarUrl == null || avatarUrl == current.avatarUrl
            val notifUnchanged = notificationEnabled == null || notificationEnabled == current.notificationEnabled

            if (nameUnchanged && avatarUnchanged && notifUnchanged) {
                Timber.d("No profile changes detected. Returning immediate success.")
                return@withContext Result.Success(Unit)
            }
        }

        try {
            val request = UpdateProfileRequest(
                name = name,
                avatarUrl = avatarUrl,
                notificationEnabled = notificationEnabled
            )
            val updatedUser = settingsApiService.updateProfile(request)

            // Immediately update SessionRepository so Profile screen and Nav Header synchronize automatically
            sessionRepository.refreshUser(updatedUser)
            Timber.d("Successfully updated profile settings and synchronized SessionRepository.")
            Result.Success(Unit)
        } catch (e: Exception) {
            Timber.e(e, "Failed to update profile settings.")
            Result.Error(e, "Unable to update settings. Please check your connection.")
        }
    }

    /**
     * Updates the app theme mode preference (DARK, LIGHT, SYSTEM).
     */
    suspend fun setThemeMode(mode: ThemeMode) = withContext(ioDispatcher) {
        themePreferences.setTheme(mode)
    }

    /**
     * Signs out the authenticated user.
     */
    suspend fun logout() = withContext(ioDispatcher) {
        sessionRepository.clearSession()
    }
}
