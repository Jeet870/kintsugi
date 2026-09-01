package com.kintsugi.app.features.auth.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.NavOptions
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.R
import com.kintsugi.app.databinding.FragmentPasswordResetSuccessBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class PasswordResetSuccessFragment : Fragment() {

    private var _binding: FragmentPasswordResetSuccessBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPasswordResetSuccessBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnBackToLogin.setOnClickListener {
            try {
                val navOptions = NavOptions.Builder()
                    .setPopUpTo(R.id.nav_forgot_password, true)
                    .build()
                findNavController().navigate(R.id.nav_auth_pager, null, navOptions)
            } catch (_: Exception) {
                try {
                    findNavController().popBackStack(R.id.nav_auth_pager, false)
                } catch (_: Exception) {
                    activity?.finish()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
