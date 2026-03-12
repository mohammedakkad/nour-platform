package com.nour.dto

import jakarta.validation.constraints.*

// ──────────────────────────────────────────────
// Auth DTOs
// ──────────────────────────────────────────────

data class LoginRequest(
    @field:NotBlank val username: String,
    @field:NotBlank val password: String
)

data class RegisterRequest(
    @field:NotBlank @field:Size(min = 3, max = 50) val username: String,
    @field:NotBlank @field:Size(min = 8, max = 100) val password: String,
    @field:NotBlank val fullNameAr: String,
    @field:NotBlank val role: String,
    val schoolId: String? = null,
    val enrollmentCode: String? = null    // for students joining a class
)

data class RefreshTokenRequest(
    @field:NotBlank val refreshToken: String
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long,
    val user: UserResponse
)

data class UserResponse(
    val id: String,
    val username: String,
    val fullNameAr: String,
    val role: String,
    val schoolId: String?,
    val classId: String?,
    val isActive: Boolean
)

// ──────────────────────────────────────────────
// Content DTOs
// ──────────────────────────────────────────────

data class ContentUploadRequest(
    @field:NotBlank val titleAr: String,
    @field:NotBlank val type: String,
    @field:NotBlank val subject: String,
    @field:Min(1) @field:Max(12) val gradeLevel: Int
)

data class ContentStatusRequest(
    @field:NotBlank val status: String,
    val reason: String? = null
)

data class ContentItemResponse(
    val id: String,
    val titleAr: String,
    val type: String,
    val subject: String,
    val gradeLevel: Int,
    val status: String,
    val createdBy: String,
    val fileUrl: String?,
    val fileSizeMb: Double,
    val durationMinutes: Int?,
    val downloadCount: Int
)

// ──────────────────────────────────────────────
// Exam DTOs
// ──────────────────────────────────────────────

data class CreateExamRequest(
    @field:NotBlank val titleAr: String,
    @field:NotBlank val classId: String,
    val contentId: String? = null,
    @field:Min(5) @field:Max(180) val timeLimitMinutes: Int,
    @field:Min(1) val maxAttempts: Int = 3,
    @field:DecimalMin("0.0") @field:DecimalMax("100.0") val passScore: Double = 60.0,
    val availableFrom: Long,
    val availableUntil: Long,
    val shuffleQuestions: Boolean = true,
    @field:NotEmpty @field:Size(min = 1, max = 50) val questions: List<CreateQuestionRequest>
)

data class CreateQuestionRequest(
    @field:NotBlank val questionTextAr: String,
    @field:Size(min = 2, max = 4) val options: List<String>,
    @field:Min(0) val correctOptionIndex: Int,
    val explanation: String? = null
)

data class QuestionResponse(
    val id: String,
    val questionTextAr: String,
    val options: List<String>,
    val orderIndex: Int
    // NOTE: correctOptionIndex intentionally omitted for students
)

data class ExamResponse(
    val id: String,
    val titleAr: String,
    val contentId: String?,
    val classId: String,
    val timeLimitMinutes: Int,
    val maxAttempts: Int,
    val passScore: Double,
    val availableFrom: Long,
    val availableUntil: Long,
    val shuffleQuestions: Boolean,
    val questions: List<QuestionResponse>
)

data class SubmitExamRequest(
    @field:NotBlank val examId: String,
    @field:NotBlank val studentId: String,
    @field:Min(1) val attemptNumber: Int,
    @field:NotEmpty val answers: Map<String, Int>,    // questionId -> selectedOptionIndex
    val startedAt: Long,
    val submittedAt: Long,
    val durationSeconds: Int,
    val offlineSubmission: Boolean = false
)

data class ExamResultResponse(
    val id: String,
    val score: Double,
    val isPassed: Boolean,
    val correctCount: Int,
    val totalQuestions: Int,
    val timeTakenSeconds: Int,
    val feedback: String? = null
)

data class ClassReportResponse(
    val classId: String,
    val className: String,
    val studentCount: Int,
    val averageScore: Double,
    val passRate: Double,
    val examsTaken: Int
)

// ──────────────────────────────────────────────
// Notification DTOs
// ──────────────────────────────────────────────

data class NotificationResponse(
    val id: String,
    val type: String,
    val titleAr: String,
    val bodyAr: String,
    val isRead: Boolean,
    val createdAt: Long
)

data class SendNotificationRequest(
    @field:NotEmpty val recipientIds: List<String>,
    @field:NotBlank val type: String,
    @field:NotBlank val titleAr: String,
    @field:NotBlank val bodyAr: String
)

// ──────────────────────────────────────────────
// Sync DTOs
// ──────────────────────────────────────────────

data class SyncResultResponse(
    val synced: Int,
    val failed: Int,
    val errors: List<String>
)

data class SyncDeltaResponse(
    val content: List<ContentItemResponse>,
    val exams: List<ExamResponse>,
    val notifications: List<NotificationResponse>,
    val serverTimestamp: Long
)

// ──────────────────────────────────────────────
// Generic
// ──────────────────────────────────────────────

data class PagedResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val page: Int,
    val size: Int
)

data class ErrorResponse(
    val error: String,
    val message: String,
    val timestamp: Long = System.currentTimeMillis()
)
