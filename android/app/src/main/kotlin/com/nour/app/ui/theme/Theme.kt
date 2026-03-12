package com.nour.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat

// ──────────────────────────────────────────────
// Nour Brand Colors
// ──────────────────────────────────────────────

object NourColors {
    // Primary — Deep Teal (trust, education)
    val Primary = Color(0xFF0F766E)
    val PrimaryLight = Color(0xFF14B8A6)
    val PrimaryDark = Color(0xFF065F46)
    val OnPrimary = Color.White

    // Secondary — Warm Amber (warmth, hope)
    val Secondary = Color(0xFFB45309)
    val SecondaryLight = Color(0xFFF59E0B)
    val OnSecondary = Color.White

    // Accent — Coral (accent, calls to action)
    val Accent = Color(0xFFC8410A)
    val AccentLight = Color(0xFFF0D4C5)

    // Surfaces
    val Surface = Color(0xFFFAF8F4)
    val SurfaceVariant = Color(0xFFF4F1EC)
    val Background = Color(0xFFFAF8F4)

    // Ink
    val OnSurface = Color(0xFF0F1117)
    val OnSurfaceVariant = Color(0xFF6B6560)

    // Status
    val Success = Color(0xFF15803D)
    val Warning = Color(0xFF854D0E)
    val Error = Color(0xFF991B1B)

    // Role colors
    val StudentColor = Color(0xFF0F766E)
    val TeacherColor = Color(0xFF1A3A5C)
    val AdminColor = Color(0xFF7C2D12)
    val ParentColor = Color(0xFF5B21B6)
    val DonorColor = Color(0xFF6B6560)
}

private val LightColorScheme = lightColorScheme(
    primary = NourColors.Primary,
    onPrimary = NourColors.OnPrimary,
    primaryContainer = NourColors.PrimaryLight.copy(alpha = 0.2f),
    secondary = NourColors.Secondary,
    onSecondary = NourColors.OnSecondary,
    secondaryContainer = NourColors.SecondaryLight.copy(alpha = 0.2f),
    tertiary = NourColors.Accent,
    surface = NourColors.Surface,
    onSurface = NourColors.OnSurface,
    surfaceVariant = NourColors.SurfaceVariant,
    onSurfaceVariant = NourColors.OnSurfaceVariant,
    background = NourColors.Background,
    onBackground = NourColors.OnSurface,
    error = NourColors.Error
)

private val DarkColorScheme = darkColorScheme(
    primary = NourColors.PrimaryLight,
    onPrimary = Color(0xFF003731),
    secondary = NourColors.SecondaryLight,
    surface = Color(0xFF1A1C1E),
    background = Color(0xFF111315),
    onSurface = Color(0xFFE2E0DC),
    onBackground = Color(0xFFE2E0DC)
)

// ──────────────────────────────────────────────
// Typography (supports Arabic)
// ──────────────────────────────────────────────

val NourTypography = Typography(
    displayLarge = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 40.sp
    ),
    headlineLarge = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp
    ),
    headlineMedium = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        lineHeight = 32.sp
    ),
    titleLarge = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 28.sp
    ),
    titleMedium = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 24.sp
    ),
    bodyLarge = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp
    ),
    bodyMedium = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    labelLarge = androidx.compose.ui.text.TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp
    )
)

// ──────────────────────────────────────────────
// Theme Composable
// ──────────────────────────────────────────────

@Composable
fun NourTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = NourTypography,
        content = content
    )
}
