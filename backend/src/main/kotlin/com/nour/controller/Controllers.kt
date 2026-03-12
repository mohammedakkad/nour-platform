package com.nour.controller

import com.nour.dto.*
import com.nour.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "تسجيل الدخول والتسجيل")
class AuthController(private val authService: AuthService) {

    @PostMapping("/login")
    @Operation(summary = "تسجيل الدخول", description = "يعيد JWT access + refresh token")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.login(request))
    }

    @PostMapping("/register")
    @Operation(summary = "تسجيل حساب جديد")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request))
    }

    @PostMapping("/refresh")
    @Operation(summary = "تجديد Access Token باستخدام Refresh Token")
    fun refresh(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.refreshToken(request))
    }

    @PostMapping("/logout")
    @Operation(summary = "تسجيل الخروج")
    fun logout(): ResponseEntity<Unit> {
        authService.logout()
        return ResponseEntity.noContent().build()
    }
}

@RestController
@RequestMapping("/api/v1/content")
@Tag(name = "Content", description = "إدارة المحتوى التعليمي")
class ContentController(private val contentService: com.nour.service.ContentService) {

    @GetMapping
    @Operation(summary = "جلب المحتوى المنشور")
    fun getPublishedContent(
        @RequestParam(required = false) grade: Int?,
        @RequestParam(required = false) subject: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<PagedResponse<ContentItemResponse>> {
        return ResponseEntity.ok(contentService.getPublishedContent(grade, subject, page, size))
    }

    @GetMapping("/{id}")
    @Operation(summary = "جلب محتوى بالمعرّف")
    fun getContentById(@PathVariable id: String): ResponseEntity<ContentItemResponse> {
        return ResponseEntity.ok(contentService.getContentById(id))
    }

    @PostMapping(consumes = ["multipart/form-data"])
    @Operation(summary = "رفع محتوى جديد (للمعلمين)")
    fun uploadContent(
        @RequestPart("metadata") metadata: ContentUploadRequest,
        @RequestPart("file") file: org.springframework.web.multipart.MultipartFile
    ): ResponseEntity<ContentItemResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(contentService.uploadContent(metadata, file))
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "تغيير حالة المحتوى (للمشرفين)")
    fun updateStatus(
        @PathVariable id: String,
        @Valid @RequestBody request: ContentStatusRequest
    ): ResponseEntity<ContentItemResponse> {
        return ResponseEntity.ok(contentService.updateStatus(id, request))
    }
}

@RestController
@RequestMapping("/api/v1/exams")
@Tag(name = "Exams", description = "الاختبارات والتقييمات")
class ExamController(private val examService: com.nour.service.ExamService) {

    @GetMapping("/class/{classId}")
    @Operation(summary = "اختبارات الفصل الدراسي")
    fun getExamsForClass(@PathVariable classId: String): ResponseEntity<List<ExamResponse>> {
        return ResponseEntity.ok(examService.getActiveExamsForClass(classId))
    }

    @GetMapping("/{id}")
    @Operation(summary = "جلب اختبار بالمعرّف (مع الأسئلة، بدون الإجابات الصحيحة)")
    fun getExam(@PathVariable id: String): ResponseEntity<ExamResponse> {
        return ResponseEntity.ok(examService.getExamForStudent(id))
    }

    @PostMapping
    @Operation(summary = "إنشاء اختبار جديد (للمعلمين)")
    fun createExam(@Valid @RequestBody request: CreateExamRequest): ResponseEntity<ExamResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createExam(request))
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "تسليم إجابات الاختبار")
    fun submitExam(
        @PathVariable id: String,
        @Valid @RequestBody submission: SubmitExamRequest
    ): ResponseEntity<ExamResultResponse> {
        return ResponseEntity.ok(examService.submitExam(id, submission))
    }

    @GetMapping("/class/{classId}/report")
    @Operation(summary = "تقرير أداء الفصل")
    fun getClassReport(@PathVariable classId: String): ResponseEntity<ClassReportResponse> {
        return ResponseEntity.ok(examService.getClassReport(classId))
    }
}

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "الإشعارات")
class NotificationController(private val notificationService: com.nour.service.NotificationService) {

    @GetMapping
    fun getNotifications(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<PagedResponse<NotificationResponse>> {
        return ResponseEntity.ok(notificationService.getNotificationsForCurrentUser(page, size))
    }

    @PatchMapping("/{id}/read")
    fun markAsRead(@PathVariable id: String): ResponseEntity<Unit> {
        notificationService.markAsRead(id)
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/read-all")
    fun markAllAsRead(): ResponseEntity<Unit> {
        notificationService.markAllAsRead()
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/send")
    fun sendNotification(@Valid @RequestBody request: SendNotificationRequest): ResponseEntity<Unit> {
        notificationService.sendNotification(request)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }
}

@RestController
@RequestMapping("/api/v1/sync")
@Tag(name = "Sync", description = "مزامنة offline")
class SyncController(private val syncService: com.nour.service.SyncService) {

    @PostMapping("/submissions")
    @Operation(summary = "رفع دفعة من الاختبارات المقدّمة offline")
    fun syncSubmissions(
        @Valid @RequestBody submissions: List<SubmitExamRequest>
    ): ResponseEntity<SyncResultResponse> {
        return ResponseEntity.ok(syncService.syncSubmissions(submissions))
    }

    @GetMapping("/delta")
    @Operation(summary = "جلب التغييرات منذ آخر مزامنة")
    fun getDelta(@RequestParam since: Long): ResponseEntity<SyncDeltaResponse> {
        return ResponseEntity.ok(syncService.getDelta(since))
    }
}
