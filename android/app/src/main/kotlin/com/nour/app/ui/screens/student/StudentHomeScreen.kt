package com.nour.app.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nour.app.ui.theme.NourColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentHomeScreen(
    onNavigateToLessons: () -> Unit,
    onNavigateToExams: () -> Unit,
    onNavigateToProgress: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    viewModel: StudentViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val unreadCount by viewModel.unreadNotificationCount.collectAsState(initial = 0)
    val syncStatus by viewModel.syncStatus.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "أهلاً، ${uiState.studentName} 👋",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = uiState.className,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
                        )
                    }
                },
                actions = {
                    // Sync status indicator
                    if (syncStatus.pendingSubmissions > 0) {
                        Badge(
                            containerColor = NourColors.Warning
                        ) {
                            Text(syncStatus.pendingSubmissions.toString())
                        }
                    }
                    // Notifications
                    BadgedBox(badge = {
                        if (unreadCount > 0) Badge { Text(unreadCount.toString()) }
                    }) {
                        IconButton(onClick = onNavigateToNotifications) {
                            Icon(Icons.Default.Notifications, contentDescription = "إشعارات")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = NourColors.Primary,
                    titleContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // ── Offline warning banner ──
            if (!uiState.isOnline) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = NourColors.Warning.copy(alpha = 0.15f)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.WifiOff, contentDescription = null,
                                tint = NourColors.Warning)
                            Text(
                                "أنت غير متصل بالإنترنت — يمكنك الاستمرار بالمحتوى المحمّل",
                                style = MaterialTheme.typography.bodySmall,
                                color = NourColors.Warning
                            )
                        }
                    }
                }
            }

            // ── Progress Summary ──
            item {
                StudentProgressSummaryCard(
                    averageScore = uiState.averageScore,
                    streakDays = uiState.streakDays,
                    totalStars = uiState.totalStars,
                    onViewDetails = onNavigateToProgress
                )
            }

            // ── Quick Actions ──
            item {
                Text(
                    text = "ماذا تريد أن تفعل؟",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    QuickActionCard(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.MenuBook,
                        title = "الدروس",
                        subtitle = "${uiState.availableLessons} درس",
                        backgroundColor = NourColors.StudentColor,
                        onClick = onNavigateToLessons
                    )
                    QuickActionCard(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.Assignment,
                        title = "الاختبارات",
                        subtitle = "${uiState.pendingExams} اختبار",
                        backgroundColor = NourColors.Accent,
                        onClick = onNavigateToExams
                    )
                }
            }

            // ── Recent Content ──
            if (uiState.recentContent.isNotEmpty()) {
                item {
                    Text(
                        text = "المحتوى الأخير",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                items(uiState.recentContent.take(3)) { content ->
                    ContentItemCard(
                        title = content.titleAr,
                        subject = content.subject,
                        type = content.type.name,
                        isDownloaded = content.isDownloaded,
                        onClick = { /* navigate to lesson */ }
                    )
                }
            }
        }
    }
}

@Composable
fun StudentProgressSummaryCard(
    averageScore: Double,
    streakDays: Int,
    totalStars: Int,
    onViewDetails: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = NourColors.Primary.copy(alpha = 0.08f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "تقدمك الأكاديمي",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = NourColors.Primary
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                StatItem(label = "المتوسط", value = "${averageScore.toInt()}%", icon = "📊")
                StatItem(label = "الأيام المتتالية", value = "$streakDays", icon = "🔥")
                StatItem(label = "النجوم", value = "$totalStars", icon = "⭐")
            }

            TextButton(
                onClick = onViewDetails,
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("عرض التفاصيل", color = NourColors.Primary)
                Icon(Icons.Default.ArrowBack, contentDescription = null,
                    modifier = Modifier.size(16.dp), tint = NourColors.Primary)
            }
        }
    }
}

@Composable
fun StatItem(label: String, value: String, icon: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = icon, fontSize = 24.sp)
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = NourColors.Primary
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickActionCard(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    title: String,
    subtitle: String,
    backgroundColor: Color,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(32.dp)
            )
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.8f)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContentItemCard(
    title: String,
    subject: String,
    type: String,
    isDownloaded: Boolean,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Type icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(NourColors.Primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = when (type) {
                        "VIDEO" -> "🎬"
                        "AUDIO" -> "🎵"
                        "WORKSHEET" -> "📋"
                        "QUIZ" -> "❓"
                        else -> "📖"
                    },
                    fontSize = 24.sp
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = subject,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (isDownloaded) {
                Icon(
                    Icons.Default.DownloadDone,
                    contentDescription = "محمّل",
                    tint = NourColors.Success,
                    modifier = Modifier.size(20.dp)
                )
            } else {
                Icon(
                    Icons.Default.Download,
                    contentDescription = "تحميل",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}
