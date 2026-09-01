package com.kintsugi.app.features.auth.data

import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.datastore.TokenManager
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.repository.SessionRepository
import com.kintsugi.app.di.IoDispatcher
import com.kintsugi.app.features.auth.data.model.LoginRequest
import com.kintsugi.app.features.auth.data.model.RefreshTokenRequest
import com.kintsugi.app.features.auth.data.model.RegisterRequest
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApiService: AuthApiService,
    private val tokenManager: TokenManager,
    private val sessionRepository: SessionRepository,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    suspend fun login(email: String, password: String): Result<UserDto> = withContext(ioDispatcher) {
        try {
            val response = authApiService.login(LoginRequest(email = email, password = password))
            tokenManager.saveAccessToken(response.accessToken)
            tokenManager.saveRefreshToken(response.refreshToken)

            val user = response.user ?: try {
                authApiService.getCurrentUser()
            } catch (e: Exception) {
                UserDto(id = "usr_kintsugi", email = email, name = "Kintsugi User")
            }

            sessionRepository.login(response.accessToken, response.refreshToken, user)
            Result.Success(user)
        } catch (e: Exception) {
            Result.Error(e, e.localizedMessage ?: "Login failed")
        }
    }

    suspend fun register(name: String, email: String, password: String): Result<UserDto> = withContext(ioDispatcher) {
        try {
            val response = authApiService.register(RegisterRequest(name = name, email = email, password = password))
            tokenManager.saveAccessToken(response.accessToken)
            tokenManager.saveRefreshToken(response.refreshToken)

            val user = response.user ?: UserDto(id = "usr_new", email = email, name = name)
            sessionRepository.login(response.accessToken, response.refreshToken, user)
            Result.Success(user)
        } catch (e: Exception) {
            Result.Error(e, e.localizedMessage ?: "Registration failed")
        }
    }

    suspend fun logout(): Result<Unit> = withContext(ioDispatcher) {
        try {
            authApiService.logout()
        } catch (_: Exception) {
            // Ignore API failures on sign out to ensure secure local cleanup
        } finally {
            sessionRepository.logout()
        }
        Result.Success(Unit)
    }

    suspend fun refreshToken(): Result<Unit> = withContext(ioDispatcher) {
        val currentRefreshToken = tokenManager.getRefreshToken() ?: return@withContext Result.Error(
            IllegalStateException("No refresh token stored")
        )

        try {
            val response = authApiService.refresh(RefreshTokenRequest(currentRefreshToken))
            tokenManager.saveAccessToken(response.accessToken)
            response.refreshToken?.let { tokenManager.saveRefreshToken(it) }
            Result.Success(Unit)
        } catch (e: Exception) {
            sessionRepository.logout()
            Result.Error(e, "Token refresh failed")
        }
    }

    suspend fun resolveSession(): Result<UserDto> = withContext(ioDispatcher) {
        val token = tokenManager.getAccessToken() ?: return@withContext Result.Error(
            IllegalStateException("No access token")
        )

        try {
            val user = authApiService.getCurrentUser()
            sessionRepository.refreshUser(user)
            Result.Success(user)
        } catch (e: Exception) {
            Result.Error(e, "Session resolution failed")
        }
    }

    suspend fun forgotPassword(email: String): Result<String> = withContext(ioDispatcher) {
        try {
            val req = com.kintsugi.app.features.auth.data.model.ForgotPasswordRequest(email)
            val res = authApiService.forgotPassword(req)
            Result.Success(res.message)
        } catch (e: Exception) {
            Result.Error(e, e.localizedMessage ?: "Unable to request password reset code.")
        }
    }

    suspend fun verifyResetOtp(email: String, otp: String): Result<String> = withContext(ioDispatcher) {
        try {
            val req = com.kintsugi.app.features.auth.data.model.VerifyResetOtpRequest(email, otp)
            val res = authApiService.verifyResetOtp(req)
            if (res.verified && res.resetToken.isNotEmpty()) {
                Result.Success(res.resetToken)
            } else {
                Result.Error(Exception("Verification failed"), "The verification code is incorrect.")
            }
        } catch (e: Exception) {
            val msg = parseErrorMessage(e) ?: "The verification code is incorrect or expired."
            Result.Error(e, msg)
        }
    }

    suspend fun resetPassword(resetToken: String, newPassword: String): Result<String> = withContext(ioDispatcher) {
        try {
            val req = com.kintsugi.app.features.auth.data.model.ResetPasswordRequest(resetToken, newPassword)
            val res = authApiService.resetPassword(req)
            Result.Success(res.message)
        } catch (e: Exception) {
            val msg = parseErrorMessage(e) ?: "Unable to reset password. Please check security requirements."
            Result.Error(e, msg)
        }
    }

    private fun parseErrorMessage(e: Exception): String? {
        return try {
            if (e is retrofit2.HttpException) {
                val errorBody = e.response()?.errorBody()?.string()
                if (!errorBody.isNull_or_empty()) {
                    val jsonObj = org.json.JSONObject(errorBody)
                    if (jsonObj.has("detail")) jsonObj.getString("detail") else null
                } else null
            } else null
        } catch (_: Exception) {
            null
        }
    }

    private fun String?.isNull_or_empty(): Boolean = this == null || this.isEmpty()
}
