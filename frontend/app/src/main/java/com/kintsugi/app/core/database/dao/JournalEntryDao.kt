package com.kintsugi.app.core.database.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Query
import androidx.room.Upsert
import com.kintsugi.app.core.database.entity.JournalEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface JournalEntryDao {

    @Upsert
    suspend fun upsertJournalEntry(entry: JournalEntryEntity)

    @Upsert
    suspend fun upsertJournalEntries(entries: List<JournalEntryEntity>)

    @Delete
    suspend fun deleteJournalEntry(entry: JournalEntryEntity)

    @Query("DELETE FROM journal_entries WHERE id = :id")
    suspend fun deleteJournalById(id: String)

    @Query("SELECT * FROM journal_entries WHERE id = :id")
    suspend fun getJournalById(id: String): JournalEntryEntity?

    @Query("SELECT * FROM journal_entries ORDER BY isPinned DESC, updatedAt DESC")
    fun getAllJournalEntries(): Flow<List<JournalEntryEntity>>

    @Query("UPDATE journal_entries SET isFavorite = :isFavorite, updatedAt = :updatedAt WHERE id = :id")
    suspend fun updateFavorite(id: String, isFavorite: Boolean, updatedAt: java.time.Instant)

    @Query("UPDATE journal_entries SET isPinned = :isPinned, updatedAt = :updatedAt WHERE id = :id")
    suspend fun updatePin(id: String, isPinned: Boolean, updatedAt: java.time.Instant)

    @Query("DELETE FROM journal_entries")
    suspend fun clearAll()
}
