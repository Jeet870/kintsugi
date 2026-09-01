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
import com.kintsugi.app.core.common.parseAsHtml
import com.kintsugi.app.core.common.stripHtmlTags
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentJournalEditorBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Journal Editor Fragment presenting a personal notebook writing experience with AI assistance,
 * typewriter text streaming, and continuous draft autosaving.
 */
@AndroidEntryPoint
class JournalEditorFragment : Fragment() {

    private var _binding: FragmentJournalEditorBinding? = null
    private val binding get() = _binding!!

    // Shared ViewModel scoped to activity/navigation graph
    private val viewModel: JournalViewModel by activityViewModels()

    private var autosaveJob: Job? = null
    private var streamingJob: Job? = null
    private var isUserTyping = false
    private var isBindingData = false
    private var isAiDraftEntry = false
    private var selectedMood: String = "Calm"

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentJournalEditorBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupHeader()
        setupMetadata()
        setupMoodSelector()
        setupTextWatchers()
        setupFocusListeners()
        setupButtons()
        checkArgumentsForDraft()
        observeViewModel()
    }

    private fun setupHeader() {
        binding.toolbar.apply {
            setTitle("Reflection Journal")
            setSubtitle("Express your thoughts freely")
            showBackButton {
                performExplicitSaveAndExit()
            }
        }
        val btnSave = com.google.android.material.button.MaterialButton(requireContext()).apply {
            text = "Save"
            setTextColor(android.graphics.Color.WHITE)
            textSize = 13f
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            backgroundTintList = android.content.res.ColorStateList.valueOf(android.graphics.Color.parseColor("#A855F7"))
            cornerRadius = (20 * resources.displayMetrics.density).toInt()
            setOnClickListener {
                performExplicitSaveSilent()
            }
        }
        binding.toolbar.addCustomActionView(btnSave)
    }

    private fun setupMetadata() {
        val dateStr = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault()).format(Date())
        binding.tvEditorDate.text = dateStr.uppercase()
        binding.tvAutosaveStatus.text = "Ready"
    }

    private fun setupMoodSelector() {
        val moodChips = mapOf(
            binding.chipMoodCalm to "Calm",
            binding.chipMoodHappy to "Happy",
            binding.chipMoodGrateful to "Grateful",
            binding.chipMoodAnxious to "Anxious"
        )

        moodChips.forEach { (view, mood) ->
            view.setOnClickListener {
                selectedMood = mood
                updateMoodChipStyles()
                scheduleDebouncedAutosave()
            }
        }
        updateMoodChipStyles()
    }

    private fun updateMoodChipStyles() {
        val moodChips = listOf(
            binding.chipMoodCalm to "Calm",
            binding.chipMoodHappy to "Happy",
            binding.chipMoodGrateful to "Grateful",
            binding.chipMoodAnxious to "Anxious"
        )

        moodChips.forEach { (view, mood) ->
            if (mood.equals(selectedMood, ignoreCase = true)) {
                view.setTextColor(android.graphics.Color.parseColor("#A855F7"))
                view.setTypeface(null, android.graphics.Typeface.BOLD)
            } else {
                view.setTextColor(android.graphics.Color.parseColor("#8B88A0"))
                view.setTypeface(null, android.graphics.Typeface.NORMAL)
            }
        }
    }

    private fun setupTextWatchers() {
        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                if (isBindingData) return
                isUserTyping = true
                updateStatusBadge("Edited")
                updateWritingStats()
                scheduleDebouncedAutosave()
            }

            override fun afterTextChanged(s: Editable?) {}
        }

        binding.etJournalTitle.addTextChangedListener(textWatcher)
        binding.etJournalContent.addTextChangedListener(textWatcher)
    }

    private fun setupFocusListeners() {
        binding.etJournalTitle.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus && isUserTyping) {
                scheduleImmediateAutosave()
            }
        }

        binding.etJournalContent.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus && isUserTyping) {
                scheduleImmediateAutosave()
            }
        }
    }

    private fun setupButtons() {
        // Handled via Toolbar custom Save action
    }

    private fun checkArgumentsForDraft() {
        val args = arguments ?: return
        val draftTitle = args.getString("draft_title")
        val draftContent = args.getString("draft_content")
        val draftMood = args.getString("draft_mood") ?: "Calm"
        val isAiDraft = args.getBoolean("is_ai_draft", false)

        if (!draftContent.isNullOrBlank()) {
            isAiDraftEntry = isAiDraft
            selectedMood = draftMood
            updateMoodChipStyles()
            updateStatusBadge(if (isAiDraft) "AI Draft" else "Draft")

            isBindingData = true
            binding.etJournalTitle.setText(draftTitle.orEmpty().stripHtmlTags())
            isBindingData = false

            streamTextTypewriter(draftContent)
        }
    }

    private fun streamTextTypewriter(fullContent: String) {
        streamingJob?.cancel()
        streamingJob = viewLifecycleOwner.lifecycleScope.launch {
            isBindingData = true
            binding.etJournalContent.setText("")

            val parsedContent = fullContent.parseAsHtml().toString()
            val length = parsedContent.length
            val chunkSize = if (length > 200) 6 else 2

            var index = 0
            while (index < length) {
                val nextIndex = (index + chunkSize).coerceAtMost(length)
                val currentSubstring = parsedContent.substring(0, nextIndex)
                binding.etJournalContent.setText(currentSubstring + " ❚")
                binding.etJournalContent.setSelection(currentSubstring.length)
                index = nextIndex
                delay(25)
            }

            binding.etJournalContent.setText(parsedContent)
            isBindingData = false
            updateWritingStats()
            scheduleDebouncedAutosave()
        }
    }

    private fun updateStatusBadge(statusText: String) {
        binding.chipStatusBadge.text = statusText
        binding.chipStatusBadge.visibility = View.VISIBLE
        when (statusText) {
            "AI Draft" -> {
                binding.chipStatusBadge.setTextColor(android.graphics.Color.parseColor("#A855F7"))
            }
            "Edited" -> {
                binding.chipStatusBadge.setTextColor(android.graphics.Color.parseColor("#FACC15"))
            }
            "Synced" -> {
                binding.chipStatusBadge.setTextColor(android.graphics.Color.parseColor("#4ADE80"))
            }
            else -> {
                binding.chipStatusBadge.setTextColor(android.graphics.Color.parseColor("#B794F6"))
            }
        }
    }

    private fun openAiWriterBottomSheet() {
        val currentContent = binding.etJournalContent.text?.toString().orEmpty()
        viewModel.clearAiResult()

        val bottomSheet = JournalAiBottomSheetFragment.newInstance(currentContent) { action, result ->
            isBindingData = true
            if (action == "generate_title" || result.split(" ").size <= 5) {
                binding.etJournalTitle.setText(result.stripHtmlTags())
            } else {
                binding.etJournalContent.setText(result.parseAsHtml())
            }
            isBindingData = false
            updateStatusBadge("AI Draft")
            updateWritingStats()
            scheduleDebouncedAutosave()
        }
        bottomSheet.show(childFragmentManager, JournalAiBottomSheetFragment.TAG)
    }

    private fun updateWritingStats() {
        val contentText = binding.etJournalContent.text?.toString().orEmpty()
        val charCount = contentText.length
        val words = contentText.trim().split("\\s+".toRegex()).filter { it.isNotBlank() }
        val wordCount = words.size
        val readTimeMinutes = (wordCount / 200).coerceAtLeast(1)

        binding.tvStatsWordCount.text = "$wordCount ${if (wordCount == 1) "word" else "words"}"
        binding.tvStatsCharCount.text = "$charCount ${if (charCount == 1) "character" else "characters"}"
        binding.tvStatsReadTime.text = "$readTimeMinutes min read"
    }

    private fun scheduleDebouncedAutosave() {
        autosaveJob?.cancel()
        binding.tvAutosaveStatus.text = "Typing..."

        autosaveJob = viewLifecycleOwner.lifecycleScope.launch {
            delay(1000)
            performBackgroundAutosave()
        }
    }

    private fun scheduleImmediateAutosave() {
        autosaveJob?.cancel()
        viewLifecycleOwner.lifecycleScope.launch {
            performBackgroundAutosave()
        }
    }

    private suspend fun performBackgroundAutosave() {
        val contentText = binding.etJournalContent.text?.toString().orEmpty().trim()
        if (contentText.isNotBlank()) {
            binding.tvAutosaveStatus.text = "Saving..."
            val titleText = binding.etJournalTitle.text?.toString().orEmpty()

            viewModel.save(titleText, contentText, moodTag = selectedMood)
            delay(300)
            binding.tvAutosaveStatus.text = "Saved just now"
            updateStatusBadge("Synced")
        } else {
            binding.tvAutosaveStatus.text = "Draft"
        }
    }

    private fun performExplicitSaveSilent() {
        val titleText = binding.etJournalTitle.text?.toString().orEmpty()
        val contentText = binding.etJournalContent.text?.toString().orEmpty().trim()

        if (contentText.isBlank()) {
            Toast.makeText(requireContext(), "Please write a reflection before saving.", Toast.LENGTH_SHORT).show()
            return
        }

        autosaveJob?.cancel()
        viewModel.save(titleText, contentText, moodTag = selectedMood)
        Toast.makeText(requireContext(), "Reflection Saved ✨", Toast.LENGTH_SHORT).show()
        binding.tvAutosaveStatus.text = "Saved just now"
        updateStatusBadge("Synced")
    }

    private fun performExplicitSaveAndExit() {
        val titleText = binding.etJournalTitle.text?.toString().orEmpty()
        val contentText = binding.etJournalContent.text?.toString().orEmpty().trim()

        autosaveJob?.cancel()
        if (contentText.isNotBlank()) {
            viewModel.save(titleText, contentText, moodTag = selectedMood)
        }
        findNavController().popBackStackSafe()
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.selectedEntry.collect { entry ->
                        if (entry != null && !isUserTyping && arguments?.containsKey("draft_content") != true) {
                            isBindingData = true
                            binding.etJournalTitle.setText(entry.title.parseAsHtml())
                            binding.etJournalContent.setText(entry.content.parseAsHtml())
                            selectedMood = entry.moodTag.ifBlank { "Calm" }
                            updateMoodChipStyles()
                            updateWritingStats()
                            updateStatusBadge(if (entry.isSynced) "Synced" else "Offline Draft")
                            isBindingData = false
                        }
                    }
                }

                launch {
                    viewModel.uiEvent.collect { event ->
                        when (event) {
                            is JournalUiEvent.ValidationError -> {
                                Toast.makeText(requireContext(), event.message, Toast.LENGTH_SHORT).show()
                            }
                            is JournalUiEvent.ShowMessage -> {
                                Toast.makeText(requireContext(), event.message, Toast.LENGTH_SHORT).show()
                            }
                            is JournalUiEvent.NavigateBack -> {
                                findNavController().popBackStackSafe()
                            }
                            else -> {}
                        }
                    }
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        val contentText = binding.etJournalContent.text?.toString().orEmpty().trim()
        if (contentText.isNotBlank()) {
            val titleText = binding.etJournalTitle.text?.toString().orEmpty()
            viewModel.save(titleText, contentText, moodTag = selectedMood)
        }
    }

    override fun onDestroyView() {
        autosaveJob?.cancel()
        streamingJob?.cancel()
        _binding = null
        super.onDestroyView()
    }
}
