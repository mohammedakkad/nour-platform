package com.nour.app

import android.app.Application
import androidx.work.*
import com.nour.app.sync.SyncWorker
import dagger.hilt.android.HiltAndroidApp
import java.util.concurrent.TimeUnit

@HiltAndroidApp
class NourApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        setupCrashlytics()
        setupPeriodicSync()
    }
    
    private fun setupCrashlytics() {
        com.google.firebase.crashlytics.FirebaseCrashlytics.getInstance()
            .setCrashlyticsCollectionEnabled(true)
    }

    private fun setupPeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(4L, TimeUnit.HOURS)
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15L, TimeUnit.MINUTES)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "nour_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
}
