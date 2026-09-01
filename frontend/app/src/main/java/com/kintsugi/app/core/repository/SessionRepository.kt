package com.kintsugi.app.core.repository

import com.kintsugi.app.core.datastore.TokenManager
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.realtime.RealtimeEvent
import com.kintsugi.app.core.realtime.RealtimeEventBus
import com.kintsugi.app.core.realtime.WebSocketManager
import com.kintsugi.app.di.IoDispatcher
import com.kintsugi.app.features.auth.data.AuthApiService
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton

sealed interface SessionState {
    data object Loading : SessionState
    data class Authenticated(val user: UserDto) : SessionState
    data object Unauthenticated : SessionState
    data class Expired(val reason: String = "Session expired") : SessionState
}

@Singleton
class SessionRepository @Inject constructor(
    private val tokenManager: TokenManager,
    private val webSocketManager: WebSocketManager,
    private val realtimeEventBus: RealtimeEventBus,
    private val notificationBadgeRepository: NotificationBadgeRepository,
    private val authApiServiceProvider: Provider<AuthApiService>,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {
    private val scope = CoroutineScope(SupervisorJob() + ioDispatcher)

    private val _sessionState = MutableStateFlow<SessionState>(SessionState.Loading)
    val sessionState: StateFlow<SessionState> = _sessionState.asStateFlow()

    private val _currentUser = MutableStateFlow<UserDto?>(null)
    val currentUser: StateFlow<UserDto?> = _currentUser.asStateFlow()

    val isAuthenticated: StateFlow<Boolean> = _sessionState.map { it is SessionState.Authenticated }
        .stateIn(scope, SharingStarted.Eagerly, false)

    init {
        resolveSession()
        observeSessionInvalidatedEvent()
    }

    private fun observeSessionInvalidatedEvent() {
        scope.launch {
            realtimeEventBus.events.collect { event ->
                if (event is RealtimeEvent.SessionInvalidated) {
                    logout()
                }
            }
        }
    }

    fun resolveSession() {
        val token = tokenManager.getAccessToken()
        if (token.isNullOrEmpty()) {
            _currentUser.value = null
            _sessionState.value = SessionState.Unauthenticated
            return
        }

        scope.launch {
            _sessionState.value = SessionState.Loading
            try {
                val user = authApiServiceProvider.get().getCurrentUser()
                _currentUser.value = user
                _sessionState.value = SessionState.Authenticated(user)
                webSocketManager.connect()
                Timber.d("Session resolved successfully for user: ${user.email}")
            } catch (e: Exception) {
                Timber.w(e, "Could not fetch user profile during session resolution. Navigating to login screen.")
                logout()
            }
        }
    }

    fun login(accessToken: String, refreshToken: String, user: UserDto) {
        tokenManager.saveAccessToken(accessToken)
        tokenManager.saveRefreshToken(refreshToken)
        _currentUser.value = user
        _sessionState.value = SessionState.Authenticated(user)
        webSocketManager.connect()
    }

    fun logout() {
        webSocketManager.disconnect()
        tokenManager.clearTokens()
        _currentUser.value = null
        notificationBadgeRepository.reset()
        _sessionState.value = SessionState.Unauthenticated
    }

    fun refreshUser(user: UserDto) {
        _currentUser.value = user
        if (_sessionState.value is SessionState.Authenticated) {
            _sessionState.value = SessionState.Authenticated(user)
        }
    }

    fun clearSession() {
        logout()
    }
}
