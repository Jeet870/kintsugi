package com.kintsugi.app.features.aicompanion.ui

import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.ChatMessageDto
import com.kintsugi.app.core.ui.base.BaseViewModel
import com.kintsugi.app.features.aicompanion.data.ChatEscalationPayload
import com.kintsugi.app.features.aicompanion.data.ChatRepository
import com.kintsugi.app.features.aicompanion.data.ConnectionState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : BaseViewModel() {

    val messagesState: StateFlow<Result<List<ChatMessageDto>>> = chatRepository.messagesState
    val isTyping: StateFlow<Boolean> = chatRepository.isTyping
    val connectionState: StateFlow<ConnectionState> = chatRepository.connectionState
    val escalationEvents: SharedFlow<ChatEscalationPayload> = chatRepository.escalationEvents
    val currentSessionId: StateFlow<String?> = chatRepository.currentSessionId

    private val _draftMessage = MutableStateFlow("")
    val draftMessage: StateFlow<String> = _draftMessage.asStateFlow()

    private val _isSending = MutableStateFlow(false)

    val sendEnabled: StateFlow<Boolean> = combine(_draftMessage, _isSending, connectionState) { draft, sending, connection ->
        draft.isNotBlank() && !sending && connection == ConnectionState.Connected
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = false
    )

    fun loadSession(sessionId: String) {
        viewModelScope.launch {
            chatRepository.loadSession(sessionId)
        }
    }

    fun updateDraft(input: String) {
        _draftMessage.value = input
    }

    fun clearDraft() {
        _draftMessage.value = ""
    }

    fun sendMessage() {
        val text = _draftMessage.value.trim()
        if (text.isBlank() || _isSending.value) return
        if (text.length > MAX_MESSAGE_LENGTH) return

        viewModelScope.launch {
            _isSending.value = true
            _draftMessage.value = ""

            val result = chatRepository.sendMessage(text)
            if (result is Result.Error) {
                _draftMessage.value = text
            }

            _isSending.value = false
        }
    }

    fun sendPrompt(promptText: String) {
        _draftMessage.value = promptText
        sendMessage()
    }

    fun startNewSession() {
        viewModelScope.launch {
            chatRepository.startSession()
        }
    }

    fun renameSession(sessionId: String, newTitle: String) {
        viewModelScope.launch {
            chatRepository.renameSession(sessionId, newTitle)
        }
    }

    fun deleteSession(sessionId: String) {
        viewModelScope.launch {
            chatRepository.deleteSession(sessionId)
        }
    }

    fun retryConnection() {
        chatRepository.reconnect()
    }

    companion object {
        const val MAX_MESSAGE_LENGTH = 2000
    }
}
