package com.kintsugi.app.features.notification.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentNotificationBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * Flagship Notification Center Fragment displaying categorized notifications and unread status.
 */
@AndroidEntryPoint
class NotificationFragment : Fragment() {

    private var _binding: FragmentNotificationBinding? = null
    private val binding get() = _binding!!

    private val viewModel: NotificationViewModel by viewModels()
    private lateinit var notificationAdapter: NotificationAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupToolbar()
        setupAdapters()
        setupActions()
        observeViewModel()
    }

    private fun setupToolbar() {
        binding.toolbar.apply {
            setTitle("Notifications")
            setSubtitle("Your updates and gentle reminders")
            showBackButton {
                findNavController().popBackStackSafe()
            }
        }
    }

    private fun setupAdapters() {
        notificationAdapter = NotificationAdapter { notification ->
            viewModel.markAsRead(notification.id)
        }
        binding.rvNotifications.adapter = notificationAdapter
    }

    private fun setupActions() {
        binding.btnMarkAllRead.setOnClickListener {
            viewModel.markAllAsRead()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.notificationsState.collect { notifications ->
                    if (notifications.isEmpty()) {
                        binding.rvNotifications.visibility = View.GONE
                        binding.cardEmptyNotifications.visibility = View.VISIBLE
                    } else {
                        binding.cardEmptyNotifications.visibility = View.GONE
                        binding.rvNotifications.visibility = View.VISIBLE
                        notificationAdapter.submitList(notifications)
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
