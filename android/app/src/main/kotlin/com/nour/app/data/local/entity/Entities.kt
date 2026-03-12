package com.nour.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val username: String,
    val fullNameAr: String,
    val role: String,
    val schoolId: String? = null,
    val classId: String? = null,
    val isActive: Boolean = true
)

@Entity(tableName = "content_items")
data class ContentItemEntity(
    @PrimaryKey val id: String,
    val titleAr: String,
    val type: String,
    val subject: String,
    val gradeLevel: Int = 0,
    val fileUrl: String? = null,
    val fileSizeMb: Double = 0.0,
    val durationMinutes: Int? = null,
    val isDownloaded: Boolean = false,
    val syncStatus: String = "PUBLISHED",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "exams")
data class ExamEntity(
    @PrimaryKey val id: String,
    val titleAr: String,
    val classId: String,
    val timeLimitMinutes: Int = 0,
    val maxAttempts: Int = 1,
    val passScore: Double = 60.0,
    val availableFrom: Long = 0L,
    val availableUntil: Long = Long.MAX_VALUE,
    val shuffleQuestions: Boolean = false
)

@Entity(tableName = "exam_submissions")
data class ExamSubmissionEntity(
    @PrimaryKey val id: String,
    val examId: String,
    val studentId: String,
    val score: Double = 0.0,
    val isPassed: Boolean = false,
    val answersJson: String = "",
    val startedAt: Long = 0L,
    val submittedAt: Long = 0L,
    val durationSeconds: Int = 0,
    val synced: Boolean = false
)

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey val id: String,
    val type: String,
    val titleAr: String,
    val bodyAr: String,
    val isRead: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)