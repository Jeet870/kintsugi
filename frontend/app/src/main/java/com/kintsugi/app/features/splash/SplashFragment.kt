package com.kintsugi.app.features.splash

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
import com.kintsugi.app.R
import com.kintsugi.app.core.repository.SessionRepository
import com.kintsugi.app.core.repository.SessionState
import com.kintsugi.app.databinding.FragmentSplashBinding
import dagger.hilt.android.AndroidEntryPoint
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SplashViewModel @Inject constructor(
    private val sessionRepository: SessionRepository
) : com.kintsugi.app.core.ui.base.BaseViewModel() {

    val sessionState: StateFlow<SessionState> = sessionRepository.sessionState

    fun initializeApp() {
        sessionRepository.resolveSession()
    }
}

@AndroidEntryPoint
class SplashFragment : Fragment() {

    private var _binding: FragmentSplashBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SplashViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSplashBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        startSplashAnimationSequence()
        viewModel.initializeApp()
        observeInitializationAndNavigate()
    }

    private fun startSplashAnimationSequence() {
        binding.logoEmblem.animate()
            .alpha(1f)
            .scaleX(1.0f)
            .scaleY(1.0f)
            .setDuration(800)
            .start()

        binding.tvAppName.animate()
            .alpha(1f)
            .setStartDelay(300)
            .setDuration(600)
            .start()

        binding.tvTagline.animate()
            .alpha(1f)
            .setStartDelay(500)
            .setDuration(600)
            .start()
    }

    private fun observeInitializationAndNavigate() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.sessionState.collect { state ->
                    if (state != SessionState.Loading) {
                        delay(1200)
                        if (_binding == null) return@collect

                        when (state) {
                            is SessionState.Authenticated -> {
                                findNavController().navigate(R.id.action_splash_to_dashboard)
                            }
                            else -> {
                                findNavController().navigate(R.id.action_splash_to_auth)
                            }
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
