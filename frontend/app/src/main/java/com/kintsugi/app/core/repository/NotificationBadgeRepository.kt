package com.kintsugi.app.core.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationBadgeRepository @Inject constructor() {

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    val badgeCount: StateFlow<Int> = unreadCount

    fun increment() {
        _unreadCount.update { it + 1 }
    }

    fun reset() {
        _unreadCount.update { 0 }
    }

    fun setCount(count: Int) {
        _unreadCount.update { count.coerceAtLeast(0) }
    }

    fun clear() = reset()
}
