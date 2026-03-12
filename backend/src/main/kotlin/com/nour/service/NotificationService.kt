package com.nour.service

import com.nour.dto.*
import com.nour.model.Notification
import com.nour.model.NotificationType
import com.nour.repository.NotificationRepository
import com.nour.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val userRepository: UserRepository
) {
    fun getNotificationsForCurrentUser(page: Int, size: Int): PagedResponse<NotificationResponse> {
        // TODO: get current user from SecurityContext
        val pageable = PageRequest.of(page, size)
        val result   = notificationRepository.findAll(pageable)
        return PagedResponse(
            content       = result.content.map { it.toResponse() },
            totalElements = result.totalElements,
            totalPages    = result.totalPages,
            page          = page,
            size          = size
        )
    }

    fun markAsRead(id: String) {
        val n = notificationRepository.findById(UUID.fromString(id))
            .orElseThrow { RuntimeException("الإشعار غير موجود") }
        notificationRepository.save(n.copy(isRead = true))
    }

    fun markAllAsRead() {
        notificationRepository.findAll().forEach {
            notificationRepository.save(it.copy(isRead = true))
        }
    }

    fun sendNotification(request: SendNotificationRequest) {
        request.recipientIds.forEach { recipientId ->
            val recipient = userRepository.findById(UUID.fromString(recipientId))
                .orElse(null) ?: return@forEach
            notificationRepository.save(Notification(
                recipient = recipient,
                type      = NotificationType.valueOf(request.type),
                titleAr   = request.titleAr,
                bodyAr    = request.bodyAr
            ))
        }
    }

    private fun Notification.toResponse() = NotificationResponse(
        id        = id.toString(),
        type      = type.name,
        titleAr   = titleAr,
        bodyAr    = bodyAr,
        isRead    = isRead,
        createdAt = createdAt.toEpochMilli()
    )
}
