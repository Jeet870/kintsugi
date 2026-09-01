package com.kintsugi.app.features.aicompanion.data

import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.ChatMessageDto
import com.kintsugi.app.core.model.ChatSender
import com.kintsugi.app.core.model.ChatSessionDto
import com.kintsugi.app.core.realtime.RealtimeEvent
import com.kintsugi.app.core.realtime.RealtimeEventBus
import com.kintsugi.app.core.realtime.WebSocketManager
import com.kintsugi.app.core.realtime.WebSocketStatus
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

enum class ConnectionState {
    Connected,
    Connecting,
    Disconnected,
    Reconnecting
}

data class ChatEscalationPayload(
    val alertId: String,
    val severity: String,
    val helplineNumber: String
)

@Singleton
class ChatRepository @Inject constructor(
    private val chatApiService: ChatApiService,
    private val webSocketManager: WebSocketManager,
    private val realtimeEventBus: RealtimeEventBus,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {
    private val repositoryScope = CoroutineScope(SupervisorJob() + ioDispatcher)

    private val _messagesList = mutableListOf<ChatMessageDto>()

    private val _messagesState = MutableStateFlow<Result<List<ChatMessageDto>>>(Result.Success(emptyList()))
    val messagesState: StateFlow<Result<List<ChatMessageDto>>> = _messagesState.asStateFlow()

    private val _currentSessionId = MutableStateFlow<String?>(null)
    val currentSessionId: StateFlow<String?> = _currentSessionId.asStateFlow()

    private val _isTyping = MutableStateFlow(false)
    val isTyping: StateFlow<Boolean> = _isTyping.asStateFlow()

    private val _connectionState = MutableStateFlow(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    private val _escalationEvents = MutableSharedFlow<ChatEscalationPayload>(extraBufferCapacity = 8)
    val escalationEvents: SharedFlow<ChatEscalationPayload> = _escalationEvents.asSharedFlow()

    private val _sessionsState = MutableStateFlow<Result<List<ChatSessionDto>>>(Result.Loading)
    val sessionsState: StateFlow<Result<List<ChatSessionDto>>> = _sessionsState.asStateFlow()

    init {
        observeWebSocketConnection()
        observeRealtimeEvents()
        ensureActiveSession()
        refreshSessionsInternal()
    }

    fun refreshSessionsInternal() {
        repositoryScope.launch {
            refreshSessions()
        }
    }

    suspend fun refreshSessions(): Result<List<ChatSessionDto>> {
        return try {
            val response = chatApiService.listSessions()
            if (response.isSuccessful && response.body() != null) {
                val sessions = response.body()!!
                _sessionsState.value = Result.Success(sessions)
                Result.Success(sessions)
            } else {
                val fallbackList = (_sessionsState.value as? Result.Success)?.data ?: emptyList()
                _sessionsState.value = Result.Success(fallbackList)
                Result.Success(fallbackList)
            }
        } catch (e: Exception) {
            Timber.w(e, "Failed to refresh chat sessions list")
            val fallbackList = (_sessionsState.value as? Result.Success)?.data ?: emptyList()
            _sessionsState.value = Result.Success(fallbackList)
            Result.Success(fallbackList)
        }
    }

    suspend fun startSession(): Result<ChatSessionDto> {
        return try {
            val response = chatApiService.startSession()
            if (response.isSuccessful && response.body() != null) {
                val session = response.body()!!
                _currentSessionId.value = session.id
                _messagesList.clear()
                _messagesList.addAll(session.messages)
                _messagesState.value = Result.Success(_messagesList.toList())
                refreshSessionsInternal()
                Result.Success(session)
            } else {
                val fallbackSessionId = "session_" + UUID.randomUUID().toString().take(8)
                _currentSessionId.value = fallbackSessionId
                val fallbackSession = ChatSessionDto(id = fallbackSessionId, messages = emptyList())
                Result.Success(fallbackSession)
            }
        } catch (e: Exception) {
            Timber.e(e, "Error starting chat session, using offline session")
            val fallbackSessionId = "session_" + UUID.randomUUID().toString().take(8)
            _currentSessionId.value = fallbackSessionId
            Result.Success(ChatSessionDto(id = fallbackSessionId, messages = emptyList()))
        }
    }

    suspend fun loadSession(sessionId: String): Result<ChatSessionDto> {
        return try {
            val response = chatApiService.getSession(sessionId)
            if (response.isSuccessful && response.body() != null) {
                val session = response.body()!!
                _currentSessionId.value = session.id
                _messagesList.clear()
                _messagesList.addAll(session.messages)
                _messagesState.value = Result.Success(_messagesList.toList())
                Result.Success(session)
            } else {
                Result.Error(Exception("Failed to load session ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun renameSession(sessionId: String, newTitle: String): Result<ChatSessionDto> {
        return try {
            val response = chatApiService.renameSession(sessionId, RenameSessionRequest(title = newTitle))
            if (response.isSuccessful && response.body() != null) {
                val updated = response.body()!!
                refreshSessionsInternal()
                Result.Success(updated)
            } else {
                Result.Error(Exception("Failed to rename session"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun deleteSession(sessionId: String): Result<Unit> {
        return try {
            val response = chatApiService.deleteSession(sessionId)
            if (response.isSuccessful || response.code() == 404) {
                if (_currentSessionId.value == sessionId) {
                    _currentSessionId.value = null
                    _messagesList.clear()
                    _messagesState.value = Result.Success(emptyList())
                }
                refreshSessionsInternal()
                Result.Success(Unit)
            } else {
                Result.Error(Exception("Failed to delete session"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun sendMessage(text: String): Result<ChatMessageDto> {
        if (text.isBlank()) return Result.Error(IllegalArgumentException("Message text cannot be empty"))

        val sessionId = _currentSessionId.value ?: startSession().let {
            _currentSessionId.value ?: "session_local"
        }

        // 1. Instant Optimistic Local User Message Append
        val outgoingUserMsg = ChatMessageDto(
            id = "msg_" + UUID.randomUUID().toString().take(10),
            sender = ChatSender.USER,
            text = text,
            createdAt = System.currentTimeMillis()
        )

        synchronized(_messagesList) {
            _messagesList.add(outgoingUserMsg)
            _messagesState.value = Result.Success(_messagesList.toList())
        }

        _isTyping.value = true

        // 2. Post request to REST backend
        repositoryScope.launch {
            try {
                val response = chatApiService.postMessage(
                    PostMessageRequest(sessionId = sessionId, text = text)
                )
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    _isTyping.value = false
                    val replyText = body.reply ?: body.content ?: ""
                    if (replyText.isNotBlank()) {
                        val aiMsg = ChatMessageDto(
                            id = body.id ?: body.messageId ?: ("ai_" + UUID.randomUUID().toString().take(10)),
                            sender = ChatSender.AI,
                            text = replyText,
                            reasoning = body.reasoning,
                            createdAt = System.currentTimeMillis()
                        )
                        synchronized(_messagesList) {
                            if (_messagesList.none { it.id == aiMsg.id }) {
                                _messagesList.add(aiMsg)
                                _messagesState.value = Result.Success(_messagesList.toList())
                            }
                        }
                    }
                } else {
                    Timber.w("REST postMessage failed with code ${response.code()}, triggering local stream fallback")
                    simulateWordStreamingFallback(text)
                }
            } catch (e: Exception) {
                Timber.e(e, "Error posting message to backend, triggering local stream fallback")
                simulateWordStreamingFallback(text)
            }
        }

        return Result.Success(outgoingUserMsg)
    }

    private suspend fun simulateWordStreamingFallback(userPrompt: String) {
        delay(600) // Initial thinking delay
        _isTyping.value = false

        val streamingMsgId = "ai_" + UUID.randomUUID().toString().take(10)
        val reasoningText = "Analyzing emotional tone and applying CBT reframing for: \"$userPrompt\""
        
        val fullResponse = when {
            userPrompt.contains("sleep", ignoreCase = true) -> 
                "I hear you. Difficulty sleeping often stems from an active mind carrying unresolved thoughts. Let's take a deep breath together. Inhale for 4 seconds, hold for 4, and gently exhale for 6."
            userPrompt.contains("relax", ignoreCase = true) || userPrompt.contains("overwhelmed", ignoreCase = true) -> 
                "It's completely natural to feel overwhelmed at times. You don't have to carry everything all at once. What is one small thing we can pause together right now?"
            else -> 
                "Thank you for sharing your thoughts with me. I'm here to support you without any judgment. How are you feeling in your body right now?"
        }

        val words = fullResponse.split(" ")
        var currentText = ""

        synchronized(_messagesList) {
            _messagesList.add(
                ChatMessageDto(
                    id = streamingMsgId,
                    sender = ChatSender.AI,
                    text = "",
                    reasoning = reasoningText,
                    isStreaming = true,
                    createdAt = System.currentTimeMillis()
                )
            )
            _messagesState.value = Result.Success(_messagesList.toList())
        }

        for (word in words) {
            delay(70) // Word-by-word streaming delay
            currentText = if (currentText.isEmpty()) word else "$currentText $word"

            synchronized(_messagesList) {
                val index = _messagesList.indexOfFirst { it.id == streamingMsgId }
                if (index != -1) {
                    _messagesList[index] = _messagesList[index].copy(
                        text = currentText,
                        isStreaming = true
                    )
                    _messagesState.value = Result.Success(_messagesList.toList())
                }
            }
        }

        synchronized(_messagesList) {
            val index = _messagesList.indexOfFirst { it.id == streamingMsgId }
            if (index != -1) {
                _messagesList[index] = _messagesList[index].copy(isStreaming = false)
                _messagesState.value = Result.Success(_messagesList.toList())
            }
        }
    }

    fun reconnect() {
        webSocketManager.connect()
    }

    private fun ensureActiveSession() {
        repositoryScope.launch {
            if (_currentSessionId.value == null) {
                startSession()
            }
        }
    }

    private fun observeWebSocketConnection() {
        repositoryScope.launch {
            webSocketManager.status.collect { status ->
                _connectionState.value = when (status) {
                    is WebSocketStatus.Connected -> ConnectionState.Connected
                    is WebSocketStatus.Connecting -> ConnectionState.Connecting
                    is WebSocketStatus.Disconnected -> ConnectionState.Disconnected
                    is WebSocketStatus.Error -> ConnectionState.Disconnected
                }
            }
        }
    }

    private fun observeRealtimeEvents() {
        repositoryScope.launch {
            realtimeEventBus.events.collect { event ->
                when (event) {
                    is RealtimeEvent.ChatMessageNew -> {
                        val aiMsg = ChatMessageDto(
                            id = event.messageId,
                            sender = if (event.isUser) ChatSender.USER else ChatSender.AI,
                            text = event.text,
                            createdAt = event.timestamp
                        )
                        synchronized(_messagesList) {
                            if (_messagesList.none { it.id == aiMsg.id }) {
                                _messagesList.add(aiMsg)
                                _messagesState.value = Result.Success(_messagesList.toList())
                            }
                        }
                        _isTyping.value = false
                    }
                    is RealtimeEvent.ChatMessageDelta -> {
                        _isTyping.value = false
                        synchronized(_messagesList) {
                            val index = _messagesList.indexOfFirst { it.id == event.messageId }
                            if (index != -1) {
                                val existing = _messagesList[index]
                                val updatedText = existing.text + event.deltaText
                                _messagesList[index] = existing.copy(text = updatedText, isStreaming = true)
                            } else {
                                _messagesList.add(
                                    ChatMessageDto(
                                        id = event.messageId,
                                        sender = ChatSender.AI,
                                        text = event.deltaText,
                                        isStreaming = true
                                    )
                                )
                            }
                            _messagesState.value = Result.Success(_messagesList.toList())
                        }
                    }
                    is RealtimeEvent.ChatMessageReasoning -> {
                        synchronized(_messagesList) {
                            val index = _messagesList.indexOfFirst { it.id == event.messageId }
                            if (index != -1) {
                                val existing = _messagesList[index]
                                val updatedReasoning = (existing.reasoning ?: "") + event.reasoningText
                                _messagesList[index] = existing.copy(reasoning = updatedReasoning)
                                _messagesState.value = Result.Success(_messagesList.toList())
                            }
                        }
                    }
                    is RealtimeEvent.ChatMessageCompleted -> {
                        _isTyping.value = false
                        synchronized(_messagesList) {
                            val index = _messagesList.indexOfFirst { it.id == event.messageId }
                            if (index != -1) {
                                val existing = _messagesList[index]
                                _messagesList[index] = existing.copy(
                                    text = if (event.finalText.isNotBlank()) event.finalText else existing.text,
                                    isStreaming = false
                                )
                                _messagesState.value = Result.Success(_messagesList.toList())
                            }
                        }
                    }
                    is RealtimeEvent.ChatTyping -> {
                        _isTyping.value = event.isTyping
                    }
                    is RealtimeEvent.ChatEscalation -> {
                        _escalationEvents.emit(
                            ChatEscalationPayload(
                                alertId = event.alertId,
                                severity = event.severity,
                                helplineNumber = event.helplineNumber
                            )
                        )
                    }
                    else -> {}
                }
            }
        }
    }
}
