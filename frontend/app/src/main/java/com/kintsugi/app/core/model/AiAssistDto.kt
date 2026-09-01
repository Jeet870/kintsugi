package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AiAssistRequestDto(
    @SerialName("action") val action: String,
    @SerialName("content") val content: String,
    @SerialName("prompt") val prompt: String? = null
)

@Serializable
data class AiAssistResponseDto(
    @SerialName("action") val action: String,
    @SerialName("result") val result: String
)
