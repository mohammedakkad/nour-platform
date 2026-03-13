package com.nour.app.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nour.app.ui.viewmodel.StudentViewModel

@Composable
fun StudentHomeScreen(
    onNavigateToLessons: () -> Unit = {},
    onNavigateToExams: () -> Unit = {},
    onNavigateToProgress: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {},
    onLogout: () -> Unit = {},
    viewModel: StudentViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val unreadNotificationCount by viewModel.unreadNotificationCount.collectAsState()
    val syncStatus by viewModel.syncStatus.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF9FAFB))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Header
        item {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF0F766E))) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "أهلاً، ${uiState.studentName}",
                                color = Color.White,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = uiState.className,
                                color = Color(0xFF99F6E4),
                                fontSize = 14.sp
                            )
                        }
                        IconButton(onClick = onLogout) {
                            Icon(
                                imageVector = Icons.Default.ExitToApp,
                                contentDescription = "تسجيل الخروج",
                                tint = Color.White.copy(alpha = 0.8f)
                            )
                        }
                    }
                    if (!uiState.isOnline) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = "⚠️ وضع عدم الاتصال",
                            color = Color(0xFFFDE68A),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Pending submissions warning
        if (uiState.pendingSubmissions > 0) {
            item {
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF9C3))) {
                    Text(
                        text = "⏳ ${uiState.pendingSubmissions} إجابة في انتظار الإرسال",
                        modifier = Modifier.padding(12.dp),
                        color = Color(0xFF92400E),
                        fontSize = 14.sp
                    )
                }
            }
        }

        // Stats
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StudentStatCard(
                    modifier = Modifier.weight(1f),
                    label = "المعدل",
                    value = "${uiState.averageScore.toInt()}%"
                )
                StudentStatCard(
                    modifier = Modifier.weight(1f),
                    label = "الدروس",
                    value = "${uiState.availableLessons}"
                )
                StudentStatCard(
                    modifier = Modifier.weight(1f),
                    label = "الاختبارات",
                    value = "${uiState.pendingExams}"
                )
            }
        }

        // Quick actions
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onNavigateToLessons,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F766E))
                ) { Text("الدروس") }
                Button(
                    onClick = onNavigateToExams,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F766E))
                ) { Text("الاختبارات") }
            }
        }

        // Recent content title
        item {
            Text(
                text = "آخر المحتوى",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1F2937)
            )
        }

        // Content list
        if (uiState.recentContent.isEmpty()) {
            item {
                Card {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("لا يوجد محتوى متاح حالياً", color = Color.Gray)
                    }
                }
            }
        } else {
            items(uiState.recentContent) { content ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = content.titleAr,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "${content.subject} · ${content.type}",
                            fontSize = 13.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StudentStatCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F766E)
            )
            Text(text = label, fontSize = 12.sp, color = Color.Gray)
        }
    }
}