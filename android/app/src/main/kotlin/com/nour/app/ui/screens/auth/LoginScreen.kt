package com.nour.app.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.nour.app.ui.viewmodel.AuthViewModel

@Composable
fun LoginScreen(
    onLoginSuccess: (String) -> Unit = {},
    onNavigateToRegister: () -> Unit = {},
    viewModel: AuthViewModel = hiltViewModel()
) {
    val authState by viewModel.authState.collectAsState()

    var username by remember {
        mutableStateOf("")
    }
    var password by remember {
        mutableStateOf("")
    }

    LaunchedEffect(authState.isSuccess) {
        if (authState.isSuccess) {
            onLoginSuccess(authState.userRole)
        }
    }

    Box(
        modifier = Modifier
        .fillMaxSize()
        .background(
            Brush.verticalGradient(
                colors = listOf(Color(0xFF0F766E), Color(0xFF134E4A))
            )
        ),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "نور",
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F766E)
                )

                Text(
                    text = "تسجيل الدخول",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1F2937)
                )

                OutlinedTextField(
                    value = username,
                    onValueChange = {
                        username = it
                    },
                    label = {
                        Text("اسم المستخدم")
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = {
                        password = it
                    },
                    label = {
                        Text("كلمة المرور")
                    },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                authState.errorMessage?.let {
                    error ->
                    Text(
                        text = error,
                        color = Color(0xFFDC2626),
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Button(
                    onClick = {
                        viewModel.login(username, password)
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    enabled = !authState.isLoading && username.isNotBlank() && password.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F766E))
                ) {
                    if (authState.isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Text("دخول", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}