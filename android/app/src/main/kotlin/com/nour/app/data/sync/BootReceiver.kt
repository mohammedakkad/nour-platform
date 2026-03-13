package com.nour.app.data.sync

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.nour.app.sync.SyncWorker
import java.util.concurrent.TimeUnit

/**
 * Boot Receiver — يعيد جدولة المزامنة بعد إعادة تشغيل الجهاز
 * WorkManager يعيد الجدولة تلقائياً في معظم الحالات،
 * لكن هذا Receiver يضمن ذلك على الأجهزة القديمة
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(4L, TimeUnit.HOURS)
            .setConstraints(constraints)
            .setBackoffCriteria(
                androidx.work.BackoffPolicy.EXPONENTIAL,
                15L,
                TimeUnit.MINUTES
            )
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "nour_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
}
