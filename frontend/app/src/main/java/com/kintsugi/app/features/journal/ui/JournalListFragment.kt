package com.kintsugi.app.features.journal.ui

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.navigation.Destinations
import com.kintsugi.app.core.navigation.navigateSafe
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentJournalBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Journal Home Fragment displaying a personal reflection sanctuary list with AI Writer Assistant
 * and custom violet filter popups.
 */
@AndroidEntryPoint
class JournalListFragment : Fragment() {

    private var _binding: FragmentJournalBinding? = null
    private val binding get() = _binding!!

    private val viewModel: JournalViewModel by activityViewModels()
    private lateinit var journalAdapter: JournalListAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentJournalBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupHeaderBar()
        setupAiWriterBanner()
        setupTodayPromptCard()
        setupRecyclerView()
        setupSearchBarAndFilter()
        setupFab()
        setupEmptyState()
        observeViewModel()
    }

    private fun setupHeaderBar() {
        binding.toolbar.apply {
            setTitle("My Journal")
            setSubtitle("Your private space for reflection 🔒")
        }
    }

    private fun setupAiWriterBanner() {
        binding.cardAiWriterBanner.setOnClickListener {
            openAiGeneratorBottomSheet()
        }
    }

    private fun openAiGeneratorBottomSheet() {
        val bottomSheet = JournalAiGeneratorBottomSheet.newInstance { title, content, mood, summary ->
            viewModel.selectEntry(null)
            val bundle = Bundle().apply {
                putString("draft_title", title)
                putString("draft_content", content)
                putString("draft_mood", mood)
                putString("draft_summary", summary)
                putBoolean("is_ai_draft", true)
            }
            navigateSafe(Destinations.Journal.EDITOR_DESTINATION_ID, bundle)
        }
        bottomSheet.show(childFragmentManager, JournalAiGeneratorBottomSheet.TAG)
    }

    private fun setupTodayPromptCard() {
        val currentDateStr = SimpleDateFormat("EEEE, MMMM d", Locale.getDefault()).format(Date())
        binding.tvPromptDateHeader.text = currentDateStr.uppercase()

        binding.cardTodaysPrompt.setOnClickListener {
            navigateToEditor(null)
        }
    }

    private fun setupRecyclerView() {
        journalAdapter = JournalListAdapter(
            onEntryClick = { entry ->
                navigateToEditor(entry.id)
            },
            onDeleteClick = { entry ->
                viewModel.delete(entry.id)
            },
            onFavoriteClick = { entry ->
                viewModel.toggleFavorite(entry.id)
            },
            onPinClick = { entry ->
                viewModel.togglePin(entry.id)
            }
        )
        binding.rvJournals.adapter = journalAdapter
    }

    private fun setupSearchBarAndFilter() {
        binding.etSearchJournal.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.setSearchQuery(s?.toString().orEmpty())
            }

            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnFilterDropdown.setOnClickListener { view ->
            val popup = JournalFilterPopup(
                context = requireContext(),
                currentFilter = viewModel.currentFilter.value,
                onFilterSelected = { selectedFilter ->
                    viewModel.setFilter(selectedFilter)
                }
            )
            popup.show(view)
        }
    }

    private fun setupFab() {
        binding.fabNewEntry.setOnClickListener {
            navigateToEditor(null)
        }
    }

    private fun setupEmptyState() {
        binding.emptyState.bind(
            title = "Start writing today.",
            description = "Every small thought matters.",
            buttonText = "Create Journal",
            onAction = {
                navigateToEditor(null)
            }
        )

        binding.errorState.bind(
            errorMessage = "Unable to load your reflections.",
            onRetry = {
                viewModel.refresh()
            }
        )
    }

    private fun navigateToEditor(entryId: String?) {
        viewModel.selectEntry(entryId)
        navigateSafe(Destinations.Journal.EDITOR_DESTINATION_ID)
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.entriesState.collect { result ->
                        renderState(result)
                    }
                }

                launch {
                    viewModel.statsState.collect { stats ->
                        renderStats(stats)
                    }
                }

                launch {
                    viewModel.currentFilter.collect { filter ->
                        binding.tvFilterLabel.text = filter.label
                    }
                }

                launch {
                    viewModel.uiEvent.collect { event ->
                        handleUiEvent(event)
                    }
                }
            }
        }
    }

    private fun renderStats(stats: JournalStats) {
        binding.tvStatEntriesVal.text = stats.totalEntries.toString()
        binding.tvStatStreakVal.text = "${stats.streakDays} Day${if (stats.streakDays > 1) "s" else ""}"
        binding.tvStatFavoritesVal.text = stats.favoriteCount.toString()
    }

    private fun renderState(result: Result<List<com.kintsugi.app.core.database.entity.JournalEntryEntity>>) {
        when (result) {
            is Result.Loading -> {
                binding.loadingShimmer.visibility = View.VISIBLE
                binding.rvJournals.visibility = View.GONE
                binding.emptyState.visibility = View.GONE
                binding.errorState.visibility = View.GONE
            }
            is Result.Success -> {
                binding.loadingShimmer.visibility = View.GONE
                binding.errorState.visibility = View.GONE

                val list = result.data
                if (list.isEmpty()) {
                    binding.rvJournals.visibility = View.GONE
                    binding.emptyState.visibility = View.VISIBLE
                } else {
                    binding.emptyState.visibility = View.GONE
                    binding.rvJournals.visibility = View.VISIBLE
                    journalAdapter.submitList(list)
                }
            }
            is Result.Error -> {
                binding.loadingShimmer.visibility = View.GONE
                binding.rvJournals.visibility = View.GONE
                binding.emptyState.visibility = View.GONE
                binding.errorState.visibility = View.VISIBLE
            }
            else -> {}
        }
    }

    private fun handleUiEvent(event: JournalUiEvent) {
        when (event) {
            is JournalUiEvent.ShowMessage -> {
                Toast.makeText(requireContext(), event.message, Toast.LENGTH_SHORT).show()
            }
            is JournalUiEvent.Deleted -> {
                Toast.makeText(requireContext(), "Reflection deleted.", Toast.LENGTH_SHORT).show()
            }
            is JournalUiEvent.NavigateToEditor -> {
                navigateToEditor(event.entryId)
            }
            else -> {}
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
