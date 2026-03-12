package com.nour.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.nour.app.domain.model.UserRole
import com.nour.app.ui.screens.auth.LoginScreen
import com.nour.app.ui.screens.auth.AuthViewModel
import com.nour.app.ui.screens.student.*
import com.nour.app.ui.screens.teacher.*
import com.nour.app.ui.screens.admin.*
import com.nour.app.ui.screens.parent.*

// ──────────────────────────────────────────────
// Route Definitions
// ──────────────────────────────────────────────

sealed class Screen(val route: String) {
    // Auth
    data object Login : Screen("login")
    data object Register : Screen("register")

    // Student
    data object StudentHome : Screen("student/home")
    data object StudentLessons : Screen("student/lessons")
    data object StudentExams : Screen("student/exams")
    data object StudentProgress : Screen("student/progress")
    data object StudentNotifications : Screen("student/notifications")
    data class LessonDetail(val id: String = "{contentId}") :
        Screen("student/lesson/{contentId}") {
        fun route(id: String) = "student/lesson/$id"
    }
    data class ExamScreen(val id: String = "{examId}") :
        Screen("student/exam/{examId}") {
        fun route(id: String) = "student/exam/$id"
    }
    data class ExamResult(val submissionId: String = "{submissionId}") :
        Screen("student/exam-result/{submissionId}") {
        fun route(id: String) = "student/exam-result/$id"
    }

    // Teacher
    data object TeacherHome : Screen("teacher/home")
    data object TeacherContent : Screen("teacher/content")
    data object TeacherExams : Screen("teacher/exams")
    data object TeacherClassReport : Screen("teacher/class-report")
    data object UploadContent : Screen("teacher/upload")
    data object CreateExam : Screen("teacher/create-exam")

    // Admin
    data object AdminHome : Screen("admin/home")
    data object AdminApproval : Screen("admin/content-approval")
    data object AdminUsers : Screen("admin/users")
    data object AdminClasses : Screen("admin/classes")

    // Parent
    data object ParentHome : Screen("parent/home")
    data object ParentProgress : Screen("parent/progress")
}

// ──────────────────────────────────────────────
// Navigation Graph
// ──────────────────────────────────────────────

@Composable
fun NourNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val authState by authViewModel.authState.collectAsState()
    val startDestination = if (authState.isLoggedIn) {
        when (authState.user?.role) {
            UserRole.STUDENT -> Screen.StudentHome.route
            UserRole.TEACHER -> Screen.TeacherHome.route
            UserRole.SCHOOL_ADMIN -> Screen.AdminHome.route
            UserRole.PARENT -> Screen.ParentHome.route
            else -> Screen.StudentHome.route
        }
    } else Screen.Login.route

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // ── Auth ──
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = { role ->
                    val dest = when (role) {
                        UserRole.STUDENT -> Screen.StudentHome.route
                        UserRole.TEACHER -> Screen.TeacherHome.route
                        UserRole.SCHOOL_ADMIN -> Screen.AdminHome.route
                        UserRole.PARENT -> Screen.ParentHome.route
                        else -> Screen.StudentHome.route
                    }
                    navController.navigate(dest) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }

        // ── Student ──
        composable(Screen.StudentHome.route) {
            StudentHomeScreen(
                onNavigateToLessons = { navController.navigate(Screen.StudentLessons.route) },
                onNavigateToExams = { navController.navigate(Screen.StudentExams.route) },
                onNavigateToProgress = { navController.navigate(Screen.StudentProgress.route) },
                onNavigateToNotifications = { navController.navigate(Screen.StudentNotifications.route) }
            )
        }

        composable(Screen.StudentLessons.route) {
            StudentLessonsScreen(
                onContentClick = { id -> navController.navigate(LessonDetail().route(id)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.LessonDetail().route,
            arguments = listOf(navArgument("contentId") { type = NavType.StringType })
        ) { backStackEntry ->
            val contentId = backStackEntry.arguments?.getString("contentId") ?: return@composable
            LessonDetailScreen(
                contentId = contentId,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.StudentExams.route) {
            StudentExamsScreen(
                onExamClick = { id -> navController.navigate(ExamScreen().route(id)) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.ExamScreen().route,
            arguments = listOf(navArgument("examId") { type = NavType.StringType })
        ) { backStackEntry ->
            val examId = backStackEntry.arguments?.getString("examId") ?: return@composable
            ExamTakingScreen(
                examId = examId,
                onFinished = { submissionId ->
                    navController.navigate(ExamResult().route(submissionId)) {
                        popUpTo(Screen.StudentExams.route)
                    }
                }
            )
        }

        composable(Screen.StudentProgress.route) {
            StudentProgressScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.StudentNotifications.route) {
            StudentNotificationsScreen(onBack = { navController.popBackStack() })
        }

        // ── Teacher ──
        composable(Screen.TeacherHome.route) {
            TeacherHomeScreen(
                onNavigateToContent = { navController.navigate(Screen.TeacherContent.route) },
                onNavigateToExams = { navController.navigate(Screen.TeacherExams.route) },
                onNavigateToReport = { navController.navigate(Screen.TeacherClassReport.route) },
                onUploadContent = { navController.navigate(Screen.UploadContent.route) }
            )
        }

        composable(Screen.UploadContent.route) {
            UploadContentScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.CreateExam.route) {
            CreateExamScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.TeacherClassReport.route) {
            TeacherClassReportScreen(onBack = { navController.popBackStack() })
        }

        // ── Admin ──
        composable(Screen.AdminHome.route) {
            AdminHomeScreen(
                onNavigateToApproval = { navController.navigate(Screen.AdminApproval.route) },
                onNavigateToUsers = { navController.navigate(Screen.AdminUsers.route) },
                onNavigateToClasses = { navController.navigate(Screen.AdminClasses.route) }
            )
        }

        // ── Parent ──
        composable(Screen.ParentHome.route) {
            ParentHomeScreen(
                onNavigateToProgress = { navController.navigate(Screen.ParentProgress.route) }
            )
        }
    }
}
