package com.kintsugi.app.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.kintsugi.app.core.database.dao.JournalEntryDao
import com.kintsugi.app.core.database.dao.MoodEntryDao
import com.kintsugi.app.core.database.entity.JournalEntryEntity
import com.kintsugi.app.core.database.entity.MoodEntryEntity

import com.kintsugi.app.core.database.dao.NotificationDao
import com.kintsugi.app.core.database.entity.NotificationEntity

@Database(
    entities = [MoodEntryEntity::class, JournalEntryEntity::class, NotificationEntity::class],
    version = 4,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class KintsugiDatabase : RoomDatabase() {
    abstract fun moodEntryDao(): MoodEntryDao
    abstract fun journalEntryDao(): JournalEntryDao
    abstract fun notificationDao(): NotificationDao
}
