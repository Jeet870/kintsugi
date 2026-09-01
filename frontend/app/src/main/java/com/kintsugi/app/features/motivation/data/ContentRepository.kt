package com.kintsugi.app.features.motivation.data

import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.ContentDto
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Single source of truth repository for daily motivational content.
 *
 * ## Caching Strategy
 * Daily motivation content changes only once per day. It is fetched once at launch,
 * stored in memory via [contentState] (`StateFlow`), and shared across both the Welcome screen
 * and the Daily Motivation screen without duplicate network requests or Room DB persistence.
 *
 * @param contentApiService Remote Retrofit service for fetching daily content.
 * @param ioDispatcher Injected coroutine dispatcher for I/O tasks.
 */
@Singleton
class ContentRepository @Inject constructor(
    private val contentApiService: ContentApiService,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    private val repositoryScope = CoroutineScope(SupervisorJob() + ioDispatcher)

    private val _contentState = MutableStateFlow<Result<ContentDto>>(Result.Loading)
    val contentState: StateFlow<Result<ContentDto>> = _contentState.asStateFlow()

    private var hasFetchedThisSession = false

    init {
        // Fetch daily content on app launch
        fetchDailyContentInternal()
    }

    /**
     * Exposes today's quote as a reactive [Flow] of [Result.Success] or [Result.Error].
     * Used by the Welcome screen and Dashboard widgets.
     */
    fun getDailyQuote(): Flow<Result<String>> = contentState.map { result ->
        when (result) {
            is Result.Success -> Result.Success(result.data.quote)
            is Result.Error -> Result.Error(result.exception, result.message)
            is Result.Loading -> Result.Loading
            else -> Result.Loading
        }
    }

    /**
     * Refreshes daily content from the remote backend.
     */
    suspend fun refresh(): Result<Unit> = withContext(ioDispatcher) {
        hasFetchedThisSession = false
        fetchDailyContentInternal()
        Result.Success(Unit)
    }

    /**
     * Invalidates the in-memory cache to force a re-fetch on next query.
     */
    fun invalidateCache() {
        hasFetchedThisSession = false
        _contentState.value = Result.Loading
    }

    private fun fetchDailyContentInternal() {
        if (hasFetchedThisSession && _contentState.value is Result.Success) {
            Timber.d("Serving cached daily content for current session.")
            return
        }

        repositoryScope.launch {
            try {
                val remoteContent = contentApiService.getDailyContent()
                hasFetchedThisSession = true
                _contentState.value = Result.Success(remoteContent)
                Timber.d("Successfully fetched and cached daily motivational content.")
            } catch (e: Exception) {
                Timber.w(e, "Remote daily content fetch failed. Applying fallback content.")
                val fallbackContent = ContentDto(
                    quote = "Healing doesn't mean the damage never existed. It means the damage no longer controls your life.",
                    author = "Kintsugi Philosophy",
                    affirmations = listOf(
                        "I am enough just as I am.",
                        "Today is a fresh beginning.",
                        "I deserve peace and self-compassion.",
                        "Small steps lead to meaningful progress.",
                        "I choose kindness toward myself."
                    ),
                    selfCareTips = listOf(
                        "Take a peaceful 10-minute walk outside.",
                        "Drink a warm glass of water mindfully.",
                        "Write down one positive memory from this week.",
                        "Reach out to someone you love.",
                        "Spend five minutes practicing deep breathing."
                    )
                )
                _contentState.value = Result.Success(fallbackContent)
            }
        }
    }
}
