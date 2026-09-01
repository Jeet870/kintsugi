package com.kintsugi.app.features.motivation.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.ContentDto
import com.kintsugi.app.features.motivation.data.ContentRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel managing UI state for the Daily Motivation screen.
 *
 * Consumes shared session-cached content from [ContentRepository].
 */
@HiltViewModel
class DailyMotivationViewModel @Inject constructor(
    private val contentRepository: ContentRepository
) : ViewModel() {

    /**
     * State stream of daily motivational content (quote, affirmations, self-care tips).
     */
    val contentState: StateFlow<Result<ContentDto>> = contentRepository.contentState

    /**
     * Force refreshes the daily content.
     */
    fun refresh() {
        viewModelScope.launch {
            contentRepository.refresh()
        }
    }
}
