package com.kintsugi.app.di

import android.content.Context
import androidx.room.Room
import com.kintsugi.app.core.common.Constants
import com.kintsugi.app.core.database.KintsugiDatabase
import com.kintsugi.app.core.database.dao.JournalEntryDao
import com.kintsugi.app.core.database.dao.MoodEntryDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideKintsugiDatabase(@ApplicationContext context: Context): KintsugiDatabase {
        return Room.databaseBuilder(
            context,
            KintsugiDatabase::class.java,
            Constants.DATABASE_NAME
        )
        .fallbackToDestructiveMigration()
        .build()
    }

    @Provides
    fun provideMoodEntryDao(database: KintsugiDatabase): MoodEntryDao {
        return database.moodEntryDao()
    }

    @Provides
    fun provideJournalEntryDao(database: KintsugiDatabase): JournalEntryDao {
        return database.journalEntryDao()
    }

    @Provides
    fun provideNotificationDao(database: KintsugiDatabase): com.kintsugi.app.core.database.dao.NotificationDao {
        return database.notificationDao()
    }
}
