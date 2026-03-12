package com.nour.app.data.local.dao

import androidx.room.*
import com.nour.app.data.local.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserById(id: String): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Query("DELETE FROM users")
    suspend fun clearAll()
}

@Dao
interface ContentDao {
    @Query("SELECT * FROM content_items ORDER BY createdAt DESC")
    suspend fun getAllContent(): List<ContentItemEntity>

    @Query("SELECT * FROM content_items WHERE syncStatus = :status ORDER BY createdAt DESC")
    suspend fun getContentByStatus(status: String): List<ContentItemEntity>

    @Query("SELECT * FROM content_items WHERE id = :id")
    suspend fun getContentById(id: String): ContentItemEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertContent(items: List<ContentItemEntity>)

    @Query("DELETE FROM content_items")
    suspend fun clearAll()

    @Query("SELECT * FROM content_items ORDER BY createdAt DESC")
    fun observeAllContent(): Flow<List<ContentItemEntity>>
    }

    @Dao
    interface ExamDao {
        @Query("SELECT * FROM exams ORDER BY availableUntil ASC")
        suspend fun getAllExams(): List<ExamEntity>

        @Query("SELECT * FROM exam_submissions WHERE synced = 0")
        suspend fun getUnsyncedSubmissions(): List<ExamSubmissionEntity>

        @Insert(onConflict = OnConflictStrategy.REPLACE)
        suspend fun insertExam(exam: ExamEntity)

        @Insert(onConflict = OnConflictStrategy.REPLACE)
        suspend fun insertSubmission(submission: ExamSubmissionEntity)

        @Query("UPDATE exam_submissions SET synced = 1 WHERE id = :id")
        suspend fun markSynced(id: String)
    }

    @Dao
    interface NotificationDao {
        @Query("SELECT * FROM notifications ORDER BY createdAt DESC")
        suspend fun getAllNotifications(): List<NotificationEntity>

        @Query("SELECT COUNT(*) FROM notifications WHERE isRead = 0")
        suspend fun getUnreadCount(): Int

        @Insert(onConflict = OnConflictStrategy.REPLACE)
        suspend fun insertNotification(notification: NotificationEntity)

        @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
        suspend fun markAsRead(id: String)
    }