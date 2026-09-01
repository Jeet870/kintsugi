package com.kintsugi.app.features.minigame.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kintsugi.app.R
import com.kintsugi.app.features.minigame.model.MatchCard
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Hilt ViewModel for the Mindful Match memory game.
 * Tracks card flips, moves count, elapsed time, and completion state.
 */
@HiltViewModel
class CalmMatchGameViewModel @Inject constructor() : ViewModel() {

    private val _cardsState = MutableStateFlow<List<MatchCard>>(emptyList())
    val cardsState: StateFlow<List<MatchCard>> = _cardsState.asStateFlow()

    private val _isCompletedState = MutableStateFlow(false)
    val isCompletedState: StateFlow<Boolean> = _isCompletedState.asStateFlow()

    private val _movesState = MutableStateFlow(0)
    val movesState: StateFlow<Int> = _movesState.asStateFlow()

    private val _elapsedSecondsState = MutableStateFlow(0)
    val elapsedSecondsState: StateFlow<Int> = _elapsedSecondsState.asStateFlow()

    private var selectedIndex1: Int? = null
    private var selectedIndex2: Int? = null
    private var isProcessing: Boolean = false
    private var timerJob: Job? = null

    init {
        restart()
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (!_isCompletedState.value) {
                delay(1000)
                _elapsedSecondsState.value += 1
            }
        }
    }

    /**
     * Handles card selection.
     */
    fun onCardTapped(index: Int) {
        if (isProcessing) return

        val currentList = _cardsState.value.toMutableList()
        if (index !in currentList.indices) return

        val card = currentList[index]
        if (card.isMatched || card.isFlipped) return

        // Flip the card
        currentList[index] = card.copy(isFlipped = true)
        _cardsState.value = currentList

        if (selectedIndex1 == null) {
            selectedIndex1 = index
        } else if (selectedIndex2 == null && index != selectedIndex1) {
            selectedIndex2 = index
            _movesState.value += 1
            checkForMatch()
        }
    }

    private fun checkForMatch() {
        val idx1 = selectedIndex1 ?: return
        val idx2 = selectedIndex2 ?: return

        isProcessing = true

        viewModelScope.launch {
            delay(500) // Brief pause to observe cards

            val currentList = _cardsState.value.toMutableList()
            val card1 = currentList[idx1]
            val card2 = currentList[idx2]

            if (card1.pairId == card2.pairId) {
                // Match!
                currentList[idx1] = card1.copy(isMatched = true)
                currentList[idx2] = card2.copy(isMatched = true)
                _cardsState.value = currentList

                // Check completion
                if (currentList.all { it.isMatched }) {
                    _isCompletedState.value = true
                    timerJob?.cancel()
                }
            } else {
                // Unflip without penalty
                currentList[idx1] = card1.copy(isFlipped = false)
                currentList[idx2] = card2.copy(isFlipped = false)
                _cardsState.value = currentList
            }

            selectedIndex1 = null
            selectedIndex2 = null
            isProcessing = false
        }
    }

    /**
     * Reshuffles and restarts the game.
     */
    fun restart() {
        timerJob?.cancel()
        val vectorIcons = listOf(
            R.drawable.ic_card_moon,
            R.drawable.ic_card_lotus,
            R.drawable.ic_card_feather,
            R.drawable.ic_card_leaf,
            R.drawable.ic_card_ocean,
            R.drawable.ic_card_mountain
        )
        val cards = mutableListOf<MatchCard>()

        var idCounter = 0
        vectorIcons.forEachIndexed { pairIndex, iconRes ->
            cards.add(MatchCard(id = ++idCounter, pairId = pairIndex, iconResId = iconRes))
            cards.add(MatchCard(id = ++idCounter, pairId = pairIndex, iconResId = iconRes))
        }

        cards.shuffle()
        _cardsState.value = cards
        _isCompletedState.value = false
        _movesState.value = 0
        _elapsedSecondsState.value = 0
        selectedIndex1 = null
        selectedIndex2 = null
        isProcessing = false

        startTimer()
    }
}
