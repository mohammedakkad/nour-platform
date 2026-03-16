package com.nour.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat

// ─────────────────────────────────────────────
// NOUR BRAND COLORS — same as web CSS variables
// ─────────────────────────────────────────────
object NourColors {
    // Teal (primary)
    val Teal900    = Color(0xFF065F46)
    val Teal700    = Color(0xFF0F766E)
    val Teal500    = Color(0xFF14B8A6)
    val Teal100    = Color(0xFFCCFBF1)
    val TealBgDark = Color(0x1F0F766E)

    // Gold (accent)
    val Gold900    = Color(0xFFB45309)
    val Gold700    = Color(0xFFD97706)
    val Gold500    = Color(0xFFF59E0B)
    val Gold300    = Color(0xFFFBBF24)
    val GoldBgDark = Color(0x1AF59E0B)

    // Orange
    val Orange500  = Color(0xFFF97316)

    // Light surfaces
    val White      = Color(0xFFFFFFFF)
    val Gray50     = Color(0xFFF8FAFC)
    val Gray100    = Color(0xFFF1F5F9)
    val Gray200    = Color(0xFFE2E8F0)
    val Gray400    = Color(0xFF94A3B8)
    val Gray600    = Color(0xFF64748B)
    val Gray900    = Color(0xFF0F172A)

    // Dark surfaces
    val Dark950    = Color(0xFF060A10)
    val Dark900    = Color(0xFF0D1117)
    val Dark800    = Color(0xFF161B22)
    val Dark700    = Color(0xFF1C2128)
    val DarkBorder = Color(0x14FFFFFF)

    // Status
    val Success    = Color(0xFF22C55E)
    val SuccessDark= Color(0xFF15803D)
    val Error      = Color(0xFFF87171)
    val ErrorDark  = Color(0xFFDC2626)
    val Warning    = Color(0xFFF59E0B)
}

// ─────────────────────────────────────────────
// LIGHT COLOR SCHEME
// ─────────────────────────────────────────────
val LightColorScheme = lightColorScheme(
    primary          = NourColors.Teal700,
    onPrimary        = NourColors.White,
    primaryContainer = NourColors.Teal100,
    onPrimaryContainer = NourColors.Teal900,

    secondary        = NourColors.Gold700,
    onSecondary      = NourColors.White,
    secondaryContainer = Color(0xFFFEF3C7),
    onSecondaryContainer = NourColors.Gold900,

    tertiary         = NourColors.Orange500,
    onTertiary       = NourColors.White,

    background       = NourColors.Gray50,
    onBackground     = NourColors.Gray900,

    surface          = NourColors.White,
    onSurface        = NourColors.Gray900,
    surfaceVariant   = NourColors.Gray100,
    onSurfaceVariant = NourColors.Gray600,

    outline          = NourColors.Gray200,
    outlineVariant   = NourColors.Gray100,

    error            = NourColors.ErrorDark,
    onError          = NourColors.White,
    errorContainer   = Color(0xFFFEE2E2),
    onErrorContainer = Color(0xFF991B1B),

    inverseSurface   = NourColors.Gray900,
    inverseOnSurface = NourColors.Gray50,
)

// ─────────────────────────────────────────────
// DARK COLOR SCHEME
// ─────────────────────────────────────────────
val DarkColorScheme = darkColorScheme(
    primary          = NourColors.Teal500,
    onPrimary        = Color(0xFF003731),
    primaryContainer = NourColors.Teal900,
    onPrimaryContainer = NourColors.Teal100,

    secondary        = NourColors.Gold500,
    onSecondary      = Color(0xFF3B1F00),
    secondaryContainer = NourColors.Gold900,
    onSecondaryContainer = NourColors.Gold300,

    tertiary         = NourColors.Orange500,
    onTertiary       = NourColors.White,

    background       = NourColors.Dark950,
    onBackground     = NourColors.Gray50,

    surface          = NourColors.Dark900,
    onSurface        = NourColors.Gray50,
    surfaceVariant   = NourColors.Dark800,
    onSurfaceVariant = NourColors.Gray400,

    outline          = NourColors.DarkBorder,
    outlineVariant   = Color(0x08FFFFFF),

    error            = NourColors.Error,
    onError          = Color(0xFF410002),
    errorContainer   = Color(0x1ADC2626),
    onErrorContainer = NourColors.Error,

    inverseSurface   = NourColors.Gray50,
    inverseOnSurface = NourColors.Gray900,
)

// ─────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────
val NourTypography = Typography(
    displayLarge  = TextStyle(fontWeight = FontWeight.Bold,    fontSize = 32.sp, lineHeight = 40.sp),
    headlineLarge = TextStyle(fontWeight = FontWeight.Bold,    fontSize = 28.sp, lineHeight = 36.sp),
    headlineMedium= TextStyle(fontWeight = FontWeight.SemiBold,fontSize = 24.sp, lineHeight = 32.sp),
    titleLarge    = TextStyle(fontWeight = FontWeight.SemiBold,fontSize = 20.sp, lineHeight = 28.sp),
    titleMedium   = TextStyle(fontWeight = FontWeight.Medium,  fontSize = 16.sp, lineHeight = 24.sp),
    titleSmall    = TextStyle(fontWeight = FontWeight.Medium,  fontSize = 14.sp, lineHeight = 20.sp),
    bodyLarge     = TextStyle(fontWeight = FontWeight.Normal,  fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium    = TextStyle(fontWeight = FontWeight.Normal,  fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall     = TextStyle(fontWeight = FontWeight.Normal,  fontSize = 12.sp, lineHeight = 16.sp),
    labelLarge    = TextStyle(fontWeight = FontWeight.Medium,  fontSize = 14.sp, lineHeight = 20.sp),
    labelMedium   = TextStyle(fontWeight = FontWeight.Medium,  fontSize = 12.sp, lineHeight = 16.sp),
    labelSmall    = TextStyle(fontWeight = FontWeight.Medium,  fontSize = 11.sp, lineHeight = 16.sp),
)

// ─────────────────────────────────────────────
// THEME PREFERENCE — stored in memory + DataStore
// ─────────────────────────────────────────────
enum class ThemePreference { LIGHT, DARK, SYSTEM }

// Global theme state — survives recomposition
val LocalThemePreference = staticCompositionLocalOf { ThemePreference.LIGHT }

// ─────────────────────────────────────────────
// MAIN THEME COMPOSABLE
// ─────────────────────────────────────────────
@Composable
fun NourTheme(
    themePreference: ThemePreference = ThemePreference.LIGHT,
    content: @Composable () -> Unit
) {
    val systemDark = isSystemInDarkTheme()
    val darkTheme = when (themePreference) {
        ThemePreference.DARK   -> true
        ThemePreference.LIGHT  -> false
        ThemePreference.SYSTEM -> systemDark
    }

    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Color.Transparent.toArgb()
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
                isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    CompositionLocalProvider(LocalThemePreference provides themePreference) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography  = NourTypography,
            content     = content
        )
    }
}