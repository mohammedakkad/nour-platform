package com.nour.app.data.local.dao

import androidx.room.*
import com.nour.app.data.local.entity.*
import kotlinx.coroutines.flow.Flow

// ──────────────────────────────────────────────
// Content DAO
// ──────────────────────────────────────────────

@Dao
interface ContentDao {

    @Query("SELECT * FROM content_items WHERE status = 'PUBLISHED' ORDER BY gradeLevel, subject")
    fun observePublishedContent(): Flow<List<ContentItemEntity>>

    @Query("SELECT * FROM content_items WHERE gradeLevel = :grade AND status = 'PUBLISHED'")
    fun observeContentByGrade(grade: Int): Flow<List<ContentItemEntity>>

    @Query("SELECT * FROM content_items WHERE isDownloaded = 1 ORDER BY lastSyncedAt DESC")
    fun observeDownloadedContent(): Flow<List<ContentItemEntity>>

    @Query("SELECT * FROM content_items WHERE id = :id")
    suspend fun getContentById(id: String): ContentItemEntity?

    @Upsert
    suspend fun upsertContent(items: List<ContentItemEntity>)

    @Query("UPDATE content_items SET isDownloaded = :downloaded, localFilePath = :path WHERE id = :id")
    suspend fun updateDownloadStatus(id: String, downloaded: Boolean, path: String?)

    @Query("DELETE FROM content_items WHERE status = 'ARCHIVED'")
    suspend fun deleteArchivedContent()
}

// ──────────────────────────────────────────────
// Exam DAO
// ──────────────────────────────────────────────

@Dao
interface ExamDao {

    @Query("SELECT * FROM exams WHERE classId = :classId AND availableFrom <= :now AND availableUntil >= :now")
    fun observeActiveExams(classId: String, now: Long = System.currentTimeMillis()): Flow<List<ExamEntity>>

    @Query("SELECT * FROM exams WHERE id = :id")
    suspend fun getExamById(id: String): ExamEntity?

    @Upsert
    suspend fun upsertExams(exams: List<ExamEntity>)

    // ── Submissions ──

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubmission(submission: ExamSubmissionEntity)

    @Query("SELECT * FROM exam_submissions WHERE examId = :examId AND studentId = :studentId ORDER BY attemptNumber DESC")
    fun observeSubmissions(examId: String, studentId: String): Flow<List<ExamSubmissionEntity>>

    @Query("SELECT COUNT(*) FROM exam_submissions WHERE examId = :examId AND studentId = :studentId")
    suspend fun getAttemptCount(examId: String, studentId: String): Int

    /** Get all unsynced submissions — used by background sync worker */
    @Query("SELECT * FROM exam_submissions WHERE isSynced = 0")
    suspend fun getUnsyncedSubmissions(): List<ExamSubmissionEntity>

    @Query("UPDATE exam_submissions SET isSynced = 1 WHERE id = :submissionId")
    suspend fun markSubmissionSynced(submissionId: String)

    @Query("SELECT COUNT(*) FROM exam_submissions WHERE isSynced = 0")
    fun observePendingSyncCount(): Flow<Int>
}

// ──────────────────────────────────────────────
// Notification DAO
// ──────────────────────────────────────────────

@Dao
interface NotificationDao {

    @Query("SELECT * FROM notifications WHERE recipientId = :userId ORDER BY createdAt DESC LIMIT 50")
    fun observeNotifications(userId: String): Flow<List<NotificationEntity>>

    @Query("SELECT COUNT(*) FROM notifications WHERE recipientId = :userId AND isRead = 0")
    fun observeUnreadCount(userId: String): Flow<Int>

    @Upsert
    suspend fun upsertNotifications(notifications: List<NotificationEntity>)

    @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: String)

    @Query("UPDATE notifications SET isRead = 1 WHERE recipientId = :userId")
    suspend fun markAllAsRead(userId: String)

    @Query("DELETE FROM notifications WHERE createdAt < :cutoff")
    suspend fun deleteOldNotifications(cutoff: Long)
}

// ──────────────────────────────────────────────
// User DAO
// ──────────────────────────────────────────────

@Dao
interface UserDao {

    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserById(id: String): UserEntity?

    @Upsert
    suspend fun upsertUser(user: UserEntity)

    @Query("SELECT * FROM users WHERE role = 'STUDENT' AND classId = :classId")
    suspend fun getStudentsByClass(classId: String): List<UserEntity>
}
