package com.nour.app.domain.model

import java.util.UUID

// ──────────────────────────────────────────────
// User & Auth Models
// ──────────────────────────────────────────────

enum class UserRole {
    STUDENT, TEACHER, SCHOOL_ADMIN, PARENT, DONOR, SUPER_ADMIN
}

data class User(
    val id: String = UUID.randomUUID().toString(),
    val username: String,
    val fullNameAr: String,
    val role: UserRole,
    val schoolId: String? = null,
    val classId: String? = null,
    val isActive: Boolean = true,
    val lastSync: Long = System.currentTimeMillis()
)

data class AuthState(
    val user: User? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val isLoggedIn: Boolean = false
)

// ──────────────────────────────────────────────
// Content Models
// ──────────────────────────────────────────────

enum class ContentType {
    LESSON, WORKSHEET, QUIZ, VIDEO, AUDIO
}

enum class ContentStatus {
    DRAFT, REVIEW, PUBLISHED, ARCHIVED
}

data class ContentItem(
    val id: String,
    val titleAr: String,
    val type: ContentType,
    val subject: String,
    val gradeLevel: Int,
    val status: ContentStatus,
    val createdBy: String,
    val fileUrl: String?,
    val localFilePath: String? = null,    // Path to offline downloaded file
    val fileSizeMb: Double,
    val durationMinutes: Int?,
    val downloadCount: Int = 0,
    val isDownloaded: Boolean = false,
    val downloadProgress: Float = 0f,     // 0.0 to 1.0
    val lastSyncedAt: Long = 0L
)

// ──────────────────────────────────────────────
// Exam Models
// ──────────────────────────────────────────────

data class Question(
    val id: String,
    val examId: String,
    val questionTextAr: String,
    val options: List<String>,            // A, B, C, D options
    val correctOptionIndex: Int,
    val orderIndex: Int,
    val explanation: String? = null
)

data class Exam(
    val id: String,
    val titleAr: String,
    val contentId: String?,
    val classId: String,
    val createdBy: String,
    val timeLimitMinutes: Int,
    val maxAttempts: Int,
    val passScore: Double,                // e.g. 60.0 = 60%
    val availableFrom: Long,
    val availableUntil: Long,
    val shuffleQuestions: Boolean = true,
    val questions: List<Question> = emptyList()
)

data class ExamSubmission(
    val id: String = UUID.randomUUID().toString(),
    val examId: String,
    val studentId: String,
    val attemptNumber: Int,
    val score: Double?,
    val answers: Map<String, Int>,        // questionId -> selectedOptionIndex
    val startedAt: Long,
    val submittedAt: Long?,
    val durationSeconds: Int?,
    val isPassed: Boolean?,
    val isOfflineSubmission: Boolean = false,
    val isSynced: Boolean = false         // false = pending sync to server
)

// ──────────────────────────────────────────────
// Class & School Models
// ──────────────────────────────────────────────

data class SchoolClass(
    val id: String,
    val name: String,
    val schoolId: String,
    val teacherId: String,
    val gradeLevel: Int,
    val academicYear: String,
    val enrollmentCode: String,
    val maxStudents: Int,
    val studentCount: Int = 0
)

data class School(
    val id: String,
    val nameAr: String,
    val region: String,
    val governorate: String,
    val latitude: Double?,
    val longitude: Double?,
    val isActive: Boolean = true
)

// ──────────────────────────────────────────────
// Notification Model
// ──────────────────────────────────────────────

enum class NotificationType {
    EXAM_RESULT, NEW_CONTENT, ASSIGNMENT, ALERT
}

data class Notification(
    val id: String,
    val recipientId: String,
    val senderId: String?,
    val type: NotificationType,
    val titleAr: String,
    val bodyAr: String,
    val isRead: Boolean = false,
    val createdAt: Long
)

// ──────────────────────────────────────────────
// Progress & Analytics
// ──────────────────────────────────────────────

data class StudentProgress(
    val studentId: String,
    val totalExamsTaken: Int,
    val averageScore: Double,
    val passedExams: Int,
    val failedExams: Int,
    val contentItemsCompleted: Int,
    val totalStars: Int,
    val streakDays: Int
)

data class ClassReport(
    val classId: String,
    val className: String,
    val studentCount: Int,
    val averageScore: Double,
    val passRate: Double,                 // percentage
    val activeStudents: Int,
    val contentCompletionRate: Double
)

// ──────────────────────────────────────────────
// Sync State (offline-first core)
// ──────────────────────────────────────────────

data class SyncStatus(
    val pendingSubmissions: Int,
    val lastSyncAt: Long,
    val isSyncing: Boolean,
    val hasError: Boolean,
    val errorMessage: String?
)
