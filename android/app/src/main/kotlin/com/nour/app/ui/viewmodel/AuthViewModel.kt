package com.nour.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nour.app.data.remote.api.AuthApiService
import com.nour.app.data.remote.dto.LoginRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val isLoggedIn: Boolean = false,
    val userRole: String = "",
    val userId: String = "",
    val userName: String = "",
    val errorMessage: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authApi: AuthApiService
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState(isLoading = true)
            try {
                val response = authApi.login(LoginRequest(username, password))
                val body = response.body()
                if (response.isSuccessful && body != null) {
                    _authState.value = AuthState(
                        isLoading = false,
                        isSuccess = true,
                        isLoggedIn = true,
                        userRole = body.user.role,
                        userId = body.user.id,
                        userName = body.user.fullNameAr
                    )
                } else {
                    _authState.value = AuthState(
                        isLoading = false,
                        errorMessage = "خطأ ${response.code()}: تحقق من اسم المستخدم وكلمة المرور"
                    )
                }
            } catch (e: Exception) {
                _authState.value = AuthState(
                    isLoading = false,
                    errorMessage = e.message ?: "خطأ في تسجيل الدخول"
                )
            }
        }
    }

    fun logout() {
        _authState.value = AuthState()
    }
}