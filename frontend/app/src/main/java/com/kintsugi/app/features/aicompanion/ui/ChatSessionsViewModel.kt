package com.kintsugi.app.features.aicompanion.ui

import android.text.format.DateUtils
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.ChatSessionDto
import com.kintsugi.app.core.ui.base.BaseViewModel
import com.kintsugi.app.features.aicompanion.data.ChatRepository
import com.kintsugi.app.features.aicompanion.ui.adapter.SessionListItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class SessionNavEvent {
    data class OpenChatWindow(val sessionId: String, val title: String?) : SessionNavEvent()
}

@HiltViewModel
class ChatSessionsViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : BaseViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _navEvents = MutableSharedFlow<SessionNavEvent>(extraBufferCapacity = 5)
    val navEvents: SharedFlow<SessionNavEvent> = _navEvents.asSharedFlow()

    val sessionListItems: StateFlow<Result<List<SessionListItem>>> = combine(
        chatRepository.sessionsState,
        _searchQuery
    ) { result: Result<List<ChatSessionDto>>, query: String ->
        when (result) {
            is Result.Loading -> Result.Loading
            is Result.Error -> Result.Error(result.exception)
            is Result.Empty -> Result.Success(emptyList())
            is Result.Success -> {
                val filtered = if (query.isBlank()) {
                    result.data
                } else {
                    val q = query.trim().lowercase()
                    result.data.filter { s ->
                        (s.title?.lowercase()?.contains(q) == true) ||
                                (s.lastMessagePreview?.lowercase()?.contains(q) == true)
                    }
                }
                Result.Success(groupSessionsByDate(filtered))
            }
            else -> Result.Success(emptyList())
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = Result.Loading
    )

    init {
        refreshSessions()
    }

    fun refreshSessions() {
        viewModelScope.launch {
            chatRepository.refreshSessions()
        }
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun clearSearchQuery() {
        _searchQuery.value = ""
    }

    fun createNewSession() {
        viewModelScope.launch {
            val result = chatRepository.startSession()
            if (result is Result.Success) {
                val session = result.data
                _navEvents.emit(SessionNavEvent.OpenChatWindow(session.id, session.title))
            }
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

    private fun groupSessionsByDate(sessions: List<ChatSessionDto>): List<SessionListItem> {
        if (sessions.isEmpty()) return emptyList()

        val now = System.currentTimeMillis()
        val todayList = mutableListOf<ChatSessionDto>()
        val yesterdayList = mutableListOf<ChatSessionDto>()
        val thisWeekList = mutableListOf<ChatSessionDto>()
        val earlierList = mutableListOf<ChatSessionDto>()

        val sorted = sessions.sortedByDescending { it.updatedAt }

        sorted.forEach { session ->
            val diffMs = now - session.updatedAt
            val daysAgo = diffMs / DateUtils.DAY_IN_MILLIS

            when {
                DateUtils.isToday(session.updatedAt) || daysAgo < 1 -> todayList.add(session)
                daysAgo < 2 -> yesterdayList.add(session)
                daysAgo < 7 -> thisWeekList.add(session)
                else -> earlierList.add(session)
            }
        }

        val items = mutableListOf<SessionListItem>()

        if (todayList.isNotEmpty()) {
            items.add(SessionListItem.HeaderItem("Today"))
            todayList.forEach { items.add(SessionListItem.SessionCardItem(it)) }
        }

        if (yesterdayList.isNotEmpty()) {
            items.add(SessionListItem.HeaderItem("Yesterday"))
            yesterdayList.forEach { items.add(SessionListItem.SessionCardItem(it)) }
        }

        if (thisWeekList.isNotEmpty()) {
            items.add(SessionListItem.HeaderItem("This Week"))
            thisWeekList.forEach { items.add(SessionListItem.SessionCardItem(it)) }
        }

        if (earlierList.isNotEmpty()) {
            items.add(SessionListItem.HeaderItem("Earlier"))
            earlierList.forEach { items.add(SessionListItem.SessionCardItem(it)) }
        }

        return items
    }
}
