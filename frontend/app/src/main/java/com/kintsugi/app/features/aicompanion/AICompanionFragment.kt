package com.kintsugi.app.features.aicompanion

import android.os.Bundle
import android.text.InputType
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.kintsugi.app.R
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.databinding.FragmentCompanionBinding
import com.kintsugi.app.features.aicompanion.ui.ChatViewModel
import com.kintsugi.app.features.aicompanion.ui.adapter.ChatMessageAdapter
import com.kintsugi.app.features.aicompanion.ui.components.AiOrbView
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AICompanionFragment : Fragment() {

    private var _binding: FragmentCompanionBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ChatViewModel by viewModels()
    private val adapter = ChatMessageAdapter()

    private var currentSessionId: String? = null
    private var currentSessionTitle: String = "Conversation"

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCompanionBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        arguments?.let { args ->
            currentSessionId = args.getString("sessionId")
            currentSessionTitle = args.getString("sessionTitle") ?: "Conversation"
        }

        currentSessionId?.let { id ->
            viewModel.loadSession(id)
        }

        setupToolbar()
        setupWindowInsets()
        setupRecyclerView()
        setupSuggestedPrompts()
        setupComposerInput()
        observeViewModelState()
    }

    private fun setupToolbar() {
        binding.toolbar.setTitle(currentSessionTitle)
        binding.toolbar.setSubtitle("Online • AI Wellness Assistant ✦")
        binding.toolbar.showBackButton {
            findNavController().navigateUp()
        }
    }

    private fun showOverflowOptionsMenu() {
        val options = arrayOf("Rename Conversation", "Delete Conversation", "Clear Messages")
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(currentSessionTitle)
            .setItems(options) { dialog, which ->
                val sessionId = currentSessionId ?: viewModel.currentSessionId.value
                when (which) {
                    0 -> sessionId?.let { showRenameDialog(it) }
                    1 -> sessionId?.let { showDeleteConfirmationDialog(it) }
                    2 -> viewModel.startNewSession()
                }
                dialog.dismiss()
            }
            .show()
    }

    private fun showRenameDialog(sessionId: String) {
        val input = EditText(requireContext()).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            setText(currentSessionTitle)
            setSelection(text.length)
        }
        val padding = (20 * resources.displayMetrics.density).toInt()

        val container = android.widget.FrameLayout(requireContext()).apply {
            setPadding(padding, (8 * resources.displayMetrics.density).toInt(), padding, 0)
            addView(input)
        }

        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Rename Conversation")
            .setView(container)
            .setPositiveButton("Save") { _, _ ->
                val newTitle = input.text.toString().trim()
                if (newTitle.isNotBlank()) {
                    currentSessionTitle = newTitle
                    binding.toolbar.setTitle(newTitle)
                    viewModel.renameSession(sessionId, newTitle)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showDeleteConfirmationDialog(sessionId: String) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Delete this conversation?")
            .setMessage("This action cannot be undone. All messages in this conversation will be permanently removed.")
            .setPositiveButton("Delete") { _, _ ->
                viewModel.deleteSession(sessionId)
                findNavController().navigateUp()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { _, insets ->
            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
            val navInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
            val baseMargin = (16 * resources.displayMetrics.density).toInt()
            val bottomMargin = if (imeInsets.bottom > 0) {
                imeInsets.bottom + (8 * resources.displayMetrics.density).toInt()
            } else {
                navInsets.bottom + baseMargin
            }
            val lp = binding.layoutInputBar.layoutParams as? ViewGroup.MarginLayoutParams
            lp?.bottomMargin = bottomMargin
            binding.layoutInputBar.layoutParams = lp
            insets
        }
    }

    private fun setupRecyclerView() {
        val layoutManager = LinearLayoutManager(requireContext()).apply {
            stackFromEnd = true
        }
        binding.rvChatMessages.layoutManager = layoutManager
        binding.rvChatMessages.adapter = adapter
    }

    private fun setupSuggestedPrompts() {
        binding.suggestedPrompts.onPromptClickListener = { promptText ->
            viewModel.sendPrompt(promptText)
        }
    }

    private fun setupComposerInput() {
        binding.etMessage.doAfterTextChanged { text ->
            viewModel.updateDraft(text?.toString() ?: "")
        }

        binding.btnSend.setOnClickListener {
            viewModel.sendMessage()
        }
    }

    private fun observeViewModelState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {

                launch {
                    viewModel.messagesState.collect { result ->
                        when (result) {
                            is Result.Success -> {
                                val messages = result.data
                                adapter.submitList(messages) {
                                    if (messages.isNotEmpty()) {
                                        binding.rvChatMessages.smoothScrollToPosition(messages.size - 1)
                                    }
                                }

                                if (messages.isEmpty()) {
                                    binding.suggestedPrompts.visibility = View.VISIBLE
                                    binding.rvChatMessages.visibility = View.GONE
                                } else {
                                    binding.suggestedPrompts.visibility = View.GONE
                                    binding.rvChatMessages.visibility = View.VISIBLE
                                }
                            }
                            else -> {}
                        }
                    }
                }

                launch {
                    viewModel.draftMessage.collect { draft ->
                        if (binding.etMessage.text?.toString() != draft) {
                            binding.etMessage.setText(draft)
                        }
                    }
                }

                launch {
                    viewModel.isTyping.collect { isTyping ->
                        binding.layoutTypingIndicator.visibility = if (isTyping) View.VISIBLE else View.GONE
                        if (isTyping && adapter.itemCount > 0) {
                            binding.rvChatMessages.smoothScrollToPosition(adapter.itemCount - 1)
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
