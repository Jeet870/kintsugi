package com.kintsugi.app.features.settings.ui

import android.animation.ObjectAnimator
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.kintsugi.app.R
import com.kintsugi.app.core.ui.dialog.KintsugiConfirmationDialog
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.datastore.ThemeMode
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.core.navigation.Destinations
import com.kintsugi.app.core.navigation.navigateSafe
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentSettingsBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * Luxurious Personal Wellness Control Center Fragment.
 */
@AndroidEntryPoint
class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SettingsViewModel by viewModels()
    private var avatarBreathingAnimator: ObjectAnimator? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupHeader()
        setupAvatarBreathingAnimation()
        setupThemeSelectors()
        setupActions()
        observeViewModel()
    }

    private fun setupHeader() {
        binding.toolbar.apply {
            setTitle("Settings")
            setSubtitle("Manage your Kintsugi experience")
            showBackButton {
                findNavController().popBackStackSafe()
            }
        }
    }

    private fun setupAvatarBreathingAnimation() {
        avatarBreathingAnimator = ObjectAnimator.ofFloat(binding.heroAvatarLogo, "scaleX", 1.0f, 1.05f, 1.0f).apply {
            duration = 3500
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }

        ObjectAnimator.ofFloat(binding.heroAvatarLogo, "scaleY", 1.0f, 1.05f, 1.0f).apply {
            duration = 3500
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }
    }

    private fun setupThemeSelectors() {
        binding.cardThemeSettings.setOnClickListener {
            showAppearanceInfoDialog()
        }
        binding.btnChangeThemeAction.setOnClickListener {
            showAppearanceInfoDialog()
        }
    }

    private fun showAppearanceInfoDialog() {
        KintsugiConfirmationDialog.show(
            fragmentManager = childFragmentManager,
            title = "Appearance",
            subtitle = "Kintsugi currently supports a single carefully crafted dark theme.\n\nThis experience has been intentionally designed to provide consistent comfort, readability, reduced eye strain, and a calming atmosphere.\n\nAdditional themes may become available in a future release.",
            confirmButtonText = "Got it",
            cancelButtonText = "",
            iconRes = R.drawable.ic_theme_dark_outline,
            onConfirm = {}
        )
    }

    private fun setupActions() {
        binding.btnEditProfileAction.setOnClickListener {
            Toast.makeText(requireContext(), "Edit Profile bottom sheet ✦", Toast.LENGTH_SHORT).show()
        }

        binding.btnSaveProfileChanges.setOnClickListener {
            val newName = binding.etSettingsName.text?.toString().orEmpty().trim()
            val newAvatarUrl = binding.etSettingsAvatar.text?.toString().orEmpty().trim().ifEmpty { null }
            val notifEnabled = binding.switchNotifications.isChecked

            viewModel.updateProfile(
                name = newName,
                avatarUrl = newAvatarUrl,
                notificationEnabled = notifEnabled
            )
        }

        binding.switchNotifications.setOnCheckedChangeListener { _, isChecked ->
            viewModel.updateProfile(notificationEnabled = isChecked)
        }

        binding.rowPrivacySettings.setOnClickListener {
            navigateSafe(R.id.nav_privacy)
        }

        binding.rowDataExport.setOnClickListener {
            ExportBottomSheetDialogFragment.show(childFragmentManager)
        }

        binding.rowDeleteAccount.setOnClickListener {
            confirmDeleteAccount()
        }

        binding.rowSupport.setOnClickListener {
            navigateSafe(R.id.nav_support)
        }

        binding.rowTermsPolicy.setOnClickListener {
            navigateSafe(R.id.nav_terms)
        }

        binding.cardLogout.setOnClickListener {
            confirmLogout()
        }
    }

    private fun confirmLogout() {
        KintsugiConfirmationDialog.show(
            fragmentManager = childFragmentManager,
            title = "Sign Out",
            subtitle = "You'll be signed out of your account. Your wellness data will remain safely stored.",
            confirmButtonText = "Sign Out",
            cancelButtonText = "Cancel",
            iconRes = R.drawable.ic_logout_outline,
            onConfirm = {
                viewModel.logout()
                navigateSafe(Destinations.Auth.LOGIN_DESTINATION_ID)
            }
        )
    }

    private fun confirmDeleteAccount() {
        KintsugiConfirmationDialog.show(
            fragmentManager = childFragmentManager,
            title = "Delete Sanctuary Account",
            subtitle = "This will permanently remove your entries, mood history, and streak progress. This action cannot be undone.",
            confirmButtonText = "Delete Account",
            cancelButtonText = "Keep Account",
            iconRes = R.drawable.ic_delete_trash,
            onConfirm = {
                viewModel.logout()
                navigateSafe(Destinations.Auth.LOGIN_DESTINATION_ID)
            }
        )
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.currentUser.collect { user ->
                        if (user != null) {
                            renderUser(user)
                        }
                    }
                }

                launch {
                    viewModel.settingsState.collect { result ->
                        when (result) {
                            is Result.Success -> {
                                Toast.makeText(requireContext(), "Profile updated successfully.", Toast.LENGTH_SHORT).show()
                            }
                            is Result.Error -> {
                                Toast.makeText(requireContext(), result.message ?: "Unable to save changes. Please try again.", Toast.LENGTH_SHORT).show()
                            }
                            else -> {}
                        }
                    }
                }
            }
        }
    }

    private fun renderUser(user: UserDto) {
        binding.tvHeroName.text = user.name ?: "Sri Ram Chinthakayala"
        binding.tvHeroEmail.text = user.email

        if (binding.etSettingsName.text.isNull_or_empty()) {
            binding.etSettingsName.setText(user.name ?: "")
        }
        if (binding.etSettingsAvatar.text.isNull_or_empty() && user.avatarUrl != null) {
            binding.etSettingsAvatar.setText(user.avatarUrl)
        }
        binding.switchNotifications.isChecked = user.notificationEnabled
    }

    private fun CharSequence?.isNull_or_empty(): Boolean = this == null || this.isEmpty()

    override fun onDestroyView() {
        avatarBreathingAnimator?.cancel()
        avatarBreathingAnimator = null
        super.onDestroyView()
        _binding = null
    }
}
