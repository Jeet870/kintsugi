package com.kintsugi.app.features.profile.ui

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.DecelerateInterpolator
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.StreakDto
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.navigation.Destinations
import com.kintsugi.app.core.navigation.navigateSafe
import com.kintsugi.app.databinding.FragmentProfileBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * Premium Flagship Profile & Wellness Dashboard Fragment.
 */
@AndroidEntryPoint
class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProfileViewModel by viewModels()

    private lateinit var achievementBadgeAdapter: AchievementBadgeAdapter
    private var avatarBreathingAnimator: ObjectAnimator? = null

    private var lastCurrentStreak = -1
    private var lastLongestStreak = -1
    private var lastActiveDays = -1

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        com.kintsugi.app.core.ui.widget.KintsugiScreenInsets.applyBottomNavigationPadding(binding.profileScrollView, 100)
        setupHeaderActions()
        setupAdapters()
        setupAvatarBreathingAnimation()
        setupActions()
        observeViewModel()
    }

    private fun setupHeaderActions() {
        binding.toolbar.apply {
            setTitle("Profile")
            setSubtitle("Personal Wellness Dashboard")
            showSettingsButton {
                navigateSafe(Destinations.Settings.DESTINATION_ID)
            }
        }
    }

    private fun setupAdapters() {
        achievementBadgeAdapter = AchievementBadgeAdapter()
        binding.rvAchievements.apply {
            layoutManager = GridLayoutManager(requireContext(), 3)
            adapter = achievementBadgeAdapter
        }

        binding.chartMoodStats.setOnPeriodChangedListener { period ->
            viewModel.setPeriod(period)
        }
    }

    private fun setupAvatarBreathingAnimation() {
        avatarBreathingAnimator = ObjectAnimator.ofFloat(binding.avatarLogo, "scaleX", 1.0f, 1.05f, 1.0f).apply {
            duration = 3500
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }

        ObjectAnimator.ofFloat(binding.avatarLogo, "scaleY", 1.0f, 1.05f, 1.0f).apply {
            duration = 3500
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }
    }

    private fun setupActions() {
        binding.cardProfileHeader.setOnClickListener {
            Toast.makeText(requireContext(), "Profile settings ✦", Toast.LENGTH_SHORT).show()
        }

        binding.btnEditProfile.setOnClickListener {
            Toast.makeText(requireContext(), "Profile settings ✦", Toast.LENGTH_SHORT).show()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.profileState.collect { result ->
                        if (result is Result.Success) {
                            renderProfile(result.data)
                        }
                    }
                }

                launch {
                    viewModel.userQuote.collect { quote ->
                        binding.tvProfileQuote.text = "“$quote”"
                    }
                }

                launch {
                    viewModel.streakState.collect { result ->
                        if (result is Result.Success) {
                            renderStreakWithCountUp(result.data)
                        }
                    }
                }

                launch {
                    viewModel.achievementsState.collect { result ->
                        if (result is Result.Success) {
                            achievementBadgeAdapter.submitList(result.data)
                        }
                    }
                }

                launch {
                    viewModel.moodStatsState.collect { moodMap ->
                        binding.chartMoodStats.submitStats(moodMap)
                    }
                }

                launch {
                    viewModel.emotionalSummaryState.collect { summary ->
                        renderEmotionalSummary(summary)
                    }
                }

                launch {
                    viewModel.badgeUnlockEvents.collect { badgeId ->
                        Toast.makeText(requireContext(), "✦ Achievement Unlocked! ($badgeId)", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun renderProfile(user: UserDto) {
        binding.tvProfileName.text = user.name ?: "Sri Ram Chinthakayala"
        binding.tvProfileEmail.text = user.email
    }

    private fun renderStreakWithCountUp(streak: StreakDto) {
        if (streak.currentStreak != lastCurrentStreak) {
            animateCountUp(binding.tvCurrentStreakCount, lastCurrentStreak.coerceAtLeast(0), streak.currentStreak)
            lastCurrentStreak = streak.currentStreak
        }

        if (streak.longestStreak != lastLongestStreak) {
            animateCountUp(binding.tvLongestStreakCount, lastLongestStreak.coerceAtLeast(0), streak.longestStreak)
            lastLongestStreak = streak.longestStreak
        }

        if (streak.totalActiveDays != lastActiveDays) {
            animateCountUp(binding.tvTotalActiveDays, lastActiveDays.coerceAtLeast(0), streak.totalActiveDays)
            lastActiveDays = streak.totalActiveDays
        }
    }

    private fun renderEmotionalSummary(summary: EmotionalSummary) {
        binding.tvSummaryTopMood.text = summary.mostCommonMood
        binding.tvSummaryTopPct.text = "${summary.percentage}%"
        binding.tvSummaryStability.text = summary.stability
        binding.tvSummaryReflection.text = "“${summary.reflectionText}”"
    }

    private fun animateCountUp(textView: TextView, start: Int, end: Int) {
        val animator = ValueAnimator.ofInt(start, end).apply {
            duration = 700
            interpolator = DecelerateInterpolator()
            addUpdateListener { anim ->
                textView.text = (anim.animatedValue as Int).toString()
            }
        }
        animator.start()
    }

    override fun onDestroyView() {
        avatarBreathingAnimator?.cancel()
        avatarBreathingAnimator = null
        super.onDestroyView()
        _binding = null
    }
}
