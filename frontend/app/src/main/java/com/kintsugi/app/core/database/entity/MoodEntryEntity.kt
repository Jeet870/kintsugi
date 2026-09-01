package com.kintsugi.app.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.kintsugi.app.core.common.MoodOptions
import java.time.Instant

@Entity(
    tableName = "mood_entries",
    indices = [Index(value = ["createdAt"])]
)
data class MoodEntryEntity(
    @PrimaryKey val id: String,
    val moodType: String,
    val moodScore: Int = 3,
    val note: String? = null,
    val aiMessage: String? = null,
    val createdAt: Instant = Instant.now(),
    val isSynced: Boolean = false
)

typealias MoodEntry = MoodEntryEntity
typealias Mood = MoodOptions

val MoodEntryEntity.mood: MoodOptions
    get() = MoodOptions.fromApiValue(moodType)
