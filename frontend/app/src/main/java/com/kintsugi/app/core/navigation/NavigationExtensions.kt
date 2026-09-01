package com.kintsugi.app.core.navigation

import android.os.Bundle
import androidx.annotation.IdRes
import androidx.fragment.app.Fragment
import androidx.lifecycle.Lifecycle
import androidx.navigation.NavController
import androidx.navigation.NavDirections
import androidx.navigation.fragment.findNavController
import com.kintsugi.app.BuildConfig
import timber.log.Timber

fun NavController.navigateSafe(directions: NavDirections) {
    try {
        currentDestination?.getAction(directions.actionId)?.let {
            navigate(directions)
        } ?: navigate(directions)
    } catch (e: Exception) {
        if (BuildConfig.DEBUG) {
            Timber.d(e, "Ignored duplicate or invalid navigation request: %s", directions)
        }
    }
}

fun NavController.navigateSafe(@IdRes resId: Int, args: Bundle? = null) {
    try {
        if (currentDestination?.id != resId) {
            if (args != null) {
                navigate(resId, args)
            } else {
                navigate(resId)
            }
        }
    } catch (e: Exception) {
        if (BuildConfig.DEBUG) {
            Timber.d(e, "Ignored invalid navigation destination ID: %d", resId)
        }
    }
}

fun NavController.navigateUpSafe(): Boolean {
    return try {
        navigateUp()
    } catch (e: Exception) {
        if (BuildConfig.DEBUG) {
            Timber.d(e, "Failed to navigate up safely")
        }
        false
    }
}

fun NavController.popBackStackSafe(): Boolean {
    return try {
        popBackStack()
    } catch (e: Exception) {
        if (BuildConfig.DEBUG) {
            Timber.d(e, "Failed to pop back stack safely")
        }
        false
    }
}

fun Fragment.navigateSafe(directions: NavDirections) {
    if (viewLifecycleOwner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) {
        try {
            val navController = findNavController()
            navController.navigateSafe(directions)
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) {
                Timber.d(e, "Failed to locate NavController for fragment navigation")
            }
        }
    }
}

fun Fragment.navigateSafe(@IdRes resId: Int, args: Bundle? = null) {
    if (viewLifecycleOwner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) {
        try {
            val navController = findNavController()
            navController.navigateSafe(resId, args)
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) {
                Timber.d(e, "Failed to locate NavController for fragment navigation ID")
            }
        }
    }
}
