package com.kintsugi.app.features.auth.ui

import android.os.Bundle
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.R
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.databinding.FragmentForgotPasswordBinding
import com.kintsugi.app.features.auth.data.AuthRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ForgotPasswordFragment : Fragment() {

    private var _binding: FragmentForgotPasswordBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var authRepository: AuthRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentForgotPasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.toolbar.apply {
            setTitle("Forgot Password")
            setSubtitle("Account Security & Recovery")
            showBackButton {
                findNavController().popBackStack()
            }
        }

        binding.btnSendOtp.setOnClickListener {
            val email = binding.etForgotEmail.getText().toString().trim()
            if (email.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                Toast.makeText(requireContext(), "Please enter a valid email address.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                Toast.makeText(requireContext(), "Sending verification code...", Toast.LENGTH_SHORT).show()
                val result = authRepository.forgotPassword(email)
                when (result) {
                    is Result.Success -> {
                        Toast.makeText(requireContext(), result.data, Toast.LENGTH_LONG).show()
                        val bundle = Bundle().apply {
                            putString("email", email)
                        }
                        findNavController().navigate(R.id.action_forgot_to_otp, bundle)
                    }
                    is Result.Error -> {
                        Toast.makeText(requireContext(), result.message ?: "Unable to request password reset code.", Toast.LENGTH_SHORT).show()
                    }
                    else -> {}
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
