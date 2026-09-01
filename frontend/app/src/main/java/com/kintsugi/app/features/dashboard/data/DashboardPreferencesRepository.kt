package com.kintsugi.app.features.dashboard.data

import android.content.Context
import android.content.SharedPreferences
import com.kintsugi.app.di.IoDispatcher
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Single source of truth repository managing Dashboard Quick Action card visibility and order.
 * Persists configuration asynchronously using SharedPreferences and exposes a reactive StateFlow.
 */
@Singleton
class DashboardPreferencesRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    @IoDispatcher private val ioDispatcher: CoroutineDispatcher
) {

    private val prefs: SharedPreferences = context.getSharedPreferences("kintsugi_dashboard_prefs", Context.MODE_PRIVATE)

    private val _actionsFlow = MutableStateFlow<List<QuickActionModel>>(emptyList())
    val actionsFlow: StateFlow<List<QuickActionModel>> = _actionsFlow.asStateFlow()

    init {
        loadPreferences()
    }

    fun loadPreferences() {
        val savedOrderStr = prefs.getString("action_order", null)
        val savedVisibleStr = prefs.getString("visible_actions", null)

        val orderedIds = if (!savedOrderStr.isNullOrEmpty()) {
            savedOrderStr.split(",")
        } else {
            QuickActionRegistry.DEFAULT_IDS
        }

        val visibleSet = if (!savedVisibleStr.isNullOrEmpty()) {
            savedVisibleStr.split(",").toSet()
        } else {
            QuickActionRegistry.DEFAULT_IDS.toSet()
        }

        val allMap = QuickActionRegistry.ALL_ACTIONS.associateBy { it.id }

        // Build list preserving saved order, appending any remaining actions
        val orderedList = mutableListOf<QuickActionModel>()
        orderedIds.forEach { id ->
            allMap[id]?.let { model ->
                orderedList.add(model.copy(isVisible = visibleSet.contains(id)))
            }
        }

        QuickActionRegistry.ALL_ACTIONS.forEach { action ->
            if (orderedList.none { it.id == action.id }) {
                orderedList.add(action.copy(isVisible = visibleSet.contains(action.id)))
            }
        }

        _actionsFlow.value = orderedList
    }

    suspend fun savePreferences(actions: List<QuickActionModel>) = withContext(ioDispatcher) {
        val orderStr = actions.joinToString(",") { it.id }
        val visibleStr = actions.filter { it.isVisible }.joinToString(",") { it.id }

        prefs.edit()
            .putString("action_order", orderStr)
            .putString("visible_actions", visibleStr)
            .apply()

        _actionsFlow.value = actions
    }

    suspend fun resetToDefault() = withContext(ioDispatcher) {
        prefs.edit()
            .remove("action_order")
            .remove("visible_actions")
            .apply()

        loadPreferences()
    }
}
