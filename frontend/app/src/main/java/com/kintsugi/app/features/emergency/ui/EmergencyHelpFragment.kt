package com.kintsugi.app.features.emergency.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
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
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.navigation.Destinations
import com.kintsugi.app.core.navigation.navigateSafe
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentEmergencyHelpBinding
import com.kintsugi.app.databinding.ItemSelfCareCardBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

/**
 * Premium Flagship Emergency Support Companion Fragment.
 */
@AndroidEntryPoint
class EmergencyHelpFragment : Fragment() {

    private var _binding: FragmentEmergencyHelpBinding? = null
    private val binding get() = _binding!!

    private val viewModel: EmergencyHelpViewModel by viewModels()
    private lateinit var helplineAdapter: HelplineAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentEmergencyHelpBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupHeader()
        setupAdapters()
        setupSearch()
        setupActions()
        observeViewModel()
    }

    private var btnCountryTextView: android.widget.TextView? = null

    private fun setupHeader() {
        val currentCountry = viewModel.getSelectedCountry()
        binding.toolbar.apply {
            setTitle("Emergency Support")
            setSubtitle("Immediate help when you need it")
            showBackButton {
                findNavController().popBackStackSafe()
            }
        }
        btnCountryTextView = android.widget.TextView(requireContext()).apply {
            background = androidx.core.content.ContextCompat.getDrawable(requireContext(), com.kintsugi.app.R.drawable.bg_round_icon_btn)
            val px14 = (14 * resources.displayMetrics.density).toInt()
            val px8 = (8 * resources.displayMetrics.density).toInt()
            setPadding(px14, px8, px14, px8)
            text = "${currentCountry.flagEmoji} ${currentCountry.name} ▾"
            setTextColor(androidx.core.content.ContextCompat.getColor(requireContext(), com.kintsugi.app.R.color.royal_purple))
            typeface = android.graphics.Typeface.DEFAULT_BOLD
            textSize = 12f
            setOnClickListener {
                showCountrySelectionDialog()
            }
        }
        btnCountryTextView?.let { binding.toolbar.addCustomActionView(it) }
    }

    private fun setupAdapters() {
        helplineAdapter = HelplineAdapter(
            onCallClick = { helpline ->
                dialPhone(helpline.phoneNumber)
            }
        )
        binding.rvHelplines.adapter = helplineAdapter
    }

    private fun setupSearch() {
        binding.etSearchHelplines.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.setSearchQuery(s?.toString().orEmpty())
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun setupActions() {
        binding.btnHeroCall.setOnClickListener {
            dialPhone("14416")
        }

        binding.btnHeroChatAi.setOnClickListener {
            navigateSafe(Destinations.AIChat.DESTINATION_ID)
        }

        binding.btnOpenAiCompanion.setOnClickListener {
            navigateSafe(Destinations.AIChat.DESTINATION_ID)
        }
    }

    private fun showCountrySelectionDialog() {
        CountryPickerBottomSheet.show(childFragmentManager) { selectedCountry ->
            viewModel.setSelectedCountryCode(selectedCountry.isoCode)
            btnCountryTextView?.text = "${selectedCountry.flagEmoji} ${selectedCountry.name} ▾"
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.filteredHelplinesState.collect { result ->
                        when (result) {
                            is Result.Success -> helplineAdapter.submitList(result.data)
                            is Result.Error -> {
                                Toast.makeText(requireContext(), "Unable to load online helplines.", Toast.LENGTH_SHORT).show()
                            }
                            else -> {}
                        }
                    }
                }

                launch {
                    viewModel.calmingTipsState.collect { result ->
                        if (result is Result.Success) {
                            renderCalmingTips(result.data)
                        }
                    }
                }
            }
        }
    }

    private fun renderCalmingTips(tips: List<String>) {
        binding.llCalmingTips.removeAllViews()
        val sampleTips = listOf(
            Pair("Take five slow breaths", "Inhale deeply for 4 seconds, hold for 4, then release slowly for 6."),
            Pair("Drink a glass of water", "Hydrate gently and focus your attention on the cool sensation."),
            Pair("Ground your surroundings", "Name 5 things you can see, 4 you can touch, and 3 you can hear."),
            Pair("Reach out to someone", "Send a short text to a close friend, relative, or healthcare professional.")
        )

        sampleTips.forEachIndexed { index, tip ->
            val tipBinding = ItemSelfCareCardBinding.inflate(
                layoutInflater, binding.llCalmingTips, false
            )
            tipBinding.tvSelfCareIcon.text = "✦"
            tipBinding.tvSelfCareTitle.text = tip.first
            tipBinding.tvSelfCareDesc.text = tip.second

            binding.llCalmingTips.addView(tipBinding.root)
        }
    }

    private fun dialPhone(phoneNumber: String) {
        try {
            val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${phoneNumber.replace("-", "")}"))
            startActivity(dialIntent)
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Unable to open phone dialer.", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
