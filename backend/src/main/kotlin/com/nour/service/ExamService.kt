package com.nour.service

import com.nour.dto.*
import com.nour.model.*
import com.nour.repository.*
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class ExamService(
    private val examRepository: ExamRepository,
    private val questionRepository: QuestionRepository,
    private val submissionRepository: SubmissionRepository,
    private val classRepository: ClassRepository,
    private val userRepository: UserRepository
) {
    fun getActiveExamsForClass(classId: String): List<ExamResponse> {
        val now = Instant.now()
        return examRepository
        .findBySchoolClassIdAndAvailableFromBeforeAndAvailableUntilAfter(
            UUID.fromString(classId), now, now)
        .map {
            it.toResponse()
        }
    }

    fun getExamForStudent(id: String): ExamResponse =
    examRepository.findById(UUID.fromString(id))
    .orElseThrow {
        RuntimeException("الاختبار غير موجود")
    }
    .toResponse()

    fun createExam(request: CreateExamRequest): ExamResponse {
        val schoolClass = classRepository.findById(UUID.fromString(request.classId))
        .orElseThrow {
            RuntimeException("الفصل غير موجود")
        }
        val exam = examRepository.save(Exam(
            titleAr = request.titleAr,
            schoolClass = schoolClass,
            createdBy = schoolClass.teacher!!,
            timeLimitMinutes = request.timeLimitMinutes,
            maxAttempts = request.maxAttempts,
            passScore = request.passScore.toBigDecimal(),
            availableFrom = Instant.ofEpochMilli(request.availableFrom),
            availableUntil = Instant.ofEpochMilli(request.availableUntil),
            shuffleQuestions = request.shuffleQuestions
        ))
        request.questions.forEachIndexed {
            i, q ->
            questionRepository.save(Question(
                exam = exam,
                questionTextAr = q.questionTextAr,
                options = q.options.toTypedArray(),
                correctOptionIndex = q.correctOptionIndex,
                orderIndex = i
            ))
        }
        return examRepository.findById(exam.id).get().toResponse()
    }

    fun submitExam(examId: String, request: SubmitExamRequest): ExamResultResponse {
        val exam = examRepository.findById(UUID.fromString(examId))
        .orElseThrow {
            RuntimeException("الاختبار غير موجود")
        }
        val questions = questionRepository.findByExamId(exam.id)
        var correct = 0
        questions.forEach {
            q ->
            val answer = request.answers[q.id.toString()]
            if (answer == q.correctOptionIndex) correct++
        }
        val score = if (questions.isEmpty()) 0.0.toBigDecimal()
        else ((correct.toDouble() / questions.size) * 100).toBigDecimal()
        val isPassed = score >= exam.passScore
        val student = userRepository.findById(UUID.fromString(request.studentId))
        .orElseThrow {
            RuntimeException("الطالب غير موجود")
        }
        submissionRepository.save(ExamSubmission(
            exam = exam,
            student = student,
            attemptNumber = request.attemptNumber,
            score = score,
            answersJson = request.answers.toString(),
            startedAt = Instant.ofEpochMilli(request.startedAt),
            submittedAt = Instant.ofEpochMilli(request.submittedAt),
            durationSeconds = request.durationSeconds,
            isPassed = isPassed,
            offlineSubmission = request.offlineSubmission
        ))
        return ExamResultResponse(
            id = UUID.randomUUID().toString(),
            score = score,
            isPassed = isPassed,
            correctCount = correct,
            totalQuestions = questions.size,
            timeTakenSeconds = request.durationSeconds
        )
    }

    fun getClassReport(classId: String): ClassReportResponse {
        val schoolClass = classRepository.findById(UUID.fromString(classId))
        .orElseThrow {
            RuntimeException("الفصل غير موجود")
        }
        val submissions = submissionRepository.findByExamSchoolClassId(UUID.fromString(classId))
        val avg = submissions.mapNotNull {
            it.score?.toDouble()
        }.average().takeIf {
            !it.isNaN()
        } ?: 0.0
        val passRate = if (submissions.isEmpty()) 0.0
        else submissions.count {
            it.isPassed == true
        }.toDouble() / submissions.size * 100
        return ClassReportResponse(
            classId      = classId,
            className    = schoolClass.name,
            studentCount = submissions.map {
                it.student.id
            }.distinct().size,
            averageScore = avg,
            passRate = passRate,
            examsTaken = submissions.size
        )
    }

    private fun Exam.toResponse() = ExamResponse(
        id = id.toString(),
        titleAr = titleAr,
        contentId = content?.id?.toString(),
        classId          = schoolClass.id.toString(),
        timeLimitMinutes = timeLimitMinutes,
        maxAttempts = maxAttempts,
        passScore = passScore.toDouble(),
        availableFrom = availableFrom.toEpochMilli(),
        availableUntil = availableUntil.toEpochMilli(),
        shuffleQuestions = shuffleQuestions,
        questions = questions.map {
            q -> QuestionResponse(
                id = q.id.toString(),
                questionTextAr = q.questionTextAr,
                options = q.options.toList(),
                orderIndex = q.orderIndex
            )}
    )
}