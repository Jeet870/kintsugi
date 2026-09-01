package com.kintsugi.app.features.journal.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.database.entity.JournalEntryEntity
import com.kintsugi.app.features.journal.data.JournalRepository
import com.kintsugi.app.di.IoDispatcher
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import timber.log.Timber
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import javax.inject.Inject

data class JournalStats(
    val totalEntries: Int = 0,
    val streakDays: Int = 0,
    val favoriteCount: Int = 0
)

@HiltViewModel
class JournalViewModel @Inject constructor(
    private val journalRepository: JournalRepository,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _currentFilter = MutableStateFlow(JournalFilter.ALL)
    val currentFilter: StateFlow<JournalFilter> = _currentFilter.asStateFlow()

    private val _selectedEntry = MutableStateFlow<JournalEntryEntity?>(null)
    val selectedEntry: StateFlow<JournalEntryEntity?> = _selectedEntry.asStateFlow()

    private val _isSaving = MutableStateFlow(false)
    val isSaving: StateFlow<Boolean> = _isSaving.asStateFlow()

    private val _isAiLoading = MutableStateFlow(false)
    val isAiLoading: StateFlow<Boolean> = _isAiLoading.asStateFlow()

    private val _aiResult = MutableStateFlow<String?>(null)
    val aiResult: StateFlow<String?> = _aiResult.asStateFlow()

    private val _uiEvent = MutableSharedFlow<JournalUiEvent>()
    val uiEvent: SharedFlow<JournalUiEvent> = _uiEvent.asSharedFlow()

    val entriesState: StateFlow<Result<List<JournalEntryEntity>>> =
        combine(
            journalRepository.observeEntries(),
            _searchQuery,
            _currentFilter
        ) { entries, query, filter ->
            var list = entries

            // 1. Search Query Filter
            if (query.isNotBlank()) {
                list = list.filter { entry ->
                    entry.title.contains(query, ignoreCase = true) ||
                    entry.content.contains(query, ignoreCase = true) ||
                    entry.moodTag.contains(query, ignoreCase = true)
                }
            }

            // 2. Journal Filter Category
            val today = LocalDate.now()
            val zone = ZoneId.systemDefault()

            list = when (filter) {
                JournalFilter.ALL -> list
                JournalFilter.TODAY -> list.filter {
                    it.createdAt.atZone(zone).toLocalDate() == today
                }
                JournalFilter.YESTERDAY -> list.filter {
                    it.createdAt.atZone(zone).toLocalDate() == today.minusDays(1)
                }
                JournalFilter.THIS_WEEK, JournalFilter.LAST_7_DAYS -> list.filter {
                    val date = it.createdAt.atZone(zone).toLocalDate()
                    !date.isBefore(today.minusDays(7))
                }
                JournalFilter.THIS_MONTH, JournalFilter.LAST_30_DAYS -> list.filter {
                    val date = it.createdAt.atZone(zone).toLocalDate()
                    !date.isBefore(today.minusDays(30))
                }
                JournalFilter.LAST_90_DAYS -> list.filter {
                    val date = it.createdAt.atZone(zone).toLocalDate()
                    !date.isBefore(today.minusDays(90))
                }
                JournalFilter.FAVORITES -> list.filter { it.isFavorite }
                JournalFilter.PINNED -> list.filter { it.isPinned }
                JournalFilter.AI_GENERATED -> list.filter { !it.aiReflection.isNullOrBlank() || it.title.lowercase().contains("ai") }
                JournalFilter.MOOD_HAPPY -> list.filter { it.moodTag.equals("Happy", ignoreCase = true) }
                JournalFilter.MOOD_CALM -> list.filter { it.moodTag.equals("Calm", ignoreCase = true) }
                JournalFilter.MOOD_SAD -> list.filter { it.moodTag.equals("Sad", ignoreCase = true) }
                JournalFilter.MOOD_ANXIOUS -> list.filter { it.moodTag.equals("Anxious", ignoreCase = true) }
                JournalFilter.MOOD_ANGRY -> list.filter { it.moodTag.equals("Angry", ignoreCase = true) }
                JournalFilter.MOOD_TIRED -> list.filter { it.moodTag.equals("Tired", ignoreCase = true) }
            }

            list
        }
        .map { filteredList ->
            Result.Success(filteredList) as Result<List<JournalEntryEntity>>
        }
        .catch { e ->
            Timber.e(e, "Error observing journal entries from Room database")
            emit(Result.Error(e, "Failed to load journal reflections"))
        }
        .stateIn(
            scope = viewModelScope,
            started = kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5_000),
            initialValue = Result.Loading
        )

    val statsState: StateFlow<JournalStats> =
        journalRepository.observeEntries()
            .map { entries ->
                val total = entries.size
                val favs = entries.count { it.isFavorite }
                val streak = calculateStreak(entries)
                JournalStats(
                    totalEntries = total,
                    streakDays = streak,
                    favoriteCount = favs
                )
            }
            .stateIn(
                scope = viewModelScope,
                started = kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5_000),
                initialValue = JournalStats()
            )

    init {
        refresh()
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setFilter(filter: JournalFilter) {
        _currentFilter.value = filter
    }

    fun selectEntry(id: String?) {
        if (id == null) {
            _selectedEntry.value = null
            return
        }

        val currentList = (entriesState.value as? Result.Success)?.data
        val cachedEntry = currentList?.find { it.id == id }

        if (cachedEntry != null) {
            _selectedEntry.value = cachedEntry
        } else {
            viewModelScope.launch(ioDispatcher) {
                _selectedEntry.value = currentList?.firstOrNull { it.id == id }
            }
        }
    }

    fun generateFullAiDraft(
        prompt: String,
        onComplete: (title: String, content: String, mood: String, summary: String) -> Unit
    ) {
        viewModelScope.launch(ioDispatcher) {
            _isAiLoading.value = true
            val res = journalRepository.generateFullDraft(prompt)
            _isAiLoading.value = false

            val title = res["title"] ?: "Reflections of Today"
            val content = res["content"] ?: "Today I take a moment to reflect..."
            val mood = res["mood"] ?: "Calm"
            val summary = res["summary"] ?: ""

            viewModelScope.launch {
                onComplete(title, content, mood, summary)
            }
        }
    }

    fun save(
        title: String,
        content: String,
        moodTag: String = "Calm",
        isFavorite: Boolean = false,
        isPinned: Boolean = false
    ) {
        val trimmedContent = content.trim()
        if (trimmedContent.isBlank()) {
            return
        }

        viewModelScope.launch(ioDispatcher) {
            _isSaving.value = true
            try {
                val currentId = _selectedEntry.value?.id
                val result = journalRepository.save(
                    id = currentId,
                    title = title.trim(),
                    content = trimmedContent,
                    moodTag = moodTag,
                    isFavorite = isFavorite,
                    isPinned = isPinned
                )

                _isSaving.value = false

                when (result) {
                    is Result.Success -> {
                        _selectedEntry.value = result.data
                        _uiEvent.emit(JournalUiEvent.Saved)
                    }
                    is Result.Error -> {
                        val msg = result.message ?: "Failed to save journal reflection."
                        _uiEvent.emit(JournalUiEvent.ShowMessage(msg))
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                _isSaving.value = false
                _uiEvent.emit(JournalUiEvent.ShowMessage("An error occurred while saving."))
            }
        }
    }

    fun toggleFavorite(id: String) {
        viewModelScope.launch(ioDispatcher) {
            journalRepository.toggleFavorite(id)
        }
    }

    fun togglePin(id: String) {
        viewModelScope.launch(ioDispatcher) {
            journalRepository.togglePin(id)
        }
    }

    fun executeAiAssist(action: String, content: String, prompt: String? = null) {
        viewModelScope.launch(ioDispatcher) {
            _isAiLoading.value = true
            _aiResult.value = null

            val result = journalRepository.aiAssist(action = action, content = content, prompt = prompt)
            _isAiLoading.value = false

            when (result) {
                is Result.Success -> {
                    _aiResult.value = result.data
                }
                is Result.Error -> {
                    _uiEvent.emit(JournalUiEvent.ShowMessage("AI assistant is offline. Please check your network."))
                }
                else -> {}
            }
        }
    }

    fun clearAiResult() {
        _aiResult.value = null
    }

    fun delete(id: String) {
        viewModelScope.launch(ioDispatcher) {
            try {
                val result = journalRepository.delete(id)
                when (result) {
                    is Result.Success -> {
                        if (_selectedEntry.value?.id == id) {
                            _selectedEntry.value = null
                        }
                        _uiEvent.emit(JournalUiEvent.Deleted(id))
                    }
                    is Result.Error -> {
                        _uiEvent.emit(JournalUiEvent.ShowMessage(result.message ?: "Failed to delete entry."))
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                _uiEvent.emit(JournalUiEvent.ShowMessage("An error occurred while deleting."))
            }
        }
    }

    fun refresh() {
        viewModelScope.launch(ioDispatcher) {
            journalRepository.refreshEntries()
        }
    }

    private fun calculateStreak(entries: List<JournalEntryEntity>): Int {
        if (entries.isEmpty()) return 0
        val dates = entries.map {
            it.createdAt.atZone(ZoneId.systemDefault()).toLocalDate()
        }.distinct().sortedDescending()

        val today = LocalDate.now()
        val yesterday = today.minusDays(1)

        if (dates.firstOrNull() != today && dates.firstOrNull() != yesterday) {
            return 0
        }

        var streak = 0
        var checkDate = dates.first()

        for (d in dates) {
            if (d == checkDate) {
                streak++
                checkDate = checkDate.minusDays(1)
            } else {
                break
            }
        }
        return streak
    }
}
