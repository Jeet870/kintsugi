package com.kintsugi.app.features.aicompanion.data

import com.kintsugi.app.core.model.ChatMessageDto
import com.kintsugi.app.core.model.ChatSessionDto
import com.kintsugi.app.core.model.FlexibleIdSerializer
import com.kintsugi.app.core.network.ApiConstants
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

@Serializable
data class StartSessionRequest(
    @SerialName("user_id") val userId: String? = null,
    @SerialName("topic") val topic: String? = null
)

@Serializable
data class RenameSessionRequest(
    @SerialName("title") val title: String
)

@Serializable
data class PostMessageRequest(
    @SerialName("session_id") val sessionId: String,
    @SerialName("text") val text: String
)

@Serializable
data class PostMessageResponse(
    @Serializable(with = FlexibleIdSerializer::class)
    @SerialName("id") val id: String? = null,
    @SerialName("message_id") val messageId: String? = null,
    @SerialName("status") val status: String = "received",
    @SerialName("content") val content: String? = null,
    @SerialName("reply") val reply: String? = null,
    @SerialName("reasoning") val reasoning: String? = null
)

interface ChatApiService {

    @GET(ApiConstants.AICompanion.SESSIONS)
    suspend fun listSessions(): Response<List<ChatSessionDto>>

    @POST(ApiConstants.AICompanion.SESSIONS)
    suspend fun startSession(
        @Body request: StartSessionRequest = StartSessionRequest()
    ): Response<ChatSessionDto>

    @GET("${ApiConstants.AICompanion.SESSIONS}/{sessionId}")
    suspend fun getSession(
        @Path("sessionId") sessionId: String
    ): Response<ChatSessionDto>

    @PATCH("${ApiConstants.AICompanion.SESSIONS}/{sessionId}")
    suspend fun renameSession(
        @Path("sessionId") sessionId: String,
        @Body request: RenameSessionRequest
    ): Response<ChatSessionDto>

    @DELETE("${ApiConstants.AICompanion.SESSIONS}/{sessionId}")
    suspend fun deleteSession(
        @Path("sessionId") sessionId: String
    ): Response<Unit>

    @POST(ApiConstants.AICompanion.CHAT)
    suspend fun postMessage(
        @Body request: PostMessageRequest
    ): Response<PostMessageResponse>

    @GET("chat/history")
    suspend fun getChatHistory(): Response<List<ChatMessageDto>>
}
