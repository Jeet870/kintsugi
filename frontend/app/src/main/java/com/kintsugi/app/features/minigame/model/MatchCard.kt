package com.kintsugi.app.features.minigame.model

import com.kintsugi.app.R

/**
 * Data model representing a single memory match card with vector icon resource.
 */
data class MatchCard(
    val id: Int,
    val pairId: Int,
    val iconResId: Int = R.drawable.ic_card_lotus,
    val isFlipped: Boolean = false,
    val isMatched: Boolean = false
)
