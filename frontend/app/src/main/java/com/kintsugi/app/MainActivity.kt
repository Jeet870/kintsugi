package com.kintsugi.app

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.NavHostFragment
import com.kintsugi.app.core.datastore.ThemePreferences
import com.kintsugi.app.core.repository.SessionRepository
import com.kintsugi.app.core.repository.SessionState
import com.kintsugi.app.core.ui.SystemBarController
import com.kintsugi.app.databinding.ActivityMainBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    @Inject
    lateinit var sessionRepository: SessionRepository

    @Inject
    lateinit var themePreferences: ThemePreferences

    private val rootDestinations = setOf(
        R.id.nav_dashboard,
        R.id.nav_mood,
        R.id.nav_companion,
        R.id.nav_journal,
        R.id.nav_motivation,
        R.id.nav_profile
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Enable Material 3 Expressive Edge-to-Edge with Light Status/Nav Bar Icons over #09090B
        SystemBarController.setupEdgeToEdge(window, isLightIcons = true)
        setupWindowInsets()

        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController

        binding.bottomNavigation.setOnTabSelectedListener { destinationId ->
            try {
                if (navController.currentDestination?.id != destinationId) {
                    navController.navigate(destinationId)
                }
            } catch (_: Exception) {}
        }

        navController.addOnDestinationChangedListener { _, destination, _ ->
            val isRoot = destination.id in rootDestinations
            
            if (isRoot) {
                if (binding.bottomNavigation.visibility != View.VISIBLE) {
                    binding.bottomNavigation.visibility = View.VISIBLE
                    binding.bottomNavigation.alpha = 0f
                    binding.bottomNavigation.translationY = 80f
                    binding.bottomNavigation.animate()
                        .translationY(0f)
                        .alpha(1f)
                        .setDuration(200)
                        .start()
                }
                binding.bottomNavigation.setSelectedTab(destination.id)
            } else {
                if (binding.bottomNavigation.visibility != View.GONE) {
                    binding.bottomNavigation.animate()
                        .translationY(120f)
                        .alpha(0f)
                        .setDuration(180)
                        .withEndAction {
                            binding.bottomNavigation.visibility = View.GONE
                        }
                        .start()
                }
            }
        }

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                sessionRepository.sessionState.collect { state ->
                    when (state) {
                        is SessionState.Unauthenticated, is SessionState.Expired -> {
                            val currentId = navController.currentDestination?.id
                            if (currentId != null && currentId != R.id.nav_splash && currentId != R.id.nav_auth_pager) {
                                try {
                                    navController.navigate(R.id.nav_auth_pager) {
                                        popUpTo(R.id.nav_graph) { inclusive = true }
                                    }
                                } catch (_: Exception) {}
                            }
                        }
                        is SessionState.Authenticated -> {
                            val currentId = navController.currentDestination?.id
                            if (currentId == R.id.nav_auth_pager || currentId == R.id.nav_splash) {
                                try {
                                    navController.navigate(R.id.nav_dashboard) {
                                        popUpTo(R.id.nav_auth_pager) { inclusive = true }
                                    }
                                } catch (_: Exception) {}
                            }
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    private fun setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { _, insets ->
            val navBarInsets = insets.getInsets(
                WindowInsetsCompat.Type.navigationBars() or WindowInsetsCompat.Type.displayCutout()
            )
            val baseNavMargin = (16 * resources.displayMetrics.density).toInt()

            val navLp = binding.bottomNavigation.layoutParams as? ViewGroup.MarginLayoutParams
            navLp?.bottomMargin = navBarInsets.bottom + baseNavMargin
            navLp?.leftMargin = baseNavMargin
            navLp?.rightMargin = baseNavMargin
            binding.bottomNavigation.layoutParams = navLp

            insets
        }
    }
}
