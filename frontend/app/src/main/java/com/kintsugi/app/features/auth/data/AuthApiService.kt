package com.kintsugi.app.features.auth.data

import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.features.auth.data.model.AuthResponse
import com.kintsugi.app.features.auth.data.model.LoginRequest
import com.kintsugi.app.features.auth.data.model.RefreshTokenRequest
import com.kintsugi.app.features.auth.data.model.RegisterRequest
import com.kintsugi.app.features.auth.data.model.TokenResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApiService {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/refresh")
    suspend fun refresh(@Body request: RefreshTokenRequest): TokenResponse

    @POST("auth/logout")
    suspend fun logout()

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: com.kintsugi.app.features.auth.data.model.ForgotPasswordRequest): com.kintsugi.app.features.auth.data.model.ForgotPasswordResponse

    @POST("auth/verify-reset-otp")
    suspend fun verifyResetOtp(@Body request: com.kintsugi.app.features.auth.data.model.VerifyResetOtpRequest): com.kintsugi.app.features.auth.data.model.VerifyResetOtpResponse

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: com.kintsugi.app.features.auth.data.model.ResetPasswordRequest): com.kintsugi.app.features.auth.data.model.ResetPasswordResponse

    @GET("users/me")
    suspend fun getCurrentUser(): UserDto
}
