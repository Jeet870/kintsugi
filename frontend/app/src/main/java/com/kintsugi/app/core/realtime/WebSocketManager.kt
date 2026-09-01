package com.kintsugi.app.core.realtime

import com.kintsugi.app.core.common.Constants
import com.kintsugi.app.core.datastore.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import javax.inject.Inject
import javax.inject.Singleton

sealed class WebSocketStatus {
    data object Disconnected : WebSocketStatus()
    data object Connecting : WebSocketStatus()
    data object Connected : WebSocketStatus()
    data class Error(val message: String) : WebSocketStatus()
}

@Singleton
class WebSocketManager @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val tokenManager: TokenManager
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var webSocket: WebSocket? = null

    private val _status = MutableStateFlow<WebSocketStatus>(WebSocketStatus.Disconnected)
    val status: StateFlow<WebSocketStatus> = _status.asStateFlow()

    private val _incomingMessages = MutableSharedFlow<String>(extraBufferCapacity = 64)
    val incomingMessages: SharedFlow<String> = _incomingMessages.asSharedFlow()

    private var retryCount = 0

    fun connect(url: String = Constants.WEBSOCKET_URL) {
        if (_status.value == WebSocketStatus.Connected || _status.value == WebSocketStatus.Connecting) return

        _status.value = WebSocketStatus.Connecting

        val token = tokenManager.getAccessToken() ?: ""
        val request = Request.Builder()
            .url("$url?token=$token")
            .build()

        webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                _status.value = WebSocketStatus.Connected
                retryCount = 0
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                scope.launch { _incomingMessages.emit(text) }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                _status.value = WebSocketStatus.Error(t.localizedMessage ?: "Connection failure")
                scheduleReconnect(url)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                _status.value = WebSocketStatus.Disconnected
            }
        })
    }

    fun send(message: String): Boolean = webSocket?.send(message) ?: false

    fun disconnect() {
        webSocket?.close(1000, "Normal Closure")
        webSocket = null
        _status.value = WebSocketStatus.Disconnected
    }

    private fun scheduleReconnect(url: String) {
        scope.launch {
            retryCount++
            val delayMs = (1000L * (1 shl retryCount.coerceAtMost(5))).coerceAtMost(MAX_RETRY_DELAY)
            delay(delayMs)
            connect(url)
        }
    }

    companion object {
        private const val MAX_RETRY_DELAY = 30000L
    }
}
