package com.nour.app.data.repository

import android.content.Context
import androidx.datastore.preferences.core.edit
import com.nour.app.data.remote.PrefsKeys
import com.nour.app.data.remote.api.AuthApiService
import com.nour.app.data.remote.dataStore
import com.nour.app.data.remote.dto.*
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

data class AuthResult(
    val success: Boolean,
    val userDto: UserDto? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val errorMessage: String? = null
)

@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApiService,
    @ApplicationContext private val context: Context
) {
    val isLoggedIn: Flow<Boolean> = context.dataStore.data
        .map { prefs -> prefs[PrefsKeys.ACCESS_TOKEN] != null }

    val userRole: Flow<String> = context.dataStore.data
        .map { prefs -> prefs[PrefsKeys.USER_ROLE] ?: "" }

    val userId: Flow<String> = context.dataStore.data
        .map { prefs -> prefs[PrefsKeys.USER_ID] ?: "" }

    suspend fun login(username: String, password: String): AuthResult {
        return try {
            val response = authApi.login(LoginRequest(username, password))
            val body = response.body()
            if (response.isSuccessful && body != null) {
                saveSession(body)
                AuthResult(success = true, userDto = body.user,
                    accessToken = body.accessToken, refreshToken = body.refreshToken)
            } else {
                AuthResult(success = false,
                    errorMessage = "خطأ ${response.code()}: تحقق من بيانات الدخول")
            }
        } catch (e: Exception) {
            AuthResult(success = false, errorMessage = "لا يوجد اتصال بالإنترنت")
        }
    }

    suspend fun register(
        username: String, password: String,
        fullNameAr: String, role: String,
        schoolId: String? = null, enrollmentCode: String? = null
    ): AuthResult {
        return try {
            val response = authApi.register(
                RegisterRequest(username, password, fullNameAr, role, schoolId, enrollmentCode)
            )
            val body = response.body()
            if (response.isSuccessful && body != null) {
                saveSession(body)
                AuthResult(success = true, userDto = body.user,
                    accessToken = body.accessToken, refreshToken = body.refreshToken)
            } else {
                AuthResult(success = false,
                    errorMessage = "فشل التسجيل. تحقق من البيانات.")
            }
        } catch (e: Exception) {
            AuthResult(success = false, errorMessage = "لا يوجد اتصال بالإنترنت")
        }
    }

    suspend fun refreshToken(): AuthResult {
        return try {
            val prefs = context.dataStore.data
            var refreshToken = ""
            prefs.collect { refreshToken = it[PrefsKeys.REFRESH_TOKEN] ?: ""; return@collect }

            val response = authApi.refreshToken(RefreshTokenRequest(refreshToken))
            val body = response.body()
            if (response.isSuccessful && body != null) {
                saveSession(body)
                AuthResult(success = true, accessToken = body.accessToken)
            } else {
                clearSession()
                AuthResult(success = false, errorMessage = "انتهت الجلسة")
            }
        } catch (e: Exception) {
            AuthResult(success = false, errorMessage = "فشل تجديد الجلسة")
        }
    }

    suspend fun logout() {
        try { authApi.logout() } catch (_: Exception) {}
        clearSession()
    }

    private suspend fun saveSession(response: LoginResponse) {
        context.dataStore.edit { prefs ->
            prefs[PrefsKeys.ACCESS_TOKEN]  = response.accessToken
            prefs[PrefsKeys.REFRESH_TOKEN] = response.refreshToken
            prefs[PrefsKeys.USER_ID]       = response.user.id
            prefs[PrefsKeys.USER_ROLE]     = response.user.role
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { prefs ->
            prefs.remove(PrefsKeys.ACCESS_TOKEN)
            prefs.remove(PrefsKeys.REFRESH_TOKEN)
            prefs.remove(PrefsKeys.USER_ID)
            prefs.remove(PrefsKeys.USER_ROLE)
        }
    }
}
