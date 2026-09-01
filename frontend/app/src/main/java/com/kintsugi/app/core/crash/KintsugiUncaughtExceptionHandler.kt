package com.kintsugi.app.core.crash

import android.content.Context
import android.os.Build
import com.kintsugi.app.BuildConfig
import timber.log.Timber

class KintsugiUncaughtExceptionHandler private constructor(
    private val context: Context,
    private val defaultHandler: Thread.UncaughtExceptionHandler?
) : Thread.UncaughtExceptionHandler {

    override fun uncaughtException(thread: Thread, throwable: Throwable) {
        try {
            val diagnosticInfo = buildString {
                appendLine("=== KINTSUGI UNCAUGHT EXCEPTION REPORT ===")
                appendLine("Thread: ${thread.name} (id: ${thread.id})")
                appendLine("App Version: ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
                appendLine("Android Version: ${Build.VERSION.RELEASE} (SDK ${Build.VERSION.SDK_INT})")
                appendLine("Device: ${Build.MANUFACTURER} ${Build.MODEL}")
                appendLine("Exception: ${throwable.javaClass.name} - ${throwable.message}")
            }
            Timber.e(throwable, diagnosticInfo)
        } catch (e: Exception) {
            Timber.e(e, "Error inside KintsugiUncaughtExceptionHandler")
        } finally {
            defaultHandler?.uncaughtException(thread, throwable)
        }
    }

    companion object {
        fun register(context: Context) = initialize(context)

        fun initialize(context: Context) {
            val currentHandler = Thread.getDefaultUncaughtExceptionHandler()
            if (currentHandler !is KintsugiUncaughtExceptionHandler) {
                Thread.setDefaultUncaughtExceptionHandler(
                    KintsugiUncaughtExceptionHandler(context.applicationContext, currentHandler)
                )
            }
        }
    }
}
