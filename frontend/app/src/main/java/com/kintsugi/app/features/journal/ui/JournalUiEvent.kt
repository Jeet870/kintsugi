package com.kintsugi.app.features.journal.ui

/**
 * Single-use UI event contract for Journal feature interactions.
 */
sealed interface JournalUiEvent {
    object Saved : JournalUiEvent
    data class Deleted(val entryId: String) : JournalUiEvent
    data class ValidationError(val message: String) : JournalUiEvent
    data class ShowMessage(val message: String) : JournalUiEvent
    data class NavigateToEditor(val entryId: String?) : JournalUiEvent
    object NavigateBack : JournalUiEvent
}
