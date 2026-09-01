package com.kintsugi.app.features.notification.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

@Serializable
data class NotificationNetworkDto(
    @SerialName("id") val id: Int,
    @SerialName("user_id") val userId: Int = 0,
    @SerialName("title") val title: String,
    @SerialName("message") val message: String = "",
    @SerialName("body") val body: String = "",
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("category") val category: String? = "general",
    @SerialName("created_at") val createdAt: String = ""
)

interface NotificationApiService {

    @GET("notifications")
    suspend fun getNotifications(
        @Query("skip") skip: Int = 0,
        @Query("limit") limit: Int = 50
    ): List<NotificationNetworkDto>

    @PATCH("notifications/{id}/read")
    suspend fun markAsRead(@Path("id") id: String): Response<Unit>

    @POST("notifications/mark-all-read")
    suspend fun markAllAsRead(): Response<Unit>

    @DELETE("notifications/{id}")
    suspend fun deleteNotification(@Path("id") id: String): Response<Unit>

    @DELETE("notifications")
    suspend fun clearAllNotifications(): Response<Unit>
}
