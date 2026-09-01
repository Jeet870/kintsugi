package com.kintsugi.app.features.notification.data

import com.kintsugi.app.R
import com.kintsugi.app.core.database.dao.NotificationDao
import com.kintsugi.app.core.database.entity.NotificationEntity
import com.kintsugi.app.core.model.NotificationDto
import com.kintsugi.app.core.model.NotificationSection
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Single Source of Truth Repository for managing Notifications via Room DB & Network API.
 * Calls backend Notification API endpoints while maintaining smooth offline Room caching.
 */
@Singleton
class NotificationRepository @Inject constructor(
    private val notificationApiService: NotificationApiService,
    private val notificationDao: NotificationDao,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    private val repositoryScope = CoroutineScope(ioDispatcher)

    val notificationsState: StateFlow<List<NotificationDto>> =
        notificationDao.getAllNotifications()
            .map { list -> list.map { it.toDto() } }
            .stateIn(
                scope = repositoryScope,
                started = SharingStarted.Eagerly,
                initialValue = emptyList()
            )

    val unreadCountState: StateFlow<Int> =
        notificationDao.getUnreadCount()
            .stateIn(
                scope = repositoryScope,
                started = SharingStarted.Eagerly,
                initialValue = 0
            )

    init {
        seedInitialNotificationsIfEmpty()
        fetchNotificationsFromApi()
    }

    fun fetchNotificationsFromApi() {
        repositoryScope.launch {
            try {
                val remoteList = notificationApiService.getNotifications()
                if (remoteList.isNotEmpty()) {
                    val entities = remoteList.map { dto ->
                        NotificationEntity(
                            id = dto.id.toString(),
                            title = dto.title,
                            description = dto.message.ifBlank { dto.body },
                            timeAgo = "Recently",
                            section = NotificationSection.TODAY.name,
                            iconResId = R.drawable.ic_sparkles,
                            isRead = dto.isRead,
                            createdAt = System.currentTimeMillis()
                        )
                    }
                    notificationDao.insertNotifications(entities)
                    Timber.d("Successfully fetched ${remoteList.size} notifications from API")
                }
            } catch (e: Exception) {
                Timber.e(e, "Error fetching notifications from API. Using Room cache.")
            }
        }
    }

    private fun seedInitialNotificationsIfEmpty() {
        repositoryScope.launch {
            val initialList = listOf(
                NotificationEntity(
                    id = "notif_1",
                    title = "Mood Check-In Reminder",
                    description = "Take a moment for yourself. Log how you feel right now.",
                    timeAgo = "5 min ago",
                    section = NotificationSection.TODAY.name,
                    iconResId = R.drawable.ic_mood_filled,
                    isRead = false,
                    createdAt = System.currentTimeMillis()
                ),
                NotificationEntity(
                    id = "notif_2",
                    title = "AI Companion Reflection Ready",
                    description = "Your empathetic AI companion shared a new grounding insight for you.",
                    timeAgo = "1 hour ago",
                    section = NotificationSection.TODAY.name,
                    iconResId = R.drawable.ic_sparkles,
                    isRead = false,
                    createdAt = System.currentTimeMillis() - 3600_000
                ),
                NotificationEntity(
                    id = "notif_3",
                    title = "Streak Record Unlocked ✦",
                    description = "Congratulations! You've maintained a 2-day mindfulness streak.",
                    timeAgo = "Yesterday",
                    section = NotificationSection.YESTERDAY.name,
                    iconResId = R.drawable.ic_streak_fire,
                    isRead = true,
                    createdAt = System.currentTimeMillis() - 86400_000
                ),
                NotificationEntity(
                    id = "notif_4",
                    title = "New Guided Breathing Exercise",
                    description = "Try the 4-4-6 calming breathing exercise for instant stress relief.",
                    timeAgo = "2 days ago",
                    section = NotificationSection.EARLIER.name,
                    iconResId = R.drawable.ic_breathing,
                    isRead = true,
                    createdAt = System.currentTimeMillis() - 172800_000
                )
            )
            notificationDao.insertNotifications(initialList)
        }
    }

    suspend fun markAllAsRead() = withContext(ioDispatcher) {
        try {
            notificationApiService.markAllAsRead()
        } catch (e: Exception) {
            Timber.e(e, "Failed to send markAllAsRead to API")
        }
        notificationDao.markAllAsRead()
    }

    suspend fun markAsRead(notificationId: String) = withContext(ioDispatcher) {
        try {
            notificationApiService.markAsRead(notificationId)
        } catch (e: Exception) {
            Timber.e(e, "Failed to send markAsRead ($notificationId) to API")
        }
        notificationDao.markAsRead(notificationId)
    }

    suspend fun clearAll() = withContext(ioDispatcher) {
        try {
            notificationApiService.clearAllNotifications()
        } catch (e: Exception) {
            Timber.e(e, "Failed to clear notifications via API")
        }
        notificationDao.deleteAllNotifications()
    }
}
