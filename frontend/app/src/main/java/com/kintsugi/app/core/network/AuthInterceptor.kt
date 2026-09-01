package com.kintsugi.app.core.network

import com.kintsugi.app.core.datastore.TokenManager
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    private val publicPaths = listOf(
        ApiConstants.Auth.LOGIN,
        ApiConstants.Auth.REGISTER,
        ApiConstants.Auth.REFRESH_TOKEN,
        ApiConstants.Auth.FORGOT_PASSWORD,
        ApiConstants.Auth.RESET_PASSWORD
    )

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath

        val isPublicEndpoint = publicPaths.any { path.contains(it) }
        val requestBuilder = request.newBuilder()

        if (!isPublicEndpoint) {
            tokenManager.getAccessToken()?.let { token ->
                requestBuilder.header(ApiConstants.HEADER_AUTHORIZATION, "${ApiConstants.TOKEN_PREFIX}$token")
            }
        }

        requestBuilder.header(ApiConstants.HEADER_ACCEPT, ApiConstants.VALUE_JSON)
        requestBuilder.header(ApiConstants.HEADER_CONTENT_TYPE, ApiConstants.VALUE_JSON)

        return chain.proceed(requestBuilder.build())
    }
}
