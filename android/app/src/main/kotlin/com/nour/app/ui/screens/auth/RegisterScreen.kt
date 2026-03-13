package com.nour.app.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nour.app.ui.viewmodel.AuthViewModel

@Composable
fun RegisterScreen(
    onRegisterSuccess: (String) -> Unit = {},
    onNavigateToLogin: () -> Unit = {},
    viewModel: AuthViewModel = hiltViewModel()
) {
    val authState by viewModel.authState.collectAsState()

    var fullNameAr  by remember { mutableStateOf("") }
    var username    by remember { mutableStateOf("") }
    var password    by remember { mutableStateOf("") }
    var confirmPass by remember { mutableStateOf("") }
    var enrollCode  by remember { mutableStateOf("") }
    var passError   by remember { mutableStateOf("") }

    LaunchedEffect(authState.isSuccess) {
        if (authState.isSuccess) onRegisterSuccess(authState.userRole)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(
                colors = listOf(Color(0xFF0F766E), Color(0xFF134E4A))
            )),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text("نور", fontSize = 40.sp, fontWeight = FontWeight.Black,
                    color = Color(0xFF0F766E))
                Text("إنشاء حساب جديد", fontSize = 18.sp,
                    fontWeight = FontWeight.Bold, color = Color(0xFF1F2937))

                OutlinedTextField(
                    value = fullNameAr,
                    onValueChange = { fullNameAr = it },
                    label = { Text("الاسم الكامل بالعربية") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("اسم المستخدم") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; passError = "" },
                    label = { Text("كلمة المرور") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = confirmPass,
                    onValueChange = { confirmPass = it; passError = "" },
                    label = { Text("تأكيد كلمة المرور") },
                    visualTransformation = PasswordVisualTransformation(),
                    isError = passError.isNotEmpty(),
                    supportingText = if (passError.isNotEmpty()) {{ Text(passError) }} else null,
                    modifier = Modifier.fillMaxWidth(), singleLine = true
                )
                OutlinedTextField(
                    value = enrollCode,
                    onValueChange = { enrollCode = it },
                    label = { Text("رمز الانضمام (للطلاب)") },
                    placeholder = { Text("اختياري") },
                    modifier = Modifier.fillMaxWidth(), singleLine = true
                )

                authState.errorMessage?.let { error ->
                    Card(colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFFEE2E2))) {
                        Text(error, color = Color(0xFFDC2626), fontSize = 13.sp,
                            modifier = Modifier.padding(12.dp))
                    }
                }

                Button(
                    onClick = {
                        if (password != confirmPass) {
                            passError = "كلمتا المرور غير متطابقتين"
                            return@Button
                        }
                        if (password.length < 6) {
                            passError = "كلمة المرور قصيرة جداً (6 أحرف على الأقل)"
                            return@Button
                        }
                        viewModel.register(
                            username = username,
                            password = password,
                            fullNameAr = fullNameAr,
                            role = "STUDENT",
                            enrollmentCode = enrollCode.ifBlank { null }
                        )
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    enabled = !authState.isLoading && username.isNotBlank()
                            && password.isNotBlank() && fullNameAr.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F766E))
                ) {
                    if (authState.isLoading) {
                        CircularProgressIndicator(color = Color.White,
                            modifier = Modifier.size(20.dp))
                    } else {
                        Text("إنشاء الحساب", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }

                TextButton(onClick = onNavigateToLogin) {
                    Text("لديك حساب بالفعل؟ تسجيل الدخول",
                        color = Color(0xFF0F766E), fontSize = 14.sp)
                }
            }
        }
    }
}
