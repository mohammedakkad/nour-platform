package com.nour.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nour.app.data.local.dao.ContentDao
import com.nour.app.data.local.entity.ContentItemEntity
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class StudentUiState(
    val isLoading: Boolean = false,
    val isOnline: Boolean = true,
    val studentName: String = "",
    val className: String = "",
    val averageScore: Float = 0f,
    val streakDays: Int = 0,
    val totalStars: Int = 0,
    val availableLessons: Int = 0,
    val pendingExams: Int = 0,
    val pendingSubmissions: Int = 0,
    val recentContent: List<ContentItemEntity> = emptyList(),
    val errorMessage: String? = null
)

@HiltViewModel
class StudentViewModel @Inject constructor(
    private val contentDao: ContentDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentUiState())
    val uiState: StateFlow<StudentUiState> = _uiState

    private val _unreadNotificationCount = MutableStateFlow(0)
    val unreadNotificationCount: StateFlow<Int> = _unreadNotificationCount

    private val _syncStatus = MutableStateFlow("synced")
    val syncStatus: StateFlow<String> = _syncStatus

    init { loadStudentData() }

    private fun loadStudentData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val content = contentDao.getAllContent()
                _uiState.value = StudentUiState(
                    isLoading = false,
                    studentName = "الطالب",
                    className = "الفصل",
                    availableLessons = content.size,
                    recentContent = content.take(5)
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message
                )
            }
        }
    }
}
