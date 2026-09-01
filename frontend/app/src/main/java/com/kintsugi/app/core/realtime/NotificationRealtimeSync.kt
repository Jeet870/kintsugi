package com.kintsugi.app.core.realtime

import com.kintsugi.app.core.repository.NotificationBadgeRepository
import com.kintsugi.app.di.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRealtimeSync @Inject constructor(
    private val realtimeEventBus: RealtimeEventBus,
    private val notificationBadgeRepository: NotificationBadgeRepository,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {
    private var job: Job? = null

    @Synchronized
    fun start(scope: CoroutineScope) {
        if (job != null && job?.isActive == true) return

        job = scope.launch(ioDispatcher) {
            try {
                realtimeEventBus.events.collect { event ->
                    if (event is RealtimeEvent.NotificationNew) {
                        notificationBadgeRepository.increment()
                    }
                }
            } catch (e: Exception) {
                Timber.d(e, "Error inside NotificationRealtimeSync collector")
            }
        }
    }

    fun stop() {
        job?.cancel()
        job = null
    }

    fun isRunning(): Boolean = job?.isActive == true
}
