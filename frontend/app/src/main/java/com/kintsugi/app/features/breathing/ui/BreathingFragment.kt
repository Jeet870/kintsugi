package com.kintsugi.app.features.breathing.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.R
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentBreathingBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Locale

/**
 * Premium Mindfulness Breathing Fragment inspired by Headspace, Calm, and Apple Mindfulness.
 *
 * Connects the pure client-side [BreathingViewModel] with the Canvas-drawn [BreathingCircleView].
 */
@AndroidEntryPoint
class BreathingFragment : Fragment() {

    private var _binding: FragmentBreathingBinding? = null
    private val binding get() = _binding!!

    private val viewModel: BreathingViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBreathingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupToolbar()
        setupGreeting()
        setupPresetSelectors()
        setupButtons()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.toolbar.apply {
            setTitle("Mindfulness")
            setSubtitle("Deep Breathing Sanctuary")
            showBackButton {
                findNavController().popBackStackSafe()
            }
        }
    }

    private fun setupGreeting() {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val greetingText = when (hour) {
            in 4..11 -> "Take a moment to breathe."
            in 12..17 -> "Slow down."
            else -> "Welcome back."
        }
        binding.tvGreeting.text = greetingText
    }

    private fun setupPresetSelectors() {
        binding.presetBeginner.setOnClickListener { viewModel.selectPreset(BreathingPreset.BEGINNER) }
        binding.presetRelax.setOnClickListener { viewModel.selectPreset(BreathingPreset.RELAX) }
        binding.presetFocus.setOnClickListener { viewModel.selectPreset(BreathingPreset.FOCUS) }
        binding.presetSleep.setOnClickListener { viewModel.selectPreset(BreathingPreset.SLEEP) }
    }

    private fun setupButtons() {
        binding.btnPrimaryAction.setOnClickListener {
            if (viewModel.isRunning.value) {
                viewModel.pause()
            } else {
                viewModel.start()
            }
        }

        binding.btnEndSession.setOnClickListener {
            viewModel.reset()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.phaseState.collect { phase ->
                        binding.tvPhaseLabel.text = phase.displayName
                        if (phase == BreathingPhaseState.COMPLETED) {
                            binding.btnPrimaryAction.setText("Session Complete ✦")
                            binding.btnEndSession.visibility = View.GONE
                        }
                    }
                }

                launch {
                    viewModel.progress.collect { progress ->
                        binding.breathingCircle.updateState(viewModel.phaseState.value, progress)
                    }
                }

                launch {
                    viewModel.isRunning.collect { running ->
                        if (running) {
                            binding.btnPrimaryAction.setText("Pause")
                            binding.btnEndSession.visibility = View.VISIBLE
                        } else if (viewModel.phaseState.value != BreathingPhaseState.COMPLETED) {
                            binding.btnPrimaryAction.setText(
                                if (viewModel.phaseState.value == BreathingPhaseState.PAUSED) "Resume" else "Begin Session ✦"
                            )
                        }
                    }
                }

                launch {
                    viewModel.remainingTimeMs.collect { remainingMs ->
                        val secondsTotal = remainingMs / 1000
                        val mins = secondsTotal / 60
                        val secs = secondsTotal % 60
                        binding.tvSessionTimer.text = String.format(Locale.getDefault(), "%02d:%02d REMAINING", mins, secs)
                    }
                }

                launch {
                    viewModel.currentCycle.collect { cycle ->
                        binding.tvCycleCounter.text = "Cycle $cycle"
                    }
                }

                launch {
                    viewModel.selectedPreset.collect { preset ->
                        updatePresetUI(preset)
                    }
                }

                launch {
                    viewModel.motivationalQuote.collect { quote ->
                        binding.tvMotivationalFooter.text = "\"$quote\""
                    }
                }
            }
        }
    }

    private fun updatePresetUI(selected: BreathingPreset) {
        val colorGold = ContextCompat.getColor(requireContext(), R.color.luxury_gold)
        val colorMuted = ContextCompat.getColor(requireContext(), R.color.text_secondary)

        binding.presetBeginner.setTextColor(if (selected.id == BreathingPreset.BEGINNER.id) colorGold else colorMuted)
        binding.presetRelax.setTextColor(if (selected.id == BreathingPreset.RELAX.id) colorGold else colorMuted)
        binding.presetFocus.setTextColor(if (selected.id == BreathingPreset.FOCUS.id) colorGold else colorMuted)
        binding.presetSleep.setTextColor(if (selected.id == BreathingPreset.SLEEP.id) colorGold else colorMuted)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
