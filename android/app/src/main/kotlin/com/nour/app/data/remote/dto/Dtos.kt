package com.nour.app.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

// ──────────────────────────────────────────────
// Auth DTOs
// ──────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class LoginRequest(
    val username: String,
    val password: String
)

@JsonClass(generateAdapter = true)
data class RegisterRequest(
    val username: String,
    val password: String,
    @Json(name = "full_name_ar") val fullNameAr: String,
    val role: UserRole,
    @Json(name = "school_id") val schoolId: String? = null,
    @Json(name = "enrollment_code") val enrollmentCode: String? = null
)

@JsonClass(generateAdapter = true)
data class RefreshTokenRequest(
    @Json(name = "refresh_token") val refreshToken: String
)

@JsonClass(generateAdapter = true)
data class LoginResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "refresh_token") val refreshToken: String,
    @Json(name = "expires_in") val expiresIn: Long,
    val user: UserDto
)

@JsonClass(generateAdapter = true)
data class UserDto(
    val id: String,
    val username: String,
    @Json(name = "full_name_ar") val fullNameAr: String,
    val role: String,
    @Json(name = "school_id") val schoolId: String?,
    @Json(name = "class_id") val classId: String?,
    @Json(name = "is_active") val isActive: Boolean
)

// ──────────────────────────────────────────────
// Content DTOs
// ──────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class ContentItemDto(
    val id: String,
    @Json(name = "title_ar") val titleAr: String,
    val type: String,
    val subject: String,
    @Json(name = "grade_level") val gradeLevel: Int,
    val status: String,
    @Json(name = "created_by") val createdBy: String,
    @Json(name = "file_url") val fileUrl: String?,
    @Json(name = "file_size_mb") val fileSizeMb: Double,
    @Json(name = "duration_minutes") val durationMinutes: Int?,
    @Json(name = "download_count") val downloadCount: Int
)

@JsonClass(generateAdapter = true)
data class ContentUploadRequest(
    @Json(name = "title_ar") val titleAr: String,
    val type: String,
    val subject: String,
    @Json(name = "grade_level") val gradeLevel: Int
)

@JsonClass(generateAdapter = true)
data class ContentStatusRequest(
    val status: String,
    val reason: String? = null
)

// ──────────────────────────────────────────────
// Exam DTOs
// ──────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class QuestionDto(
    val id: String,
    @Json(name = "question_text_ar") val questionTextAr: String,
    val options: List<String>,
    @Json(name = "order_index") val orderIndex: Int
    // NOTE: correctOptionIndex is NOT included — server-side only!
)

@JsonClass(generateAdapter = true)
data class ExamDto(
    val id: String,
    @Json(name = "title_ar") val titleAr: String,
    @Json(name = "content_id") val contentId: String?,
    @Json(name = "class_id") val classId: String,
    @Json(name = "time_limit_minutes") val timeLimitMinutes: Int,
    @Json(name = "max_attempts") val maxAttempts: Int,
    @Json(name = "pass_score") val passScore: Double,
    @Json(name = "available_from") val availableFrom: Long,
    @Json(name = "available_until") val availableUntil: Long,
    @Json(name = "shuffle_questions") val shuffleQuestions: Boolean,
    val questions: List<QuestionDto>
)

@JsonClass(generateAdapter = true)
data class CreateExamRequest(
    @Json(name = "title_ar") val titleAr: String,
    @Json(name = "class_id") val classId: String,
    @Json(name = "time_limit_minutes") val timeLimitMinutes: Int,
    @Json(name = "pass_score") val passScore: Double,
    @Json(name = "available_from") val availableFrom: Long,
    @Json(name = "available_until") val availableUntil: Long,
    val questions: List<CreateQuestionRequest>
)

@JsonClass(generateAdapter = true)
data class CreateQuestionRequest(
    @Json(name = "question_text_ar") val questionTextAr: String,
    val options: List<String>,
    @Json(name = "correct_option_index") val correctOptionIndex: Int,
    val explanation: String? = null
)

@JsonClass(generateAdapter = true)
data class SubmitExamRequest(
    @Json(name = "exam_id") val examId: String,
    @Json(name = "student_id") val studentId: String,
    @Json(name = "attempt_number") val attemptNumber: Int,
    val answers: Map<String, Int>,
    @Json(name = "started_at") val startedAt: Long,
    @Json(name = "submitted_at") val submittedAt: Long,
    @Json(name = "duration_seconds") val durationSeconds: Int,
    @Json(name = "offline_submission") val offlineSubmission: Boolean = false
)

@JsonClass(generateAdapter = true)
data class ExamResultDto(
    val id: String,
    val score: Double,
    @Json(name = "is_passed") val isPassed: Boolean,
    @Json(name = "correct_count") val correctCount: Int,
    @Json(name = "total_questions") val totalQuestions: Int,
    @Json(name = "time_taken_seconds") val timeTakenSeconds: Int
)

@JsonClass(generateAdapter = true)
data class ClassReportDto(
    @Json(name = "class_id") val classId: String,
    @Json(name = "class_name") val className: String,
    @Json(name = "student_count") val studentCount: Int,
    @Json(name = "average_score") val averageScore: Double,
    @Json(name = "pass_rate") val passRate: Double
)

// ──────────────────────────────────────────────
// Notification DTOs
// ──────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class NotificationDto(
    val id: String,
    @Json(name = "type") val type: String,
    @Json(name = "title_ar") val titleAr: String,
    @Json(name = "body_ar") val bodyAr: String,
    @Json(name = "is_read") val isRead: Boolean,
    @Json(name = "created_at") val createdAt: Long
)

@JsonClass(generateAdapter = true)
data class SendNotificationRequest(
    @Json(name = "recipient_ids") val recipientIds: List<String>,
    val type: String,
    @Json(name = "title_ar") val titleAr: String,
    @Json(name = "body_ar") val bodyAr: String
)

// ──────────────────────────────────────────────
// Generic / Sync DTOs
// ──────────────────────────────────────────────

@JsonClass(generateAdapter = true)
data class PagedResponse<T>(
    val content: List<T>,
    @Json(name = "total_elements") val totalElements: Long,
    @Json(name = "total_pages") val totalPages: Int,
    val page: Int,
    val size: Int
)

@JsonClass(generateAdapter = true)
data class SyncResultDto(
    val synced: Int,
    val failed: Int,
    val errors: List<String>
)

@JsonClass(generateAdapter = true)
data class SyncDeltaDto(
    val content: List<ContentItemDto>,
    val exams: List<ExamDto>,
    val notifications: List<NotificationDto>,
    @Json(name = "server_timestamp") val serverTimestamp: Long
)
