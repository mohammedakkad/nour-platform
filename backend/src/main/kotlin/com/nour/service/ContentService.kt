package com.nour.service

import com.nour.dto.*
import com.nour.model.ContentItem
import com.nour.model.ContentStatus
import com.nour.model.ContentType
import com.nour.repository.ContentRepository
import com.nour.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class ContentService(
    private val contentRepository: ContentRepository,
    private val userRepository: UserRepository
) {
    fun getPublishedContent(
        grade: Int?, subject: String?, page: Int, size: Int
    ): PagedResponse<ContentItemResponse> {
        val pageable = PageRequest.of(page, size)
        val result = when {
            grade != null && subject != null ->
                contentRepository.findByStatusAndGradeLevelAndSubject(
                    ContentStatus.PUBLISHED, grade, subject, pageable)
            grade != null ->
                contentRepository.findByStatusAndGradeLevel(
                    ContentStatus.PUBLISHED, grade, pageable)
            else ->
                contentRepository.findByStatus(ContentStatus.PUBLISHED, pageable)
        }
        return PagedResponse(
            content       = result.content.map { it.toResponse() },
            totalElements = result.totalElements,
            totalPages    = result.totalPages,
            page          = page,
            size          = size
        )
    }

    fun getContentById(id: String): ContentItemResponse =
        contentRepository.findById(UUID.fromString(id))
            .orElseThrow { RuntimeException("المحتوى غير موجود") }
            .toResponse()

    fun uploadContent(
        metadata: ContentUploadRequest,
        file: MultipartFile
    ): ContentItemResponse {
        // TODO: upload file to S3/MinIO and get URL
        val fileUrl = "pending-upload/${file.originalFilename}"
        val item = ContentItem(
            titleAr    = metadata.titleAr,
            type       = ContentType.valueOf(metadata.type),
            subject    = metadata.subject,
            gradeLevel = metadata.gradeLevel,
            status     = ContentStatus.DRAFT,
            createdBy  = userRepository.findById(
                UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .orElseThrow { RuntimeException("المستخدم غير موجود") },
            fileUrl    = fileUrl,
            fileSizeMb = (file.size / (1024.0 * 1024.0)).toBigDecimal()
        )
        return contentRepository.save(item).toResponse()
    }

    fun updateStatus(id: String, request: ContentStatusRequest): ContentItemResponse {
        val item = contentRepository.findById(UUID.fromString(id))
            .orElseThrow { RuntimeException("المحتوى غير موجود") }
        val updated = item.copy(status = ContentStatus.valueOf(request.status))
        return contentRepository.save(updated).toResponse()
    }

    private fun ContentItem.toResponse() = ContentItemResponse(
        id              = id.toString(),
        titleAr         = titleAr,
        type            = type.name,
        subject         = subject,
        gradeLevel      = gradeLevel,
        status          = status.name,
        createdBy       = createdBy.fullNameAr,
        fileUrl         = fileUrl,
        fileSizeMb      = fileSizeMb,
        durationMinutes = durationMinutes,
        downloadCount   = downloadCount
    )
}
