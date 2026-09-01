package com.kintsugi.app.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import java.time.Instant

@Entity(
    tableName = "journal_entries",
    indices = [Index(value = ["updatedAt"])]
)
data class JournalEntryEntity(
    @PrimaryKey val id: String,
    val title: String,
    val content: String,
    val moodTag: String = "Calm",
    val aiReflection: String? = null,
    val aiSummary: String? = null,
    val aiTitle: String? = null,
    val isFavorite: Boolean = false,
    val isPinned: Boolean = false,
    val isEncrypted: Boolean = true,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
    val isSynced: Boolean = false
)
