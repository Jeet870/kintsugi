package com.kintsugi.app.features.emergency.data

import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.HelplineDto
import com.kintsugi.app.core.model.HelplinePriority
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository responsible for managing Emergency Help resources and calming tips.
 *
 * ## Caching Strategy
 * Emergency helplines are fetched once per session and cached in memory. If remote fetch
 * fails, robust offline fallback helplines are immediately served to guarantee immediate support.
 */
@Singleton
class EmergencyRepository @Inject constructor(
    private val emergencyApiService: EmergencyApiService,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    private val repositoryScope = CoroutineScope(SupervisorJob() + ioDispatcher)

    private val _helplinesState = MutableStateFlow<Result<List<HelplineDto>>>(Result.Loading)
    val helplinesState: StateFlow<Result<List<HelplineDto>>> = _helplinesState.asStateFlow()

    private val _calmingTipsState = MutableStateFlow<Result<List<String>>>(Result.Loading)
    val calmingTipsState: StateFlow<Result<List<String>>> = _calmingTipsState.asStateFlow()

    private var hasFetchedThisSession = false

    init {
        fetchEmergencyDataInternal()
    }

    /**
     * Force refreshes emergency helplines and calming tips.
     */
    suspend fun refresh(): Result<Unit> = withContext(ioDispatcher) {
        hasFetchedThisSession = false
        fetchEmergencyDataInternal()
        Result.Success(Unit)
    }

    private fun fetchEmergencyDataInternal() {
        if (hasFetchedThisSession && _helplinesState.value is Result.Success) {
            return
        }

        repositoryScope.launch {
            // 1. Fetch Helplines
            try {
                val remoteHelplines = emergencyApiService.getHelplines("US")
                _helplinesState.value = Result.Success(remoteHelplines)
                Timber.d("Successfully fetched remote emergency helplines.")
            } catch (e: Exception) {
                Timber.w(e, "Remote helplines fetch failed. Using fallback crisis contacts.")
                _helplinesState.value = Result.Success(getFallbackHelplines())
            }

            // 2. Fetch Calming Tips
            try {
                val remoteTips = emergencyApiService.getCalmingTips()
                _calmingTipsState.value = Result.Success(remoteTips)
            } catch (e: Exception) {
                Timber.w(e, "Remote calming tips fetch failed. Using fallback grounding tips.")
                _calmingTipsState.value = Result.Success(getFallbackCalmingTips())
            }

            hasFetchedThisSession = true
        }
    }

    private fun getFallbackHelplines(): List<HelplineDto> {
        return listOf(
            HelplineDto(
                id = "988_lifeline",
                name = "988 Suicide & Crisis Lifeline",
                phoneNumber = "988",
                hours = "24/7 • Free & Confidential",
                description = "Immediate 24/7 phone and text support for anyone in emotional distress.",
                category = "Crisis Support",
                country = "US",
                priority = HelplinePriority.HIGH
            ),
            HelplineDto(
                id = "crisis_text",
                name = "Crisis Text Line",
                phoneNumber = "741741",
                hours = "24/7 • Text HOME",
                description = "Free 24/7 crisis support via text messaging with trained crisis counselors.",
                category = "Text Support",
                country = "US",
                priority = HelplinePriority.HIGH
            ),
            HelplineDto(
                id = "veterans_crisis",
                name = "Veterans Crisis Line",
                phoneNumber = "988",
                hours = "24/7 • Press 1",
                description = "Specialized support for military veterans, service members, and their families.",
                category = "Veterans Support",
                country = "US",
                priority = HelplinePriority.MEDIUM
            ),
            HelplineDto(
                id = "trevor_project",
                name = "The Trevor Project",
                phoneNumber = "1-866-488-7386",
                hours = "24/7 • LGBTQ+ Support",
                description = "Crisis intervention and suicide prevention services for LGBTQ young people.",
                category = "Youth & LGBTQ+",
                country = "US",
                priority = HelplinePriority.MEDIUM
            )
        )
    }

    private fun getFallbackCalmingTips(): List<String> = listOf(
        "Take five slow, deep breaths. Inhale for 4 seconds, exhale for 6 seconds.",
        "Drink a warm glass of water slowly and feel the temperature.",
        "Look around the room: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
        "Place your hand gently over your heart and feel your breathing slow down.",
        "Call or text a trusted friend, family member, or healthcare professional."
    )
}
