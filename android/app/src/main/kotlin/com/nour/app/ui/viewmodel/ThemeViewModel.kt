package com.nour.app.ui.viewmodel

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nour.app.data.remote.dataStore
import com.nour.app.ui.theme.ThemePreference
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

private val THEME_KEY = stringPreferencesKey("theme_preference")

@HiltViewModel
class ThemeViewModel @Inject constructor(
    @ApplicationContext private val context: Context
) : ViewModel() {

    val themePreference = context.dataStore.data
        .map { prefs ->
            when (prefs[THEME_KEY]) {
                "DARK"   -> ThemePreference.DARK
                "SYSTEM" -> ThemePreference.SYSTEM
                else     -> ThemePreference.LIGHT   // default = light
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = ThemePreference.LIGHT
        )

    fun setTheme(preference: ThemePreference) {
        viewModelScope.launch {
            context.dataStore.edit { prefs ->
                prefs[THEME_KEY] = preference.name
            }
        }
    }

    fun toggleTheme() {
        val next = when (themePreference.value) {
            ThemePreference.LIGHT  -> ThemePreference.DARK
            ThemePreference.DARK   -> ThemePreference.SYSTEM
            ThemePreference.SYSTEM -> ThemePreference.LIGHT
        }
        setTheme(next)
    }
}