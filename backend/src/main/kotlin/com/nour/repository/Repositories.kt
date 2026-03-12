package com.nour.repository

import com.nour.model.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByUsername(username: String): User?
    fun existsByUsername(username: String): Boolean
}

@Repository
interface ContentRepository : JpaRepository<ContentItem, UUID> {
    fun findByStatus(status: ContentStatus, pageable: Pageable): Page<ContentItem>
    fun findByStatusAndGradeLevel(status: ContentStatus, gradeLevel: Int, pageable: Pageable): Page<ContentItem>
    fun findByStatusAndGradeLevelAndSubject(status: ContentStatus, gradeLevel: Int, subject: String, pageable: Pageable): Page<ContentItem>
    fun findByStatusAndUpdatedAtAfter(status: ContentStatus, updatedAt: Instant): List<ContentItem>
}

@Repository
interface ExamRepository : JpaRepository<Exam, UUID> {
    fun findBySchoolClassIdAndAvailableFromBeforeAndAvailableUntilAfter(
        classId: UUID, from: Instant, until: Instant): List<Exam>
}

@Repository
interface QuestionRepository : JpaRepository<Question, UUID> {
    fun findByExamId(examId: UUID): List<Question>
}

@Repository
interface SubmissionRepository : JpaRepository<ExamSubmission, UUID> {
    fun findByExamSchoolClassId(classId: UUID): List<ExamSubmission>
}

@Repository
interface ClassRepository : JpaRepository<SchoolClass, UUID> {}

@Repository
interface NotificationRepository : JpaRepository<Notification, UUID> {}
