package com.kintsugi.app.core.database.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MoodEntryDao {

    @Upsert
    suspend fun upsertMoodEntry(entry: MoodEntryEntity)

    @Upsert
    suspend fun upsertMoodEntries(entries: List<MoodEntryEntity>)

    @Query("UPDATE mood_entries SET aiMessage = :aiMessage WHERE id = :id")
    suspend fun patchAiMessage(id: String, aiMessage: String)

    @Query("SELECT * FROM mood_entries ORDER BY createdAt DESC")
    fun getAllMoodEntries(): Flow<List<MoodEntryEntity>>

    @Query("SELECT * FROM mood_entries WHERE createdAt >= :sinceTimestamp ORDER BY createdAt DESC")
    fun getMoodEntriesSince(sinceTimestamp: Long): Flow<List<MoodEntryEntity>>

    @Query("SELECT * FROM mood_entries WHERE id = :id")
    suspend fun getMoodEntryById(id: String): MoodEntryEntity?

    @Query("DELETE FROM mood_entries WHERE id = :id")
    suspend fun deleteMoodEntry(id: String)

    @Query("DELETE FROM mood_entries")
    suspend fun clearAll()
}
