package com.kintsugi.app.features.journal.data

import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.database.dao.JournalEntryDao
import com.kintsugi.app.core.database.entity.JournalEntryEntity
import com.kintsugi.app.core.model.AiAssistRequestDto
import com.kintsugi.app.core.model.JournalEntryDto
import com.kintsugi.app.core.model.JournalEntryRequest
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import timber.log.Timber
import java.time.Instant
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Single source of truth repository for managing journal reflections.
 */
@Singleton
class JournalRepository @Inject constructor(
    private val journalApiService: JournalApiService,
    private val journalEntryDao: JournalEntryDao,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    /**
     * Observes the complete list of journal entries ordered by pinned status and update timestamp.
     */
    fun observeEntries(): Flow<List<JournalEntryEntity>> = journalEntryDao.getAllJournalEntries()

    /**
     * Saves or updates a journal reflection.
     */
    suspend fun save(
        id: String?,
        title: String,
        content: String,
        moodTag: String = "Calm",
        isFavorite: Boolean = false,
        isPinned: Boolean = false
    ): Result<JournalEntryEntity> = withContext(ioDispatcher) {
        try {
            val request = JournalEntryRequest(
                title = title.trim(),
                content = content.trim(),
                moodTag = moodTag,
                isFavorite = isFavorite,
                isPinned = isPinned
            )

            val isLocalId = id != null && id.startsWith("local_journal_")

            val syncedEntity = if (id == null || isLocalId) {
                val dto = journalApiService.create(request)
                if (isLocalId && id != null) {
                    journalEntryDao.deleteJournalById(id)
                }
                dto.toEntity(isSynced = true)
            } else {
                try {
                    val dto = journalApiService.update(id = id, request = request)
                    dto.toEntity(isSynced = true)
                } catch (e: HttpException) {
                    if (e.code() == 404) {
                        val dto = journalApiService.create(request)
                        journalEntryDao.deleteJournalById(id)
                        dto.toEntity(isSynced = true)
                    } else throw e
                }
            }

            journalEntryDao.upsertJournalEntry(syncedEntity)
            Timber.d("Successfully saved and synced journal entry: ${syncedEntity.id}")
            Result.Success(syncedEntity)
        } catch (e: Exception) {
            Timber.e(e, "Error performing remote save for journal entry (id=$id). Applying local fallback.")

            val localId = id ?: "local_journal_" + UUID.randomUUID().toString().take(12)
            val fallbackEntity = JournalEntryEntity(
                id = localId,
                title = title.trim(),
                content = content.trim(),
                moodTag = moodTag,
                isFavorite = isFavorite,
                isPinned = isPinned,
                isEncrypted = true,
                createdAt = Instant.now(),
                updatedAt = Instant.now(),
                isSynced = false
            )
            journalEntryDao.upsertJournalEntry(fallbackEntity)

            Result.Success(fallbackEntity)
        }
    }

    /**
     * Toggles favorite status for an entry.
     */
    suspend fun toggleFavorite(id: String): Result<Unit> = withContext(ioDispatcher) {
        try {
            val existing = journalEntryDao.getJournalById(id) ?: return@withContext Result.Error(
                Exception("Entry not found"), "Journal entry not found"
            )
            val newFav = !existing.isFavorite
            val updatedNow = Instant.now()

            // Immediate local update
            journalEntryDao.updateFavorite(id, newFav, updatedNow)

            if (id.startsWith("local_journal_")) {
                save(
                    id = id,
                    title = existing.title,
                    content = existing.content,
                    moodTag = existing.moodTag,
                    isFavorite = newFav,
                    isPinned = existing.isPinned
                )
            } else {
                try {
                    journalApiService.update(id, JournalEntryRequest(
                        title = existing.title,
                        content = existing.content,
                        moodTag = existing.moodTag,
                        isFavorite = newFav,
                        isPinned = existing.isPinned
                    ))
                } catch (e: Exception) {
                    if (e is HttpException && e.code() == 404) {
                        save(
                            id = id,
                            title = existing.title,
                            content = existing.content,
                            moodTag = existing.moodTag,
                            isFavorite = newFav,
                            isPinned = existing.isPinned
                        )
                    } else {
                        Timber.w(e, "Remote favorite update failed, keeping local state")
                    }
                }
            }

            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e, "Failed to update favorite status")
        }
    }

    /**
     * Toggles pin status for an entry.
     */
    suspend fun togglePin(id: String): Result<Unit> = withContext(ioDispatcher) {
        try {
            val existing = journalEntryDao.getJournalById(id) ?: return@withContext Result.Error(
                Exception("Entry not found"), "Journal entry not found"
            )
            val newPin = !existing.isPinned
            val updatedNow = Instant.now()

            // Immediate local update
            journalEntryDao.updatePin(id, newPin, updatedNow)

            if (id.startsWith("local_journal_")) {
                save(
                    id = id,
                    title = existing.title,
                    content = existing.content,
                    moodTag = existing.moodTag,
                    isFavorite = existing.isFavorite,
                    isPinned = newPin
                )
            } else {
                try {
                    journalApiService.update(id, JournalEntryRequest(
                        title = existing.title,
                        content = existing.content,
                        moodTag = existing.moodTag,
                        isFavorite = existing.isFavorite,
                        isPinned = newPin
                    ))
                } catch (e: Exception) {
                    if (e is HttpException && e.code() == 404) {
                        save(
                            id = id,
                            title = existing.title,
                            content = existing.content,
                            moodTag = existing.moodTag,
                            isFavorite = existing.isFavorite,
                            isPinned = newPin
                        )
                    } else {
                        Timber.w(e, "Remote pin update failed, keeping local state")
                    }
                }
            }

            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e, "Failed to update pin status")
        }
    }

    /**
     * Generates a full structured AI journal draft (Title, Mood, Summary, Content).
     */
    suspend fun generateFullDraft(prompt: String): Map<String, String> = withContext(ioDispatcher) {
        try {
            journalApiService.generateFullDraft(mapOf("prompt" to prompt))
        } catch (e: Exception) {
            Timber.e(e, "Error generating full AI draft, using local fallback")
            mapOf(
                "title" to "Reflections of Today",
                "mood" to "Calm",
                "summary" to "A gentle moment of reflection and peace.",
                "content" to "Today, I take a slow deep breath and pause to listen to my thoughts. $prompt\n\nEvery emotion I feel is valid. I choose to grant myself patience and grace as I move forward step by step."
            )
        }
    }

    /**
     * Executes AI writing assistance request via backend API.
     */
    suspend fun aiAssist(
        action: String,
        content: String,
        prompt: String? = null
    ): Result<String> = withContext(ioDispatcher) {
        try {
            val response = journalApiService.aiAssist(
                AiAssistRequestDto(action = action, content = content, prompt = prompt)
            )
            Result.Success(response.result)
        } catch (e: Exception) {
            Timber.e(e, "AI assist request failed")
            val fallback = when (action) {
                "generate_title" -> "Mindful Reflections of Today"
                "summarize" -> "A serene journal entry reflecting on inner thoughts and growth."
                "rewrite_professional" -> content.trim() + " (Refined for clarity and structure.)"
                "rewrite_gentle" -> content.trim() + " (Be gentle with yourself; every step matters.)"
                "expand" -> content.trim() + "\n\nConsider asking yourself: What did this experience teach you about your resilience?"
                "shorten" -> content.take(150) + "..."
                else -> content.trim() + " Every small reflection builds peace."
            }
            Result.Success(fallback)
        }
    }

    /**
     * Deletes a journal entry.
     */
    suspend fun delete(id: String): Result<Unit> = withContext(ioDispatcher) {
        try {
            if (!id.startsWith("local_journal_")) {
                journalApiService.delete(id)
            }
            journalEntryDao.deleteJournalById(id)
            Result.Success(Unit)
        } catch (e: Exception) {
            journalEntryDao.deleteJournalById(id)
            Result.Error(e, "Entry deleted locally.")
        }
    }

    /**
     * Refreshes entries from backend.
     */
    suspend fun refreshEntries(): Result<Unit> = withContext(ioDispatcher) {
        try {
            val remoteDtos = journalApiService.list()
            val entities = remoteDtos.map { dto -> dto.toEntity(isSynced = true) }
            journalEntryDao.upsertJournalEntries(entities)
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e, "Could not refresh entries. Showing offline content.")
        }
    }

    private fun JournalEntryDto.toEntity(isSynced: Boolean): JournalEntryEntity {
        return JournalEntryEntity(
            id = id,
            title = title ?: "Untitled Reflection",
            content = content,
            moodTag = moodTag ?: "Calm",
            aiReflection = aiReflection,
            aiSummary = aiSummary,
            aiTitle = aiTitle,
            isFavorite = isFavorite ?: false,
            isPinned = isPinned ?: false,
            isEncrypted = isEncrypted ?: true,
            createdAt = Instant.ofEpochMilli(createdAt),
            updatedAt = Instant.ofEpochMilli(updatedAt),
            isSynced = isSynced
        )
    }
}
