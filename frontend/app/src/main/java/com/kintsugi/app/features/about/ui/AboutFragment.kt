package com.kintsugi.app.features.about.ui

import android.animation.ObjectAnimator
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AccelerateDecelerateInterpolator
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.core.navigation.popBackStackSafe
import com.kintsugi.app.databinding.FragmentAboutBinding
import dagger.hilt.android.AndroidEntryPoint

/**
 * Storytelling Fragment introducing the Kintsugi philosophy, mission, and privacy commitment.
 */
@AndroidEntryPoint
class AboutFragment : Fragment() {

    private var _binding: FragmentAboutBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AboutViewModel by viewModels()
    private var logoBreathingAnimator: ObjectAnimator? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAboutBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupToolbar()
        setupLogoBreathingAnimation()
    }

    private fun setupToolbar() {
        binding.toolbar.apply {
            setTitle("About Kintsugi")
            setSubtitle("Sanctuary & Philosophy")
            showBackButton {
                findNavController().popBackStackSafe()
            }
        }
    }

    private fun setupLogoBreathingAnimation() {
        logoBreathingAnimator = ObjectAnimator.ofFloat(binding.aboutLogo, "scaleX", 1.0f, 1.08f, 1.0f).apply {
            duration = 3200
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }

        ObjectAnimator.ofFloat(binding.aboutLogo, "scaleY", 1.0f, 1.08f, 1.0f).apply {
            duration = 3200
            repeatCount = ObjectAnimator.INFINITE
            interpolator = AccelerateDecelerateInterpolator()
            start()
        }
    }

    override fun onDestroyView() {
        logoBreathingAnimator?.cancel()
        logoBreathingAnimator = null
        super.onDestroyView()
        _binding = null
    }
}
