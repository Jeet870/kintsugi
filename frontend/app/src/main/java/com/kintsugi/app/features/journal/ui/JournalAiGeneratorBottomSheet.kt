package com.kintsugi.app.features.journal.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.kintsugi.app.databinding.FragmentJournalAiGeneratorBinding
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class JournalAiGeneratorBottomSheet : BottomSheetDialogFragment() {

    private var _binding: FragmentJournalAiGeneratorBinding? = null
    private val binding get() = _binding!!

    private val viewModel: JournalViewModel by activityViewModels()

    var onDraftGenerated: ((title: String, content: String, mood: String, summary: String) -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentJournalAiGeneratorBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupPromptChips()
        setupButtons()
    }

    private fun setupPromptChips() {
        val chips = mapOf(
            binding.chipPromptDifficult to "I've had a difficult day.",
            binding.chipPromptAnxious to "I feel anxious today.",
            binding.chipPromptWonderful to "Something wonderful happened today!",
            binding.chipPromptExhausted to "I feel emotionally exhausted.",
            binding.chipPromptReflect to "Help me reflect on today.",
            binding.chipPromptOrganize to "Help me organize my thoughts."
        )

        chips.forEach { (view, text) ->
            view.setOnClickListener {
                binding.etAiPromptInput.setText(text)
                binding.etAiPromptInput.setSelection(text.length)
            }
        }
    }

    private fun setupButtons() {
        binding.btnCloseAiGenerator.setOnClickListener {
            dismiss()
        }

        binding.btnGenerateJournalDraft.setOnClickListener {
            val userPrompt = binding.etAiPromptInput.text?.toString().orEmpty().ifBlank {
                "Help me reflect on today."
            }

            lifecycleScope.launch {
                binding.layoutGeneratingProgress.visibility = View.VISIBLE
                binding.btnGenerateJournalDraft.isEnabled = false

                val steps = listOf(
                    "Thinking...",
                    "Understanding your feelings...",
                    "Organizing your thoughts...",
                    "Writing your reflection..."
                )

                for (step in steps) {
                    binding.tvGeneratingStatusStep.text = step
                    delay(400)
                }

                viewModel.generateFullAiDraft(userPrompt) { title, content, mood, summary ->
                    onDraftGenerated?.invoke(title, content, mood, summary)
                    dismiss()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val TAG = "JournalAiGeneratorBottomSheet"

        fun newInstance(onGenerated: (title: String, content: String, mood: String, summary: String) -> Unit): JournalAiGeneratorBottomSheet {
            return JournalAiGeneratorBottomSheet().apply {
                onDraftGenerated = onGenerated
            }
        }
    }
}
