package com.kintsugi.app.features.moodtracker

import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.database.dao.MoodEntryDao
import com.kintsugi.app.core.database.entity.MoodEntryEntity
import com.kintsugi.app.core.realtime.RealtimeEvent
import com.kintsugi.app.core.realtime.RealtimeEventBus
import com.kintsugi.app.di.IoDispatcher
import com.kintsugi.app.features.moodtracker.ui.model.AnalyticsPeriod
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import timber.log.Timber
import java.time.Instant
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MoodRepository @Inject constructor(
    private val moodEntryDao: MoodEntryDao,
    private val moodApiService: MoodApiService,
    private val realtimeEventBus: RealtimeEventBus,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {
    private val repositoryScope = CoroutineScope(SupervisorJob() + ioDispatcher)

    init {
        observeRealtimeEvents()
        syncPendingEntriesOnStartup()
    }

    fun observeMoodHistory(period: AnalyticsPeriod = AnalyticsPeriod.ALL): Flow<List<MoodEntryEntity>> {
        return if (period == AnalyticsPeriod.ALL) {
            moodEntryDao.getAllMoodEntries()
        } else {
            moodEntryDao.getMoodEntriesSince(period.getStartTimestamp())
        }
    }

    suspend fun getMoodEntryById(id: String): MoodEntryEntity? = moodEntryDao.getMoodEntryById(id)

    suspend fun deleteMoodEntry(id: String) {
        moodEntryDao.deleteMoodEntry(id)
    }

    suspend fun logMood(moodOptions: MoodOptions, note: String?): Result<MoodEntryEntity> {
        val entryId = "mood_" + UUID.randomUUID().toString().take(12)
        val optimisticEntry = MoodEntryEntity(
            id = entryId,
            moodType = moodOptions.apiValue,
            moodScore = moodOptions.chartValue,
            note = note?.takeIf { it.isNotBlank() },
            aiMessage = null,
            createdAt = Instant.now(),
            isSynced = false
        )

        moodEntryDao.upsertMoodEntry(optimisticEntry)
        Timber.d("Optimistic mood entry saved: $entryId")

        repositoryScope.launch {
            uploadMoodEntry(optimisticEntry)
        }

        return Result.Success(optimisticEntry)
    }

    private suspend fun uploadMoodEntry(entry: MoodEntryEntity) {
        try {
            val response = moodApiService.logMood(
                MoodLogRequest(
                    moodType = entry.moodType,
                    moodScore = entry.moodScore,
                    note = entry.note
                )
            )

            if (response.isSuccessful) {
                val dto = response.body()
                if (dto != null) {
                    val syncedEntry = entry.copy(
                        id = dto.id,
                        aiMessage = dto.aiMessage ?: entry.aiMessage,
                        isSynced = true
                    )
                    if (dto.id != entry.id) {
                        moodEntryDao.deleteMoodEntry(entry.id)
                    }
                    moodEntryDao.upsertMoodEntry(syncedEntry)
                    Timber.d("Mood entry synced with backend ID: ${dto.id}")
                }
            } else {
                Timber.w("Mood log upload failed: ${response.code()}")
            }
        } catch (e: Exception) {
            Timber.e(e, "Network error uploading mood entry. Will retry when connected.")
        }
    }

    private fun observeRealtimeEvents() {
        repositoryScope.launch {
            realtimeEventBus.events.collect { event ->
                if (event is RealtimeEvent.MoodEntryUpdated) {
                    Timber.d("Realtime mood.entry_updated received for ID: ${event.moodId}")
                    if (event.aiMessage != null) {
                        moodEntryDao.patchAiMessage(event.moodId, event.aiMessage)
                    }
                }
            }
        }
    }

    suspend fun fetchLatestHistoryFromRemote(): Result<Unit> {
        return try {
            val response = moodApiService.getMoodHistory()
            if (response.isSuccessful) {
                val dtos = response.body() ?: emptyList()
                val entities = dtos.map { dto ->
                    MoodEntryEntity(
                        id = dto.id,
                        moodType = dto.moodType,
                        moodScore = dto.moodScore,
                        note = dto.note,
                        aiMessage = dto.aiMessage,
                        createdAt = Instant.ofEpochMilli(dto.createdAt),
                        isSynced = true
                    )
                }
                moodEntryDao.upsertMoodEntries(entities)
                Result.Success(Unit)
            } else {
                Result.Error(Exception("HTTP ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    private fun syncPendingEntriesOnStartup() {
        repositoryScope.launch {
            try {
                fetchLatestHistoryFromRemote()
            } catch (e: Exception) {
                Timber.w(e, "Initial remote mood sync failed; proceeding with offline cache.")
            }
        }
    }
}
