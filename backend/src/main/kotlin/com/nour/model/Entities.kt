package com.nour.model

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant
import java.util.UUID

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

enum class UserRole { STUDENT, TEACHER, SCHOOL_ADMIN, PARENT, DONOR, SUPER_ADMIN }
enum class ContentType { LESSON, WORKSHEET, QUIZ, VIDEO, AUDIO }
enum class ContentStatus { DRAFT, REVIEW, PUBLISHED, ARCHIVED }
enum class NotificationType { EXAM_RESULT, NEW_CONTENT, ASSIGNMENT, ALERT }
enum class DeliveryChannel { IN_APP, PUSH, SMS }

// ──────────────────────────────────────────────
// School Entity
// ──────────────────────────────────────────────

@Entity
@Table(name = "schools")
data class School(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(nullable = false) val nameAr: String,
    val region: String,
    val governorate: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val isActive: Boolean = true,
    @CreationTimestamp val createdAt: Instant = Instant.now()
)

// ──────────────────────────────────────────────
// User Entity
// ──────────────────────────────────────────────

@Entity
@Table(name = "users", indexes = [Index(columnList = "username", unique = true)])
data class User(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(unique = true, nullable = false) val username: String,
    @Column(nullable = false) val passwordHash: String,
    @Column(nullable = false) val fullNameAr: String,
    @Enumerated(EnumType.STRING) @Column(nullable = false) val role: UserRole,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "school_id") val school: School? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "class_id") val schoolClass: SchoolClass? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_id") val parent: User? = null,
    val isActive: Boolean = true,
    val fcmToken: String? = null,
    @UpdateTimestamp val lastSync: Instant = Instant.now(),
    @CreationTimestamp val createdAt: Instant = Instant.now()
)

// ──────────────────────────────────────────────
// Class Entity
// ──────────────────────────────────────────────

@Entity
@Table(name = "classes")
data class SchoolClass(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(nullable = false) val name: String,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "school_id", nullable = false)
    val school: School,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "teacher_id")
    val teacher: User? = null,
    val gradeLevel: Int,
    val academicYear: String,
    @Column(unique = true) val enrollmentCode: String,
    val maxStudents: Int = 40,
    @CreationTimestamp val createdAt: Instant = Instant.now()
)

// ──────────────────────────────────────────────
// Content Entity
// ──────────────────────────────────────────────

@Entity
@Table(name = "content_items")
data class ContentItem(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(nullable = false) val titleAr: String,
    @Enumerated(EnumType.STRING) @Column(nullable = false) val type: ContentType,
    @Column(nullable = false) val subject: String,
    val gradeLevel: Int,
    @Enumerated(EnumType.STRING) val status: ContentStatus = ContentStatus.DRAFT,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by_id", nullable = false)
    val createdBy: User,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "approved_by_id")
    val approvedBy: User? = null,
    val fileUrl: String? = null,
    val fileSizeMb: Double = 0.0,
    val durationMinutes: Int? = null,
    val downloadCount: Int = 0,
    @CreationTimestamp val createdAt: Instant = Instant.now(),
    @UpdateTimestamp val updatedAt: Instant = Instant.now()
)

// ──────────────────────────────────────────────
// Exam Entities
// ──────────────────────────────────────────────

@Entity
@Table(name = "exams")
data class Exam(
    @Id val id: UUID = UUID.randomUUID(),
    @Column(nullable = false) val titleAr: String,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "content_id") val content: ContentItem? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "class_id", nullable = false)
    val schoolClass: SchoolClass,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by_id", nullable = false)
    val createdBy: User,
    val timeLimitMinutes: Int,
    val maxAttempts: Int = 3,
    val passScore: Double = 60.0,
    val availableFrom: Instant,
    val availableUntil: Instant,
    val shuffleQuestions: Boolean = true,
    @OneToMany(mappedBy = "exam", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val questions: List<Question> = emptyList(),
    @CreationTimestamp val createdAt: Instant = Instant.now()
)

@Entity
@Table(name = "questions")
data class Question(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "exam_id", nullable = false)
    val exam: Exam,
    @Column(nullable = false, columnDefinition = "TEXT") val questionTextAr: String,
    @Column(columnDefinition = "TEXT[]") val options: Array<String>,
    val correctOptionIndex: Int,
    val orderIndex: Int,
    val explanation: String? = null
)

@Entity
@Table(name = "exam_submissions",
    uniqueConstraints = [UniqueConstraint(columnNames = ["exam_id", "student_id", "attempt_number"])])
data class ExamSubmission(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "exam_id", nullable = false)
    val exam: Exam,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id", nullable = false)
    val student: User,
    val attemptNumber: Int,
    val score: Double? = null,
    @Column(columnDefinition = "jsonb") val answersJson: String,
    val startedAt: Instant,
    val submittedAt: Instant? = null,
    val durationSeconds: Int? = null,
    val isPassed: Boolean? = null,
    val offlineSubmission: Boolean = false,
    @CreationTimestamp val createdAt: Instant = Instant.now()
)

// ──────────────────────────────────────────────
// Notification Entity
// ──────────────────────────────────────────────

@Entity
@Table(name = "notifications",
    indexes = [Index(columnList = "recipient_id"), Index(columnList = "is_read")])
data class Notification(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "recipient_id", nullable = false)
    val recipient: User,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sender_id")
    val sender: User? = null,
    @Enumerated(EnumType.STRING) val type: NotificationType,
    @Column(nullable = false) val titleAr: String,
    @Column(nullable = false, columnDefinition = "TEXT") val bodyAr: String,
    var isRead: Boolean = false,
    @Enumerated(EnumType.STRING) val deliveryChannel: DeliveryChannel = DeliveryChannel.IN_APP,
    @CreationTimestamp val createdAt: Instant = Instant.now()
)
