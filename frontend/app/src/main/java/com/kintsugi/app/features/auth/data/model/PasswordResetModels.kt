package com.kintsugi.app.features.auth.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ForgotPasswordRequest(
    @SerialName("email") val email: String
)

@Serializable
data class ForgotPasswordResponse(
    @SerialName("success") val success: Boolean,
    @SerialName("message") val message: String
)

@Serializable
data class VerifyResetOtpRequest(
    @SerialName("email") val email: String,
    @SerialName("otp") val otp: String
)

@Serializable
data class VerifyResetOtpResponse(
    @SerialName("verified") val verified: Boolean,
    @SerialName("reset_token") val resetToken: String
)

@Serializable
data class ResetPasswordRequest(
    @SerialName("reset_token") val resetToken: String,
    @SerialName("new_password") val newPassword: String
)

@Serializable
data class ResetPasswordResponse(
    @SerialName("success") val success: Boolean,
    @SerialName("message") val message: String
)
