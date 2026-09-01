package com.kintsugi.app.features.moodtracker

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.core.navigation.navigateSafe
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.snackbar.Snackbar
import com.kintsugi.app.core.common.MoodOptions
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.databinding.FragmentMoodTrackerBinding
import com.kintsugi.app.features.moodtracker.ui.MoodTrackerUiEvent
import com.kintsugi.app.features.moodtracker.ui.MoodTrackerViewModel
import com.kintsugi.app.features.moodtracker.ui.adapter.MoodHistoryAdapter
import com.kintsugi.app.features.moodtracker.ui.model.AnalyticsPeriod
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MoodTrackerFragment : Fragment() {

    private var _binding: FragmentMoodTrackerBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MoodTrackerViewModel by viewModels()
    private val adapter by lazy {
        MoodHistoryAdapter(onDeleteClick = { id -> viewModel.deleteMoodEntry(id) })
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMoodTrackerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupHeader()
        setupMoodCards()
        setupNoteInput()
        setupSubmitButton()
        setupRecyclerView()
        setupCustomPeriodDropdown()
        setupActions()
        observeViewModelState()
    }

    private fun setupHeader() {
        binding.toolbar.apply {
            setTitle("Mood Sanctuary")
            setSubtitle("Track & reflect on your emotional journey")
            showSettingsButton {
                findNavController().navigateSafe(com.kintsugi.app.core.navigation.Destinations.Settings.DESTINATION_ID)
            }
        }
    }

    private fun setupMoodCards() {
        val moodCardMap = mapOf(
            binding.cardMoodHappy to MoodOptions.HAPPY,
            binding.cardMoodCalm to MoodOptions.CALM,
            binding.cardMoodAnxious to MoodOptions.ANXIOUS,
            binding.cardMoodAngry to MoodOptions.ANGRY,
            binding.cardMoodTired to MoodOptions.TIRED
        )

        moodCardMap.forEach { (cardView, moodOption) ->
            cardView.bindMood(moodOption, selected = (moodOption == viewModel.selectedMood.value))
            cardView.setOnClickListener {
                viewModel.selectMood(moodOption)
            }
        }
    }

    private fun setupNoteInput() {
        binding.etMoodNote.doAfterTextChanged { text ->
            viewModel.updateNoteText(text?.toString() ?: "")
        }
    }

    private fun setupSubmitButton() {
        binding.btnSubmitMood.setOnClickListener {
            viewModel.logMood()
        }
    }

    private fun setupRecyclerView() {
        binding.rvMoodHistory.layoutManager = LinearLayoutManager(requireContext())
        binding.rvMoodHistory.adapter = adapter
    }

    private fun setupCustomPeriodDropdown() {
        binding.btnFilterDropdown.setSelectedPeriod(viewModel.selectedPeriod.value)
        binding.btnFilterDropdown.onPeriodSelected = { period ->
            viewModel.selectPeriod(period)
        }
    }

    private fun setupActions() {
        binding.btnEmptyLogFirst.setOnClickListener {
            binding.scrollView.smoothScrollTo(0, 0)
        }
    }

    private fun showSnackbar(message: String) {
        Snackbar.make(binding.root, message, Snackbar.LENGTH_SHORT).show()
    }

    private fun observeViewModelState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {

                // 1. Selected Mood Selection
                launch {
                    viewModel.selectedMood.collect { selectedMood ->
                        val currentSelected = selectedMood ?: MoodOptions.CALM
                        binding.cardMoodHappy.bindMood(MoodOptions.HAPPY, currentSelected == MoodOptions.HAPPY)
                        binding.cardMoodCalm.bindMood(MoodOptions.CALM, currentSelected == MoodOptions.CALM)
                        binding.cardMoodAnxious.bindMood(MoodOptions.ANXIOUS, currentSelected == MoodOptions.ANXIOUS)
                        binding.cardMoodAngry.bindMood(MoodOptions.ANGRY, currentSelected == MoodOptions.ANGRY)
                        binding.cardMoodTired.bindMood(MoodOptions.TIRED, currentSelected == MoodOptions.TIRED)
                    }
                }

                // 2. Timeline History State
                launch {
                    viewModel.timelineState.collect { result ->
                        when (result) {
                            is Result.Success -> {
                                val history = result.data
                                adapter.submitList(history)
                                binding.barChartFrequency.submitEntries(history)
                                binding.donutChartDistribution.submitEntries(history)
                                binding.heatmapView.submitEntries(history)

                                if (history.isEmpty()) {
                                    binding.layoutEmptyTimeline.visibility = View.VISIBLE
                                    binding.rvMoodHistory.visibility = View.GONE
                                } else {
                                    binding.layoutEmptyTimeline.visibility = View.GONE
                                    binding.rvMoodHistory.visibility = View.VISIBLE
                                }

                                val latestWithAi = history.firstOrNull { !it.aiMessage.isNullOrBlank() }
                                if (latestWithAi != null) {
                                    binding.cardAiResponse.visibility = View.VISIBLE
                                    binding.tvAiResponseText.text = "“${latestWithAi.aiMessage}”"
                                } else {
                                    binding.cardAiResponse.visibility = View.GONE
                                }
                            }
                            else -> {}
                        }
                    }
                }

                // 3. Trend Line Chart State
                launch {
                    viewModel.trendChartState.collect { points ->
                        binding.chartView.submitTrendPoints(points)
                    }
                }

                // 4. Summary Statistics State
                launch {
                    viewModel.statisticsState.collect { stats ->
                        when (stats.period) {
                            AnalyticsPeriod.TODAY -> {
                                binding.tvStat1Label.text = "Total Logs"
                                binding.tvStat1Value.text = "${stats.totalLogs}"
                                binding.tvStat2Label.text = "Average Mood"
                                binding.tvStat2Value.text = String.format("%.1f", stats.averageMoodScore)
                                binding.tvStat3Label.text = "Streak"
                                binding.tvStat3Value.text = "${stats.streakDays}d"
                            }
                            AnalyticsPeriod.SEVEN_DAYS -> {
                                binding.tvStat1Label.text = "Total Logs"
                                binding.tvStat1Value.text = "${stats.totalLogs}"
                                binding.tvStat2Label.text = "Most Common"
                                binding.tvStat2Value.text = stats.mostCommonMood?.label ?: "-"
                                binding.tvStat3Label.text = "Consistency"
                                binding.tvStat3Value.text = "${stats.consistencyPercentage}%"
                            }
                            else -> {
                                binding.tvStat1Label.text = "Best Day"
                                binding.tvStat1Value.text = stats.bestDayName
                                binding.tvStat2Label.text = "Lowest Day"
                                binding.tvStat2Value.text = stats.lowestDayName
                                binding.tvStat3Label.text = "Avg Score"
                                binding.tvStat3Value.text = String.format("%.1f", stats.averageMoodScore)
                            }
                        }
                    }
                }

                // 5. Automated Insights State
                launch {
                    viewModel.insightsState.collect { insight ->
                        binding.tvChartInsightText.text = insight
                    }
                }

                // 6. Submit Button Enabled State
                launch {
                    viewModel.submitEnabled.collect { enabled ->
                        binding.btnSubmitMood.isEnabled = enabled
                    }
                }

                // 7. UI Events
                launch {
                    viewModel.uiEvents.collect { event ->
                        when (event) {
                            is MoodTrackerUiEvent.ShowSnackbar -> {
                                showSnackbar(event.message)
                            }
                            is MoodTrackerUiEvent.ScrollToTop -> {
                                binding.scrollView.smoothScrollTo(0, 0)
                            }
                        }
                    }
                }

            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
