package com.nour.service

import com.nour.dto.*
import com.nour.repository.ContentRepository
import com.nour.repository.ExamRepository
import com.nour.repository.NotificationRepository
import com.nour.model.ContentStatus
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class SyncService(
    private val examService: ExamService,
    private val contentRepository: ContentRepository,
    private val examRepository: ExamRepository,
    private val notificationRepository: NotificationRepository
) {
    fun syncSubmissions(submissions: List<SubmitExamRequest>): SyncResultResponse {
        var synced = 0
        val errors = mutableListOf<String>()
        submissions.forEach { req ->
            runCatching { examService.submitExam(req.examId, req); synced++ }
                .onFailure { errors.add("${req.examId}: ${it.message}") }
        }
        return SyncResultResponse(synced = synced, failed = errors.size, errors = errors)
    }

    fun getDelta(since: Long): SyncDeltaResponse {
        val sinceInstant = Instant.ofEpochMilli(since)
        val content = contentRepository
            .findByStatusAndUpdatedAtAfter(ContentStatus.PUBLISHED, sinceInstant)
            .map { ContentItemResponse(
                id = it.id.toString(), titleAr = it.titleAr, type = it.type.name,
                subject = it.subject, gradeLevel = it.gradeLevel, status = it.status.name,
                createdBy = it.createdBy.fullNameAr, fileUrl = it.fileUrl,
                fileSizeMb = it.fileSizeMb.toDouble(), durationMinutes = it.durationMinutes,
                downloadCount = it.downloadCount
            )}
        return SyncDeltaResponse(
            content           = content,
            exams             = emptyList(),
            notifications     = emptyList(),
            serverTimestamp   = Instant.now().toEpochMilli()
        )
    }
}
