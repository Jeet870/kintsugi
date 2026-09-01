package com.kintsugi.app.features.settings.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.datastore.ThemeMode
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.repository.SessionRepository
import com.kintsugi.app.features.settings.data.SettingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Hilt ViewModel managing state for the Settings & Personal Control Center screen.
 */
@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository,
    sessionRepository: SessionRepository
) : ViewModel() {

    val currentUser: StateFlow<UserDto?> = sessionRepository.currentUser
    val themeMode: StateFlow<ThemeMode> = settingsRepository.themeModeFlow.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = ThemeMode.KintsugiDark
    )

    private val _settingsState = MutableStateFlow<Result<Unit>?>(null)
    val settingsState: StateFlow<Result<Unit>?> = _settingsState.asStateFlow()

    /**
     * Updates user profile settings with input validation.
     */
    fun updateProfile(
        name: String? = null,
        avatarUrl: String? = null,
        notificationEnabled: Boolean? = null
    ) {
        viewModelScope.launch {
            if (name != null) {
                val trimmedName = name.trim()
                if (trimmedName.isEmpty() || trimmedName.length < 2) {
                    _settingsState.value = Result.Error(
                        Exception("Invalid name"),
                        "Please enter a valid display name (minimum 2 characters)."
                    )
                    return@launch
                }
            }

            _settingsState.value = Result.Loading
            val result = settingsRepository.updateProfile(
                name = name,
                avatarUrl = avatarUrl,
                notificationEnabled = notificationEnabled
            )
            _settingsState.value = result
        }
    }

    /**
     * Updates app theme mode (DARK, LIGHT, SYSTEM).
     */
    fun setThemeMode(mode: ThemeMode) {
        viewModelScope.launch {
            settingsRepository.setThemeMode(mode)
        }
    }

    /**
     * Signs out the user.
     */
    fun logout() {
        viewModelScope.launch {
            settingsRepository.logout()
        }
    }
}
