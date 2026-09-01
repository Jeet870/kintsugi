package com.kintsugi.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ContentDto(
    @SerialName("quote") val quote: String,
    @SerialName("author") val author: String? = "Kintsugi Philosophy",
    @SerialName("affirmations") val affirmations: List<String> = emptyList(),
    @SerialName("self_care_tips") val selfCareTips: List<String> = emptyList()
)
