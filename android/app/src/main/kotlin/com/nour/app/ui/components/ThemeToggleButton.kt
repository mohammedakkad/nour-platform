package com.nour.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.SettingsBrightness
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nour.app.ui.theme.ThemePreference

data class ThemeOption(
    val preference: ThemePreference,
    val label: String,
    val icon: ImageVector
)

private val options = listOf(
    ThemeOption(ThemePreference.LIGHT,  "فاتح",   Icons.Default.LightMode),
    ThemeOption(ThemePreference.DARK,   "داكن",   Icons.Default.DarkMode),
    ThemeOption(ThemePreference.SYSTEM, "تلقائي", Icons.Default.SettingsBrightness),
)

/**
 * 3-segment pill toggle — matches web behavior
 */
@Composable
fun ThemeTogglePill(
    current: ThemePreference,
    onSelect: (ThemePreference) -> Unit,
    modifier: Modifier = Modifier
) {
    val shape = RoundedCornerShape(12.dp)

    Row(
        modifier = modifier
            .clip(shape)
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(1.dp, MaterialTheme.colorScheme.outline, shape)
            .padding(3.dp),
        horizontalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        options.forEach { option ->
            val isSelected = current == option.preference
            val bgColor by animateColorAsState(
                targetValue = if (isSelected) MaterialTheme.colorScheme.surface
                else Color.Transparent,
                animationSpec = tween(200),
                label = "segBg"
            )
            val contentColor by animateColorAsState(
                targetValue = if (isSelected) MaterialTheme.colorScheme.primary
                else MaterialTheme.colorScheme.onSurfaceVariant,
                animationSpec = tween(200),
                label = "segContent"
            )

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(9.dp))
                    .background(bgColor)
                    .clickable { onSelect(option.preference) }
                    .padding(horizontal = 12.dp, vertical = 7.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp)
            ) {
                Icon(
                    imageVector = option.icon,
                    contentDescription = option.label,
                    tint = contentColor,
                    modifier = Modifier.size(15.dp)
                )
                Text(
                    text = option.label,
                    color = contentColor,
                    fontSize = 12.sp,
                    fontWeight = if (isSelected)
                        androidx.compose.ui.text.font.FontWeight.SemiBold
                    else
                        androidx.compose.ui.text.font.FontWeight.Normal
                )
            }
        }
    }
}

/**
 * Simple icon-only toggle button (for top bar)
 */
@Composable
fun ThemeIconButton(
    current: ThemePreference,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    val icon = when (current) {
        ThemePreference.LIGHT  -> Icons.Default.LightMode
        ThemePreference.DARK   -> Icons.Default.DarkMode
        ThemePreference.SYSTEM -> Icons.Default.SettingsBrightness
    }
    IconButton(onClick = onToggle, modifier = modifier) {
        Icon(
            imageVector = icon,
            contentDescription = "تغيير الثيم",
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}