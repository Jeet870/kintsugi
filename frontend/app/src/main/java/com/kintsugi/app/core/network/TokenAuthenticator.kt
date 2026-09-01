package com.kintsugi.app.core.network

import com.kintsugi.app.core.common.Constants
import com.kintsugi.app.core.datastore.TokenManager
import okhttp3.Authenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import org.json.JSONObject
import timber.log.Timber
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * OkHttp [Authenticator] that automatically intercept HTTP 401 Unauthorized responses
 * and performs a synchronous refresh token rotation call to `/api/v1/auth/refresh`.
 * If token refresh succeeds, updates [TokenManager] and retries the original request.
 * If refresh fails, clears stored tokens to trigger re-authentication.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val tokenManager: TokenManager
) : Authenticator {

    private val refreshClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    @Synchronized
    override fun authenticate(route: Route?, response: Response): Request? {
        // Prevent infinite loops if request already retried
        if (response.priorResponse != null) {
            tokenManager.clearTokens()
            return null
        }

        val refreshToken = tokenManager.getRefreshToken()
        if (refreshToken.isNullOrBlank()) {
            tokenManager.clearTokens()
            return null
        }

        val currentAccessToken = tokenManager.getAccessToken()

        // If another thread already refreshed the token
        val latestToken = tokenManager.getAccessToken()
        if (latestToken != null && latestToken != currentAccessToken && latestToken != "refreshed_access_token") {
            return response.request.newBuilder()
                .header(ApiConstants.HEADER_AUTHORIZATION, "${ApiConstants.TOKEN_PREFIX}$latestToken")
                .build()
        }

        // Perform real REST API refresh token call
        try {
            val refreshUrl = "${Constants.BASE_URL}auth/refresh"
            val jsonBody = JSONObject().apply {
                put("refresh_token", refreshToken)
            }.toString()

            val refreshRequest = Request.Builder()
                .url(refreshUrl)
                .post(jsonBody.toRequestBody("application/json; charset=utf-8".toMediaType()))
                .build()

            val refreshResponse = refreshClient.newCall(refreshRequest).execute()
            if (refreshResponse.isSuccessful) {
                val responseBodyStr = refreshResponse.body?.string()
                if (!responseBodyStr.isNullOrBlank()) {
                    val jsonObj = JSONObject(responseBodyStr)
                    val newAccessToken = if (jsonObj.has("access_token")) jsonObj.getString("access_token") else null
                    val newRefreshToken = if (jsonObj.has("refresh_token")) jsonObj.getString("refresh_token") else refreshToken

                    if (!newAccessToken.isNullOrBlank()) {
                        tokenManager.saveAccessToken(newAccessToken)
                        tokenManager.saveRefreshToken(newRefreshToken)
                        Timber.d("TokenAuthenticator: Access token refreshed successfully.")

                        return response.request.newBuilder()
                            .header(ApiConstants.HEADER_AUTHORIZATION, "${ApiConstants.TOKEN_PREFIX}$newAccessToken")
                            .build()
                    }
                }
            } else {
                Timber.w("TokenAuthenticator: Refresh request failed with code ${refreshResponse.code}")
            }
        } catch (e: Exception) {
            Timber.e(e, "TokenAuthenticator: Error during token refresh request")
        }

        // Clear invalid tokens if refresh fails
        tokenManager.clearTokens()
        return null
    }
}
