package com.kintsugi.app.features.journal.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.kintsugi.app.core.common.parseAsHtml
import com.kintsugi.app.databinding.FragmentJournalAiBottomSheetBinding
import kotlinx.coroutines.launch

class JournalAiBottomSheetFragment : BottomSheetDialogFragment() {

    private var _binding: FragmentJournalAiBottomSheetBinding? = null
    private val binding get() = _binding!!

    private val viewModel: JournalViewModel by activityViewModels()

    var onApplyResult: ((action: String, result: String) -> Unit)? = null
    var currentEditorContent: String = ""
    private var selectedAction: String = "continue"

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentJournalAiBottomSheetBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupClickListeners()
        observeViewModel()
    }

    private fun setupClickListeners() {
        binding.btnActionContinue.setOnClickListener {
            triggerAction("continue")
        }
        binding.btnActionRewriteProf.setOnClickListener {
            triggerAction("rewrite_professional")
        }
        binding.btnActionRewriteGentle.setOnClickListener {
            triggerAction("rewrite_gentle")
        }
        binding.btnActionExpand.setOnClickListener {
            triggerAction("expand")
        }
        binding.btnActionTitle.setOnClickListener {
            triggerAction("generate_title")
        }

        binding.btnCancelAi.setOnClickListener {
            dismiss()
        }

        binding.btnApplyAiResult.setOnClickListener {
            val rawResult = viewModel.aiResult.value ?: binding.tvAiResultPreview.text.toString()
            if (rawResult.isNotBlank()) {
                onApplyResult?.invoke(selectedAction, rawResult)
                dismiss()
            }
        }
    }

    private fun triggerAction(action: String) {
        selectedAction = action
        binding.containerActions.visibility = View.GONE
        binding.containerResult.visibility = View.VISIBLE
        binding.layoutAiProgress.visibility = View.VISIBLE
        binding.tvAiResultPreview.text = "Thinking and generating reflection..."

        viewModel.executeAiAssist(action = action, content = currentEditorContent)
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.isAiLoading.collect { isLoading ->
                        binding.layoutAiProgress.visibility = if (isLoading) View.VISIBLE else View.GONE
                    }
                }
                launch {
                    viewModel.aiResult.collect { result ->
                        if (!result.isNullOrBlank()) {
                            binding.tvAiResultPreview.text = result.parseAsHtml()
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

    companion object {
        const val TAG = "JournalAiBottomSheetFragment"

        fun newInstance(content: String, onApply: (String, String) -> Unit): JournalAiBottomSheetFragment {
            return JournalAiBottomSheetFragment().apply {
                currentEditorContent = content
                onApplyResult = onApply
            }
        }
    }
}
