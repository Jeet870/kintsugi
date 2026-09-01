package com.kintsugi.app.features.auth.ui

import android.os.Bundle
import android.os.CountDownTimer
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.R
import com.kintsugi.app.core.common.Result
import com.kintsugi.app.databinding.FragmentOtpVerificationBinding
import com.kintsugi.app.features.auth.data.AuthRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class OtpVerificationFragment : Fragment() {

    private var _binding: FragmentOtpVerificationBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var authRepository: AuthRepository

    private var targetEmail: String = ""
    private var resendTimer: CountDownTimer? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOtpVerificationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        targetEmail = arguments?.getString("email").orEmpty()
        binding.tvOtpSentTo.text = "We sent a 6-digit security code to $targetEmail"

        binding.toolbar.apply {
            setTitle("Verify Code")
            setSubtitle("Account Security & Recovery")
            showBackButton {
                findNavController().popBackStack()
            }
        }

        startResendCountdown()

        binding.btnResendCode.setOnClickListener {
            if (targetEmail.isNotEmpty()) {
                lifecycleScope.launch {
                    val result = authRepository.forgotPassword(targetEmail)
                    if (result is Result.Success) {
                        Toast.makeText(requireContext(), "A new code has been sent.", Toast.LENGTH_SHORT).show()
                        startResendCountdown()
                    }
                }
            }
        }

        binding.btnVerifyOtp.setOnClickListener {
            val otpCode = binding.etOtpCode.getText().toString().trim()
            if (otpCode.length != 6) {
                Toast.makeText(requireContext(), "Please enter the complete 6-digit verification code.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                Toast.makeText(requireContext(), "Verifying security code...", Toast.LENGTH_SHORT).show()
                val result = authRepository.verifyResetOtp(targetEmail, otpCode)
                when (result) {
                    is Result.Success -> {
                        val resetToken = result.data
                        val bundle = Bundle().apply {
                            putString("reset_token", resetToken)
                        }
                        findNavController().navigate(R.id.action_otp_to_reset, bundle)
                    }
                    is Result.Error -> {
                        Toast.makeText(requireContext(), result.message ?: "The verification code is incorrect or expired.", Toast.LENGTH_SHORT).show()
                    }
                    else -> {}
                }
            }
        }
    }

    private fun startResendCountdown() {
        binding.btnResendCode.visibility = View.GONE
        binding.tvResendTimer.visibility = View.VISIBLE

        resendTimer?.cancel()
        resendTimer = object : CountDownTimer(60000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                binding.tvResendTimer.text = "Resend code in ${millisUntilFinished / 1000}s"
            }

            override fun onFinish() {
                binding.tvResendTimer.visibility = View.GONE
                binding.btnResendCode.visibility = View.VISIBLE
            }
        }.start()
    }

    override fun onDestroyView() {
        resendTimer?.cancel()
        resendTimer = null
        super.onDestroyView()
        _binding = null
    }
}
