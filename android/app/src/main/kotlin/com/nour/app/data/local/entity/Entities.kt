package com.nour.app.data.local.entity

import androidx.room.*

// ──────────────────────────────────────────────
// Room Entities (local database tables)
// ──────────────────────────────────────────────

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val username: String,
    val fullNameAr: String,
    val role: String,
    val schoolId: String?,
    val classId: String?,
    val isActive: Boolean,
    val lastSync: Long
)

@Entity(tableName = "content_items")
data class ContentItemEntity(
    @PrimaryKey val id: String,
    val titleAr: String,
    val type: String,
    val subject: String,
    val gradeLevel: Int,
    val status: String,
    val createdBy: String,
    val fileUrl: String?,
    val localFilePath: String?,
    val fileSizeMb: Double,
    val durationMinutes: Int?,
    val downloadCount: Int,
    val isDownloaded: Boolean,
    val lastSyncedAt: Long
)

@Entity(tableName = "exams")
data class ExamEntity(
    @PrimaryKey val id: String,
    val titleAr: String,
    val contentId: String?,
    val classId: String,
    val createdBy: String,
    val timeLimitMinutes: Int,
    val maxAttempts: Int,
    val passScore: Double,
    val availableFrom: Long,
    val availableUntil: Long,
    val shuffleQuestions: Boolean,
    val questionsJson: String     // serialized JSON of questions list
)

@Entity(tableName = "exam_submissions",
    indices = [Index(value = ["examId", "studentId"])])
data class ExamSubmissionEntity(
    @PrimaryKey val id: String,
    val examId: String,
    val studentId: String,
    val attemptNumber: Int,
    val score: Double?,
    val answersJson: String,          // serialized JSON Map<String, Int>
    val startedAt: Long,
    val submittedAt: Long?,
    val durationSeconds: Int?,
    val isPassed: Boolean?,
    val isOfflineSubmission: Boolean,
    val isSynced: Boolean             // false = needs to be synced to server
)

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey val id: String,
    val recipientId: String,
    val senderId: String?,
    val type: String,
    val titleAr: String,
    val bodyAr: String,
    val isRead: Boolean,
    val createdAt: Long
)
