package com.nour.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nour.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val isLoggedIn: Boolean = false,
    val userRole: String = "",
    val userId: String = "",
    val errorMessage: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

    // تحقق من الجلسة المحفوظة عند فتح التطبيق
    init {
        viewModelScope.launch {
            combine(
                authRepository.isLoggedIn,
                authRepository.userRole,
                authRepository.userId
            ) { loggedIn, role, id ->
                Triple(loggedIn, role, id)
            }.collect { (loggedIn, role, id) ->
                if (loggedIn && _authState.value.isLoading.not()) {
                    _authState.value = AuthState(
                        isLoggedIn = true,
                        isSuccess  = true,
                        userRole   = role,
                        userId     = id
                    )
                }
            }
        }
    }

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            val result = authRepository.login(username, password)
            _authState.value = if (result.success) {
                AuthState(
                    isLoading  = false,
                    isSuccess  = true,
                    isLoggedIn = true,
                    userRole   = result.userDto?.role ?: "",
                    userId     = result.userDto?.id ?: ""
                )
            } else {
                AuthState(isLoading = false, errorMessage = result.errorMessage)
            }
        }
    }

    fun register(
        username: String, password: String,
        fullNameAr: String, role: String,
        enrollmentCode: String? = null
    ) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            val result = authRepository.register(username, password, fullNameAr, role,
                enrollmentCode = enrollmentCode)
            _authState.value = if (result.success) {
                AuthState(
                    isLoading  = false,
                    isSuccess  = true,
                    isLoggedIn = true,
                    userRole   = result.userDto?.role ?: "",
                    userId     = result.userDto?.id ?: ""
                )
            } else {
                AuthState(isLoading = false, errorMessage = result.errorMessage)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _authState.value = AuthState()
        }
    }

    fun clearError() {
        _authState.value = _authState.value.copy(errorMessage = null)
    }
}