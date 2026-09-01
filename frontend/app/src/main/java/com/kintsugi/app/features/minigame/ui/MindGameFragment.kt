package com.kintsugi.app.features.minigame.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.kintsugi.app.core.navigation.Destinations
import com.kintsugi.app.core.navigation.navigateSafe
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentMindGameBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * Premium Mindful Match Memory Game Fragment.
 */
@AndroidEntryPoint
class MindGameFragment : Fragment() {

    private var _binding: FragmentMindGameBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CalmMatchGameViewModel by viewModels()
    private lateinit var matchCardAdapter: MatchCardAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMindGameBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupHeader()
        setupAdapters()
        setupActions()
        observeViewModel()
    }

    private fun setupHeader() {
        binding.toolbar.apply {
            setTitle("Mindful Match")
            setSubtitle("Take your time. There is no rush.")
            showBackButton {
                findNavController().popBackStackSafe()
            }
        }
    }

    private fun setupAdapters() {
        matchCardAdapter = MatchCardAdapter { index ->
            viewModel.onCardTapped(index)
        }

        binding.rvMatchCards.apply {
            layoutManager = GridLayoutManager(requireContext(), 3)
            adapter = matchCardAdapter
        }
    }

    private fun setupActions() {
        binding.btnPlayAgain.setOnClickListener {
            viewModel.restart()
        }

        binding.btnContinueReflection.setOnClickListener {
            val moves = viewModel.movesState.value
            val seconds = viewModel.elapsedSecondsState.value
            val mins = seconds / 60
            val secs = seconds % 60
            val timeStr = String.format("%d:%02d", mins, secs)

            val reflectionContent = "Today I completed today's Mindful Match exercise in a state of calm focus.\n\n" +
                    "• Exercise: Mindful Match Memory Game\n" +
                    "• Matched: 6 of 6 Pairs\n" +
                    "• Elapsed Time: $timeStr\n" +
                    "• Total Moves: $moves\n" +
                    "• Mindful Focus: Calm & Present\n\n" +
                    "Every match was a quiet pause in my day. Taking time for mindful exercises helps me restore inner balance and quiet my mind."

            val bundle = Bundle().apply {
                putString("draft_title", "Mindful Match Reflection")
                putString("draft_content", reflectionContent)
                putString("draft_mood", "Calm")
                putBoolean("is_ai_draft", false)
            }

            navigateSafe(Destinations.Journal.EDITOR_DESTINATION_ID, bundle)
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.cardsState.collect { cards ->
                        matchCardAdapter.submitList(cards)
                        val matchedPairs = cards.count { it.isMatched } / 2
                        binding.tvMatchedPairsCount.text = "$matchedPairs of 6 Pairs Matched"
                        binding.progressMindfulPairs.progress = matchedPairs
                    }
                }

                launch {
                    viewModel.movesState.collect { moves ->
                        binding.tvMovesCount.text = "Moves: $moves"
                        binding.tvStatMoves.text = moves.toString()
                    }
                }

                launch {
                    viewModel.elapsedSecondsState.collect { seconds ->
                        val mins = seconds / 60
                        val secs = seconds % 60
                        val timeStr = String.format("%d:%02d", mins, secs)
                        binding.tvTimeCount.text = "Time: $timeStr"
                        binding.tvStatTime.text = timeStr
                    }
                }

                launch {
                    viewModel.isCompletedState.collect { isCompleted ->
                        if (isCompleted) {
                            binding.cardCompletion.visibility = View.VISIBLE
                            binding.cardCompletion.alpha = 0f
                            binding.cardCompletion.scaleX = 0.9f
                            binding.cardCompletion.scaleY = 0.9f
                            binding.cardCompletion.animate()
                                .alpha(1.0f)
                                .scaleX(1.0f)
                                .scaleY(1.0f)
                                .setDuration(400)
                                .start()
                        } else {
                            binding.cardCompletion.visibility = View.GONE
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
