package com.kintsugi.app.di

import com.kintsugi.app.features.aicompanion.data.ChatApiService
import com.kintsugi.app.features.auth.data.AuthApiService
import com.kintsugi.app.features.emergency.data.EmergencyApiService
import com.kintsugi.app.features.journal.data.JournalApiService
import com.kintsugi.app.features.moodtracker.MoodApiService
import com.kintsugi.app.features.motivation.data.ContentApiService
import com.kintsugi.app.features.profile.data.ProfileApiService
import com.kintsugi.app.features.settings.data.SettingsApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService = retrofit.create(AuthApiService::class.java)

    @Provides
    @Singleton
    fun provideMoodApiService(retrofit: Retrofit): MoodApiService = retrofit.create(MoodApiService::class.java)

    @Provides
    @Singleton
    fun provideChatApiService(retrofit: Retrofit): ChatApiService = retrofit.create(ChatApiService::class.java)

    @Provides
    @Singleton
    fun provideJournalApiService(retrofit: Retrofit): JournalApiService = retrofit.create(JournalApiService::class.java)

    @Provides
    @Singleton
    fun provideContentApiService(retrofit: Retrofit): ContentApiService = retrofit.create(ContentApiService::class.java)

    @Provides
    @Singleton
    fun provideEmergencyApiService(retrofit: Retrofit): EmergencyApiService = retrofit.create(EmergencyApiService::class.java)

    @Provides
    @Singleton
    fun provideProfileApiService(retrofit: Retrofit): ProfileApiService = retrofit.create(ProfileApiService::class.java)

    @Provides
    @Singleton
    fun provideSettingsApiService(retrofit: Retrofit): SettingsApiService = retrofit.create(SettingsApiService::class.java)
}
