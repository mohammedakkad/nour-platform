package com.nour.app.data.remote.api

import com.nour.app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────

interface AuthApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<LoginResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<LoginResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<Unit>
}

// ──────────────────────────────────────────────
// Content API
// ──────────────────────────────────────────────

interface ContentApiService {

    @GET("content")
    suspend fun getPublishedContent(
        @Query("grade") grade: Int? = null,
        @Query("subject") subject: String? = null,
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20
    ): Response<PagedResponse<ContentItemDto>>

    @GET("content/{id}")
    suspend fun getContentById(@Path("id") id: String): Response<ContentItemDto>

    @Multipart
    @POST("content")
    suspend fun uploadContent(
        @Part("metadata") metadata: ContentUploadRequest,
        @Part file: okhttp3.MultipartBody.Part
    ): Response<ContentItemDto>

    @PATCH("content/{id}/status")
    suspend fun updateContentStatus(
        @Path("id") id: String,
        @Body request: ContentStatusRequest
    ): Response<ContentItemDto>
}

// ──────────────────────────────────────────────
// Exam API
// ──────────────────────────────────────────────

interface ExamApiService {

    @GET("exams/class/{classId}")
    suspend fun getExamsForClass(@Path("classId") classId: String): Response<List<ExamDto>>

    @GET("exams/{id}")
    suspend fun getExamById(@Path("id") id: String): Response<ExamDto>

    @POST("exams")
    suspend fun createExam(@Body exam: CreateExamRequest): Response<ExamDto>

    /** Submit exam answers — works offline, synced later */
    @POST("exams/{id}/submit")
    suspend fun submitExam(
        @Path("id") examId: String,
        @Body submission: SubmitExamRequest
    ): Response<ExamResultDto>

    @GET("exams/{id}/results/{studentId}")
    suspend fun getStudentResults(
        @Path("id") examId: String,
        @Path("studentId") studentId: String
    ): Response<List<ExamResultDto>>

    @GET("exams/class/{classId}/report")
    suspend fun getClassReport(@Path("classId") classId: String): Response<ClassReportDto>
}

// ──────────────────────────────────────────────
// Notification API
// ──────────────────────────────────────────────

interface NotificationApiService {

    @GET("notifications")
    suspend fun getNotifications(
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20
    ): Response<PagedResponse<NotificationDto>>

    @PATCH("notifications/{id}/read")
    suspend fun markAsRead(@Path("id") id: String): Response<Unit>

    @PATCH("notifications/read-all")
    suspend fun markAllAsRead(): Response<Unit>

    @POST("notifications/send")
    suspend fun sendNotification(@Body request: SendNotificationRequest): Response<Unit>
}

// ──────────────────────────────────────────────
// Sync API (offline-first batch sync)
// ──────────────────────────────────────────────

interface SyncApiService {

    /** Upload a batch of offline submissions */
    @POST("sync/submissions")
    suspend fun syncSubmissions(@Body submissions: List<SubmitExamRequest>): Response<SyncResultDto>

    /** Get delta changes since last sync timestamp */
    @GET("sync/delta")
    suspend fun getDelta(@Query("since") sinceTimestamp: Long): Response<SyncDeltaDto>
}
