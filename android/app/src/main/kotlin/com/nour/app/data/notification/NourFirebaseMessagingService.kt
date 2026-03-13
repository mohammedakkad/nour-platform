package com.nour.app.data.notification

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * Firebase Cloud Messaging Service
 * يستقبل Push Notifications من الباك إند
 * TODO: تفعيل منطق الإشعارات عند إضافة FCM للباك إند
 */
class NourFirebaseMessagingService : FirebaseMessagingService() {

    /**
     * يُستدعى عند وصول رسالة push notification
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: return
        val body  = remoteMessage.notification?.body  ?: remoteMessage.data["body"]  ?: ""

        showLocalNotification(title, body)
    }

    /**
     * يُستدعى عند تجديد FCM token — يجب إرساله للسيرفر
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // TODO: إرسال token الجديد للباك إند عبر AuthRepository
    }

    private fun showLocalNotification(title: String, body: String) {
        // TODO: إنشاء NotificationChannel وعرض الإشعار
        // سيتم تفعيله عند ربط FCM بالباك إند
    }
}
