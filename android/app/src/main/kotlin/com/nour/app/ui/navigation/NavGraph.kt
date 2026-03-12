package com.nour.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.nour.app.ui.screens.auth.LoginScreen
import com.nour.app.ui.screens.student.StudentHomeScreen
import com.nour.app.ui.viewmodel.AuthViewModel

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object StudentHome : Screen("student_home")
    object TeacherHome : Screen("teacher_home")
    object AdminHome : Screen("admin_home")
    object ParentHome : Screen("parent_home")
    object DonorHome : Screen("donor_home")
    }

    @Composable
    fun NourNavGraph(
        navController: NavHostController = rememberNavController()
) {
    val authViewModel: AuthViewModel = hiltViewModel()
    val authState by authViewModel.authState.collectAsState()

    val startDestination = if (authState.isLoggedIn) {
        when (authState.userRole) {
            "TEACHER" -> Screen.TeacherHome.route
            "SCHOOL_ADMIN", "SUPER_ADMIN" -> Screen.AdminHome.route
            "PARENT" -> Screen.ParentHome.route
            "DONOR" -> Screen.DonorHome.route
            else -> Screen.StudentHome.route
        }
    } else Screen.Login.route

    NavHost(navController = navController, startDestination = startDestination) {

        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    role ->
                    val dest = when (role) {
                        "TEACHER" -> Screen.TeacherHome.route
                        "SCHOOL_ADMIN", "SUPER_ADMIN" -> Screen.AdminHome.route
                        "PARENT" -> Screen.ParentHome.route
                        "DONOR" -> Screen.DonorHome.route
                        else -> Screen.StudentHome.route
                    }
                    navController.navigate(dest) {
                        popUpTo(Screen.Login.route) {
                            inclusive = true
                        }
                    }
                }
            )
        }

        composable(Screen.StudentHome.route) {
            StudentHomeScreen(
                onNavigateToLessons = {},
                onNavigateToExams = {},
                onNavigateToProgress = {},
                onNavigateToNotifications = {}
            )
        }

        composable(Screen.TeacherHome.route) {
            PlaceholderScreen("شاشة المعلم — قريباً")
        }
        composable(Screen.AdminHome.route) {
            PlaceholderScreen("شاشة المدير — قريباً")
        }
        composable(Screen.ParentHome.route) {
            PlaceholderScreen("شاشة ولي الأمر — قريباً")
        }
        composable(Screen.DonorHome.route) {
            PlaceholderScreen("شاشة المانح — قريباً")
        }
    }
}

@Composable
private fun PlaceholderScreen(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = text)
    }
}