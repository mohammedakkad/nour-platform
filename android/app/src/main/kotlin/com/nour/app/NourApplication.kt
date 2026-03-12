package com.nour.app

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.*
import com.nour.app.data.sync.SyncWorker
import dagger.hilt.android.HiltAndroidApp
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@HiltAndroidApp
class NourApplication : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        scheduleSyncWork()
    }

    /**
     * Schedule periodic background sync every 4 hours when connected.
     * This syncs offline exam submissions and downloads new content.
     */
    private fun scheduleSyncWork() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            repeatInterval = 4,
            repeatIntervalTimeUnit = TimeUnit.HOURS,
            flexTimeInterval = 30,
            flexTimeIntervalUnit = TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.MINUTES)
            .addTag("NOUR_PERIODIC_SYNC")
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "NourPeriodicSync",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
}
