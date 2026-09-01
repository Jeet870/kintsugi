package com.kintsugi.app.features.journal.data

import com.kintsugi.app.core.model.AiAssistRequestDto
import com.kintsugi.app.core.model.AiAssistResponseDto
import com.kintsugi.app.core.model.JournalEntryDto
import com.kintsugi.app.core.model.JournalEntryRequest
import com.kintsugi.app.core.network.ApiConstants
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

/**
 * Retrofit interface responsible for every journal-related REST operation.
 */
interface JournalApiService {

    @GET(ApiConstants.Journal.ENTRIES)
    suspend fun list(): List<JournalEntryDto>

    @POST(ApiConstants.Journal.ENTRIES)
    suspend fun create(
        @Body request: JournalEntryRequest
    ): JournalEntryDto

    @PUT("journal/entries/{id}")
    suspend fun update(
        @Path("id") id: String,
        @Body request: JournalEntryRequest
    ): JournalEntryDto

    @POST("journal/ai-assist")
    suspend fun aiAssist(
        @Body request: AiAssistRequestDto
    ): AiAssistResponseDto

    @POST("journal/ai/generate")
    suspend fun generateFullDraft(
        @Body request: Map<String, String>
    ): Map<String, String>

    @DELETE("journal/entries/{id}")
    suspend fun delete(
        @Path("id") id: String
    ): Response<Unit>
}
