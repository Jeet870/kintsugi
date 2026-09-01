package com.kintsugi.app.features.aicompanion.ui

import android.os.Bundle
import android.text.InputType
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
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
import com.kintsugi.app.core.model.ChatSessionDto
import com.kintsugi.app.databinding.FragmentChatSessionsBinding
import com.kintsugi.app.features.aicompanion.ui.adapter.ChatSessionsAdapter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ChatSessionsFragment : Fragment() {

    private var _binding: FragmentChatSessionsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ChatSessionsViewModel by viewModels()
    private lateinit var adapter: ChatSessionsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentChatSessionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupToolbar()
        setupSearch()
        setupRecyclerView()
        setupActions()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.toolbar.apply {
            setTitle("AI Companion")
            setSubtitle("Your private conversations")
        }
    }

    private fun setupSearch() {
        binding.etSearchQuery.doAfterTextChanged { text ->
            val query = text?.toString() ?: ""
            viewModel.updateSearchQuery(query)
            binding.btnClearSearch.visibility = if (query.isNotBlank()) View.VISIBLE else View.GONE
            
            // Hide FAB when searching to prevent soft keyboard or list overlap
            if (query.isNotBlank()) {
                binding.fabNewChat.visibility = View.GONE
            } else if (binding.containerEmptyState.visibility != View.VISIBLE) {
                binding.fabNewChat.visibility = View.VISIBLE
            }
        }

        binding.etSearchQuery.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus && binding.containerEmptyState.visibility != View.VISIBLE) {
                binding.fabNewChat.hide()
            } else if (!hasFocus && binding.containerEmptyState.visibility != View.VISIBLE && binding.etSearchQuery.text.isNullOrBlank()) {
                binding.fabNewChat.show()
            }
        }

        binding.btnClearSearch.setOnClickListener {
            binding.etSearchQuery.text?.clear()
            viewModel.clearSearchQuery()
        }
    }

    private fun setupRecyclerView() {
        adapter = ChatSessionsAdapter(
            onSessionClick = { session -> openChatWindow(session.id, session.title) },
            onSessionLongClick = { session -> showSessionOptionsMenu(session) }
        )

        binding.rvSessions.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = this@ChatSessionsFragment.adapter
        }
    }

    private fun setupActions() {
        binding.fabNewChat.setOnClickListener {
            viewModel.createNewSession()
        }

        binding.btnEmptyStartChat.setOnClickListener {
            viewModel.createNewSession()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.sessionListItems.collect { result ->
                        when (result) {
                            is Result.Loading -> {
                                binding.containerEmptyState.visibility = View.GONE
                                binding.fabNewChat.visibility = View.GONE
                            }
                            is Result.Error -> {
                                binding.containerEmptyState.visibility = View.VISIBLE
                                binding.rvSessions.visibility = View.GONE
                                binding.fabNewChat.visibility = View.GONE
                            }
                            is Result.Empty -> {
                                binding.containerEmptyState.visibility = View.VISIBLE
                                binding.rvSessions.visibility = View.GONE
                                binding.fabNewChat.visibility = View.GONE
                            }
                            is Result.Success -> {
                                val items = result.data
                                adapter.submitList(items)
                                val isEmpty = items.isEmpty()
                                binding.containerEmptyState.visibility = if (isEmpty) View.VISIBLE else View.GONE
                                binding.rvSessions.visibility = if (isEmpty) View.GONE else View.VISIBLE
                                
                                // Hide FAB on empty state (since btn_empty_start_chat is present) or when searching
                                val isSearching = !binding.etSearchQuery.text.isNullOrBlank()
                                binding.fabNewChat.visibility = if (isEmpty || isSearching) View.GONE else View.VISIBLE
                            }
                        }
                    }
                }

                launch {
                    viewModel.navEvents.collect { event ->
                        when (event) {
                            is SessionNavEvent.OpenChatWindow -> openChatWindow(event.sessionId, event.title)
                        }
                    }
                }
            }
        }
    }

    private fun openChatWindow(sessionId: String, title: String?) {
        val bundle = Bundle().apply {
            putString("sessionId", sessionId)
            putString("sessionTitle", title ?: "Conversation")
        }
        try {
            findNavController().navigate(R.id.action_chat_sessions_to_chat_window, bundle)
        } catch (_: Exception) {
            findNavController().navigate(R.id.nav_companion, bundle)
        }
    }

    private fun showSessionOptionsMenu(session: ChatSessionDto) {
        val options = arrayOf("Rename Conversation", "Delete Conversation")
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(session.title ?: "Conversation Options")
            .setItems(options) { dialog, which ->
                when (which) {
                    0 -> showRenameDialog(session)
                    1 -> showDeleteConfirmationDialog(session)
                }
                dialog.dismiss()
            }
            .show()
    }

    private fun showRenameDialog(session: ChatSessionDto) {
        val input = EditText(requireContext()).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            setText(session.title ?: "")
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
                    viewModel.renameSession(session.id, newTitle)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showDeleteConfirmationDialog(session: ChatSessionDto) {
        com.kintsugi.app.core.ui.dialog.KintsugiConfirmationDialog.show(
            fragmentManager = childFragmentManager,
            title = "Delete Conversation?",
            subtitle = "This action cannot be undone. All messages in this conversation will be permanently removed.",
            confirmButtonText = "Delete",
            cancelButtonText = "Cancel",
            iconRes = R.drawable.ic_delete_trash,
            onConfirm = {
                viewModel.deleteSession(session.id)
            }
        )
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
