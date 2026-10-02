package com.example.locallift.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locallift.data.model.UserEntity
import com.example.locallift.data.model.UserRole
import com.example.locallift.data.repository.AuthRepository
import com.example.locallift.data.repository.AuthResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed class AuthScreenState {
    object Loading : AuthScreenState()
    object LoggedOut : AuthScreenState()
    data class LoggedIn(val user: UserEntity) : AuthScreenState()
}

data class AuthUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class AuthViewModel(private val authRepository: AuthRepository) : ViewModel() {

    val currentUser: StateFlow<UserEntity?> = authRepository.currentUser
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    private val _authUiState = MutableStateFlow(AuthUiState())
    val authUiState: StateFlow<AuthUiState> = _authUiState.asStateFlow()

    private val _authScreenState = MutableStateFlow<AuthScreenState>(AuthScreenState.Loading)
    val authScreenState: StateFlow<AuthScreenState> = _authScreenState.asStateFlow()

    // Role-switch feedback
    private val _roleSwitchMessage = MutableStateFlow<String?>(null)
    val roleSwitchMessage: StateFlow<String?> = _roleSwitchMessage.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.restoreSession()
            val user = authRepository.currentUser.value
            _authScreenState.value = if (user != null) AuthScreenState.LoggedIn(user)
                                     else AuthScreenState.LoggedOut
        }

        // Keep screen state in sync when currentUser changes
        viewModelScope.launch {
            authRepository.currentUser.collect { user ->
                _authScreenState.value = if (user != null) AuthScreenState.LoggedIn(user)
                                         else AuthScreenState.LoggedOut
            }
        }
    }

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _authUiState.value = AuthUiState(errorMessage = "Please fill in all fields.")
            return
        }
        viewModelScope.launch {
            _authUiState.value = AuthUiState(isLoading = true)
            when (val result = authRepository.login(email, password)) {
                is AuthResult.Success -> _authUiState.value = AuthUiState()
                is AuthResult.Error   -> _authUiState.value = AuthUiState(errorMessage = result.message)
            }
        }
    }

    fun register(
        email: String,
        displayName: String,
        password: String,
        confirmPassword: String,
        role: UserRole = UserRole.CUSTOMER,
        linkedVendorId: Long? = null
    ) {
        when {
            email.isBlank() || displayName.isBlank() || password.isBlank() ->
                _authUiState.value = AuthUiState(errorMessage = "All fields are required.")
            password != confirmPassword ->
                _authUiState.value = AuthUiState(errorMessage = "Passwords do not match.")
            password.length < 6 ->
                _authUiState.value = AuthUiState(errorMessage = "Password must be at least 6 characters.")
            else -> {
                viewModelScope.launch {
                    _authUiState.value = AuthUiState(isLoading = true)
                    when (val result = authRepository.register(email, displayName, password, role, linkedVendorId)) {
                        is AuthResult.Success -> _authUiState.value = AuthUiState()
                        is AuthResult.Error   -> _authUiState.value = AuthUiState(errorMessage = result.message)
                    }
                }
            }
        }
    }

    /** Switch logged-in user between CUSTOMER and VENDOR roles */
    fun switchRole(newRole: UserRole, vendorId: Long? = null) {
        viewModelScope.launch {
            _authUiState.value = AuthUiState(isLoading = true)
            when (val result = authRepository.switchRole(newRole, vendorId)) {
                is AuthResult.Success -> {
                    _authUiState.value = AuthUiState()
                    _roleSwitchMessage.value =
                        if (newRole == UserRole.VENDOR) "Switched to Vendor mode ✓"
                        else "Switched to Customer mode ✓"
                }
                is AuthResult.Error -> {
                    _authUiState.value = AuthUiState(errorMessage = result.message)
                }
            }
        }
    }

    /** Register existing customer as a vendor by linking their vendorId */
    fun becomeVendor(vendorId: Long) {
        viewModelScope.launch {
            _authUiState.value = AuthUiState(isLoading = true)
            when (val result = authRepository.registerAsVendor(vendorId)) {
                is AuthResult.Success -> {
                    _authUiState.value = AuthUiState()
                    _roleSwitchMessage.value = "Vendor profile activated! Welcome, ${result.user.displayName}."
                }
                is AuthResult.Error -> _authUiState.value = AuthUiState(errorMessage = result.message)
            }
        }
    }

    fun logout() {
        authRepository.logout()
    }

    fun clearError() {
        _authUiState.value = _authUiState.value.copy(errorMessage = null)
    }

    fun clearRoleSwitchMessage() {
        _roleSwitchMessage.value = null
    }
}
