package com.kintsugi.app.features.dashboard.ui

import android.graphics.Color
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.view.View
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.GridLayoutManager
import com.kintsugi.app.core.navigation.Destinations
import com.kintsugi.app.core.navigation.navigateSafe
import com.kintsugi.app.core.ui.BaseFragment
import com.kintsugi.app.core.ui.applyEdgeToEdgeInsets
import com.kintsugi.app.databinding.FragmentDashboardBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * Flagship Kintsugi Dashboard & Mindfulness Sanctuary Fragment.
 * Redesigned with dynamic, customizable Quick Action card grid, reorderable customization drawer,
 * personalized header, Today's Reflection hero card with glowing orb, and Crisis Support banner.
 */
@AndroidEntryPoint
class DashboardFragment : BaseFragment<FragmentDashboardBinding>(FragmentDashboardBinding::inflate) {

    private val viewModel: DashboardViewModel by viewModels()
    private lateinit var quickActionAdapter: QuickActionAdapter

    override fun setupViews() {
        setupWindowInsets()
        setupQuickActionsGrid()
        setupActions()
        observeViewModel()
    }

    private fun setupWindowInsets() {
        binding.headerView.applyEdgeToEdgeInsets(
            applyTop = true,
            applyBottom = false,
            additionalTopPx = (4 * resources.displayMetrics.density).toInt()
        )
        com.kintsugi.app.core.ui.widget.KintsugiScreenInsets.applyBottomNavigationPadding(binding.dashboardScrollView, 100)
    }

    private fun setupQuickActionsGrid() {
        quickActionAdapter = QuickActionAdapter { destinationId ->
            navigateSafe(destinationId)
        }

        binding.rvQuickActions.apply {
            layoutManager = GridLayoutManager(requireContext(), 3)
            adapter = quickActionAdapter
        }
    }

    private fun setupActions() {
        binding.btnCustomizeActions.setOnClickListener {
            openCustomizationDrawer()
        }

        binding.btnEmptyCustomize.setOnClickListener {
            openCustomizationDrawer()
        }

        binding.btnGetHelpNow.setOnClickListener {
            navigateSafe(Destinations.EmergencyHelp.DESTINATION_ID)
        }

        binding.headerView.onNotificationClickListener = {
            navigateSafe(Destinations.Notification.DESTINATION_ID)
        }

        binding.headerView.onSettingsClickListener = {
            navigateSafe(Destinations.Settings.DESTINATION_ID)
        }

        binding.cardHeroReflection.setOnClickListener {
            navigateSafe(Destinations.MoodTracker.DESTINATION_ID)
        }

        binding.btnHeroMoodTag.setOnClickListener {
            navigateSafe(Destinations.MoodTracker.DESTINATION_ID)
        }

        binding.btnHeroExpand.setOnClickListener {
            navigateSafe(Destinations.MoodTracker.DESTINATION_ID)
        }
    }

    private fun openCustomizationDrawer() {
        DashboardCustomizationBottomSheet().show(childFragmentManager, "customization_drawer")
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        renderUiState(state)
                    }
                }

                launch {
                    viewModel.quickActionsState.collect { actions ->
                        val visibleActions = actions.filter { it.isVisible }
                        if (visibleActions.isEmpty()) {
                            binding.rvQuickActions.visibility = View.GONE
                            binding.cardEmptyQuickActions.visibility = View.VISIBLE
                        } else {
                            binding.cardEmptyQuickActions.visibility = View.GONE
                            binding.rvQuickActions.visibility = View.VISIBLE
                            quickActionAdapter.submitList(visibleActions)
                        }
                    }
                }

                launch {
                    viewModel.unreadNotificationCount.collect { count ->
                        binding.headerView.setNotificationBadge(count)
                    }
                }
            }
        }
    }

    private fun renderUiState(state: DashboardUiState) {
        val userName = state.user?.name ?: "Sri Ram"
        binding.headerView.setHeaderData(state.greeting, userName, state.currentStreak)

        val moodName = state.currentMood?.name?.lowercase()?.replaceFirstChar { it.uppercase() } ?: "Anxious"
        val article = if (moodName.first().lowercaseChar() in listOf('a', 'e', 'i', 'o', 'u')) "an" else "a"

        val headlineText = "Today feels like $article\n$moodName day"
        val spannable = SpannableString(headlineText)
        val highlightColor = Color.parseColor("#C084FC")
        val startIdx = headlineText.indexOf(moodName)
        if (startIdx >= 0) {
            spannable.setSpan(
                ForegroundColorSpan(highlightColor),
                startIdx,
                startIdx + moodName.length,
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
            )
        }
        binding.tvTodayMoodSummary.text = spannable

        if (!state.latestAiInsight.isNullOrBlank()) {
            binding.tvHeroEncouragement.text = "“${state.latestAiInsight}”"
        } else {
            binding.tvHeroEncouragement.text = "“I hear how unsettled you’re feeling right now. It makes sense to feel this way sometimes. Would it help to take a few slow breaths together, just for a moment? You’re not alone in this.”"
        }

        binding.tvMoodTagName.text = moodName
        binding.tvMoodTagEmoji.text = getMoodEmoji(moodName)
    }

    private fun getMoodEmoji(moodName: String): String {
        return when (moodName.lowercase()) {
            "anxious" -> "☹"
            "sad" -> "😔"
            "calm" -> "😌"
            "happy" -> "😊"
            "peaceful" -> "🕊"
            "energetic" -> "⚡"
            else -> "☹"
        }
    }
}
