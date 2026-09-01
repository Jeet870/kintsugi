package com.kintsugi.app.features.auth.ui

import android.os.Bundle
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.lifecycle.viewModelScope
import androidx.navigation.fragment.findNavController
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.google.android.material.tabs.TabLayoutMediator
import com.kintsugi.app.R
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.core.model.UserDto
import com.kintsugi.app.databinding.FragmentAuthPagerBinding
import com.kintsugi.app.databinding.FragmentLoginBinding
import com.kintsugi.app.databinding.FragmentRegisterBinding
import com.kintsugi.app.features.auth.data.AuthRepository
import dagger.hilt.android.AndroidEntryPoint
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface AuthUiEvent {
    data object NavigateHome : AuthUiEvent
    data class ShowSnackbar(val message: String) : AuthUiEvent
    data object HideKeyboard : AuthUiEvent
    data object ClearInputs : AuthUiEvent
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : com.kintsugi.app.core.ui.base.BaseViewModel() {

    private val _loginState = MutableStateFlow<Result<UserDto>?>(null)
    val loginState: StateFlow<Result<UserDto>?> = _loginState.asStateFlow()

    private val _registerState = MutableStateFlow<Result<UserDto>?>(null)
    val registerState: StateFlow<Result<UserDto>?> = _registerState.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _validationErrors = MutableStateFlow<String?>(null)
    val validationErrors: StateFlow<String?> = _validationErrors.asStateFlow()

    private val _uiEvents = MutableSharedFlow<AuthUiEvent>(extraBufferCapacity = 16)
    val uiEvents: SharedFlow<AuthUiEvent> = _uiEvents.asSharedFlow()

    fun login(email: String, password: String) {
        val trimmedEmail = email.trim()
        if (!validateEmail(trimmedEmail)) {
            _validationErrors.value = "Please enter a valid email address."
            _uiEvents.tryEmit(AuthUiEvent.ShowSnackbar("Please enter a valid email address."))
            return
        }
        if (password.isBlank()) {
            _validationErrors.value = "Password cannot be empty."
            _uiEvents.tryEmit(AuthUiEvent.ShowSnackbar("Password cannot be empty."))
            return
        }

        _validationErrors.value = null
        _isLoading.value = true
        _uiEvents.tryEmit(AuthUiEvent.HideKeyboard)

        viewModelScope.launch {
            val result = authRepository.login(trimmedEmail, password)
            _isLoading.value = false
            _loginState.value = result
            if (result is Result.Success) {
                _uiEvents.emit(AuthUiEvent.NavigateHome)
            } else if (result is Result.Error) {
                _uiEvents.emit(AuthUiEvent.ShowSnackbar(result.message ?: "Authentication failed"))
            }
        }
    }

    fun register(name: String, email: String, password: String) {
        val trimmedName = name.trim()
        val trimmedEmail = email.trim()

        if (trimmedName.isBlank()) {
            _validationErrors.value = "Please enter your name."
            _uiEvents.tryEmit(AuthUiEvent.ShowSnackbar("Please enter your name."))
            return
        }
        if (!validateEmail(trimmedEmail)) {
            _validationErrors.value = "Please enter a valid email address."
            _uiEvents.tryEmit(AuthUiEvent.ShowSnackbar("Please enter a valid email address."))
            return
        }
        if (!validatePasswordStrength(password)) {
            _validationErrors.value = "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters."
            _uiEvents.tryEmit(AuthUiEvent.ShowSnackbar("Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters."))
            return
        }

        _validationErrors.value = null
        _isLoading.value = true
        _uiEvents.tryEmit(AuthUiEvent.HideKeyboard)

        viewModelScope.launch {
            val result = authRepository.register(trimmedName, trimmedEmail, password)
            _isLoading.value = false
            _registerState.value = result
            if (result is Result.Success) {
                _uiEvents.emit(AuthUiEvent.NavigateHome)
            } else if (result is Result.Error) {
                _uiEvents.emit(AuthUiEvent.ShowSnackbar(result.message ?: "Registration failed"))
            }
        }
    }

    private fun validateEmail(email: String): Boolean {
        return email.isNotBlank() && Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    private fun validatePasswordStrength(password: String): Boolean {
        if (password.length < 8) return false
        val hasUpper = password.any { it.isUpperCase() }
        val hasLower = password.any { it.isLowerCase() }
        val hasDigit = password.any { it.isDigit() }
        val hasSpecial = password.any { !it.isLetterOrDigit() }
        return hasUpper && hasLower && hasDigit && hasSpecial
    }
}

@AndroidEntryPoint
class AuthPagerFragment : Fragment() {

    private var _binding: FragmentAuthPagerBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAuthPagerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupViewPager()
    }

    private fun setupViewPager() {
        val adapter = AuthPagerAdapter(this)
        binding.viewPager.adapter = adapter

        TabLayoutMediator(binding.tabLayout, binding.viewPager) { tab, position ->
            tab.text = if (position == 0) "Sign In" else "Create Account"
        }.attach()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private inner class AuthPagerAdapter(fragment: Fragment) : FragmentStateAdapter(fragment) {
        override fun getItemCount(): Int = 2

        override fun createFragment(position: Int): Fragment {
            return if (position == 0) LoginFragment() else RegisterFragment()
        }
    }
}

@AndroidEntryPoint
class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by viewModels({ requireParentFragment() })

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.getText().toString()
            val password = binding.etPassword.getText().toString()
            viewModel.login(email, password)
        }

        binding.tvForgotPassword.setOnClickListener {
            try {
                val controller = parentFragment?.findNavController() ?: findNavController()
                controller.navigate(R.id.nav_forgot_password)
            } catch (_: Exception) {}
        }

        observeUiEvents()
    }

    private fun observeUiEvents() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiEvents.collect { event ->
                    when (event) {
                        is AuthUiEvent.NavigateHome -> {
                            try {
                                if (isAdded) {
                                    val controller = parentFragment?.findNavController() ?: findNavController()
                                    if (controller.currentDestination?.id == R.id.nav_auth_pager) {
                                        controller.navigate(R.id.action_auth_to_dashboard)
                                    }
                                }
                            } catch (_: Exception) {
                                // MainActivity handles session navigation automatically
                            }
                        }
                        is AuthUiEvent.ShowSnackbar -> {
                            context?.let { ctx ->
                                Toast.makeText(ctx, event.message, Toast.LENGTH_SHORT).show()
                            }
                        }
                        else -> {}
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

@AndroidEntryPoint
class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by viewModels({ requireParentFragment() })

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnRegister.setOnClickListener {
            val name = binding.etName.getText().toString()
            val email = binding.etRegEmail.getText().toString()
            val password = binding.etRegPassword.getText().toString()
            viewModel.register(name, email, password)
        }

        observeUiEvents()
    }

    private fun observeUiEvents() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiEvents.collect { event ->
                    when (event) {
                        is AuthUiEvent.NavigateHome -> {
                            try {
                                if (isAdded) {
                                    val controller = parentFragment?.findNavController() ?: findNavController()
                                    if (controller.currentDestination?.id == R.id.nav_auth_pager) {
                                        controller.navigate(R.id.action_auth_to_dashboard)
                                    }
                                }
                            } catch (_: Exception) {
                                // MainActivity handles session navigation automatically
                            }
                        }
                        is AuthUiEvent.ShowSnackbar -> {
                            context?.let { ctx ->
                                Toast.makeText(ctx, event.message, Toast.LENGTH_SHORT).show()
                            }
                        }
                        else -> {}
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
