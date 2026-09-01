package com.kintsugi.app.features.auth.ui

import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.R
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.databinding.FragmentResetPasswordBinding
import com.kintsugi.app.features.auth.data.AuthRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ResetPasswordFragment : Fragment() {

    private var _binding: FragmentResetPasswordBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var authRepository: AuthRepository

    private var resetToken: String = ""

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentResetPasswordBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        resetToken = arguments?.getString("reset_token").orEmpty()

        binding.toolbar.apply {
            setTitle("New Password")
            setSubtitle("Account Security & Recovery")
            showBackButton {
                findNavController().popBackStack()
            }
        }

        setupLiveValidation()

        binding.btnSubmitNewPassword.setOnClickListener {
            val newPassword = binding.etNewPassword.getText().toString()
            val confirmPassword = binding.etConfirmPassword.getText().toString()

            if (newPassword != confirmPassword) {
                Toast.makeText(requireContext(), "Passwords do not match.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (newPassword.length < 12) {
                Toast.makeText(requireContext(), "Password must be at least 12 characters long.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                Toast.makeText(requireContext(), "Updating password...", Toast.LENGTH_SHORT).show()
                val result = authRepository.resetPassword(resetToken, newPassword)
                when (result) {
                    is Result.Success -> {
                        findNavController().navigate(R.id.action_reset_to_success)
                    }
                    is Result.Error -> {
                        Toast.makeText(requireContext(), result.message ?: "Unable to reset password. Please check security requirements.", Toast.LENGTH_SHORT).show()
                    }
                    else -> {}
                }
            }
        }
    }

    private fun setupLiveValidation() {
        binding.etNewPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val pwd = s?.toString().orEmpty()
                
                val has12 = pwd.length >= 12
                val hasUpperLower = pwd.any { it.isUpperCase() } && pwd.any { it.isLowerCase() }
                val hasNumber = pwd.any { it.isDigit() }
                val hasSymbol = pwd.any { !it.isLetterOrDigit() }

                val colorSuccess = Color.parseColor("#34D399")
                val colorMuted = Color.parseColor("#8B88A0")

                binding.tvReqLength.setTextColor(if (has12) colorSuccess else colorMuted)
                binding.tvReqCases.setTextColor(if (hasUpperLower) colorSuccess else colorMuted)
                binding.tvReqNumber.setTextColor(if (hasNumber) colorSuccess else colorMuted)
                binding.tvReqSymbol.setTextColor(if (hasSymbol) colorSuccess else colorMuted)
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
