package com.example.locallift.data.repository

import android.content.SharedPreferences
import com.example.locallift.data.dao.LocalLiftDao
import com.example.locallift.data.model.UserEntity
import com.example.locallift.data.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.security.MessageDigest


sealed class AuthResult {
    data class Success(val user: UserEntity) : AuthResult()
    data class Error(val message: String) : AuthResult()
}

class AuthRepository(
    private val dao: LocalLiftDao,
    private val prefs: SharedPreferences
) {

    private val _currentUser = MutableStateFlow<UserEntity?>(null)
    val currentUser: StateFlow<UserEntity?> = _currentUser.asStateFlow()

    val isLoggedIn: Boolean get() = _currentUser.value != null

    // ── Restore session on app launch ──────────────────────────────────────
    suspend fun restoreSession() {
        val savedId = prefs.getLong(KEY_USER_ID, -1L)
        if (savedId != -1L) {
            val user = withContext(Dispatchers.IO) { dao.findUserById(savedId) }
            _currentUser.value = user
        }
    }

    // ── Register ──────────────────────────────────────────────────────────
    suspend fun register(
        email: String,
        displayName: String,
        password: String,
        role: UserRole = UserRole.CUSTOMER,
        linkedVendorId: Long? = null
    ): AuthResult = withContext(Dispatchers.IO) {
        val trimmedEmail = email.trim().lowercase()
        if (trimmedEmail.isBlank() || password.length < 6) {
            return@withContext AuthResult.Error("Email and a minimum 6-character password are required.")
        }
        val existing = dao.findUserByEmail(trimmedEmail)
        if (existing != null) {
            return@withContext AuthResult.Error("An account with this email already exists.")
        }
        val hash = sha256(password)
        val newUser = UserEntity(
            email = trimmedEmail,
            displayName = displayName.trim().ifBlank { trimmedEmail.substringBefore('@') },
            passwordHash = hash,
            role = role,
            linkedVendorId = linkedVendorId
        )
        try {
            val id = dao.insertUser(newUser)
            val inserted = newUser.copy(id = id)
            persistSession(inserted)
            // Async Firebase sync (fire-and-forget, non-blocking)
            FirebaseService.registerWithFirebase(trimmedEmail, password, inserted.displayName, role)
            AuthResult.Success(inserted)
        } catch (e: Exception) {
            AuthResult.Error("Registration failed: ${e.localizedMessage}")
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────
    suspend fun login(email: String, password: String): AuthResult = withContext(Dispatchers.IO) {
        val trimmedEmail = email.trim().lowercase()
        val user = dao.findUserByEmail(trimmedEmail)
            ?: return@withContext AuthResult.Error("No account found with this email.")
        if (user.passwordHash != sha256(password)) {
            return@withContext AuthResult.Error("Incorrect password. Please try again.")
        }
        persistSession(user)
        // Async Firebase sync
        FirebaseService.loginWithFirebase(trimmedEmail, password)
        AuthResult.Success(user)
    }

    // ── Switch Role ───────────────────────────────────────────────────────
    /**
     * Toggle a logged-in user between CUSTOMER ↔ VENDOR.
     * A user can only switch to VENDOR if they have a linkedVendorId.
     */
    suspend fun switchRole(newRole: UserRole, vendorId: Long? = null): AuthResult {
        val user = _currentUser.value
            ?: return AuthResult.Error("Not logged in.")
        return withContext(Dispatchers.IO) {
            if (newRole == UserRole.VENDOR) {
                val vid = vendorId ?: user.linkedVendorId
                    ?: return@withContext AuthResult.Error(
                        "No vendor profile linked. Register as a Vendor first."
                    )
                dao.updateUserRole(user.id, UserRole.VENDOR)
                dao.linkUserToVendor(user.id, vid)
                val updated = user.copy(role = UserRole.VENDOR, linkedVendorId = vid)
                persistSession(updated)
                AuthResult.Success(updated)
            } else {
                dao.updateUserRole(user.id, UserRole.CUSTOMER)
                val updated = user.copy(role = UserRole.CUSTOMER)
                persistSession(updated)
                AuthResult.Success(updated)
            }
        }
    }

    // ── Register as Vendor (creates vendor profile and links it) ──────────
    suspend fun registerAsVendor(vendorId: Long): AuthResult {
        val user = _currentUser.value ?: return AuthResult.Error("Not logged in.")
        return withContext(Dispatchers.IO) {
            dao.updateUserRole(user.id, UserRole.VENDOR)
            dao.linkUserToVendor(user.id, vendorId)
            val updated = user.copy(role = UserRole.VENDOR, linkedVendorId = vendorId)
            persistSession(updated)
            AuthResult.Success(updated)
        }
    }

    // ── Logout ────────────────────────────────────────────────────────────
    fun logout() {
        prefs.edit().remove(KEY_USER_ID).apply()
        _currentUser.value = null
        FirebaseService.signOut()
    }

    // ── Private helpers ───────────────────────────────────────────────────
    private fun persistSession(user: UserEntity) {
        _currentUser.value = user
        prefs.edit().putLong(KEY_USER_ID, user.id).apply()
    }

    private fun sha256(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    companion object {
        private const val KEY_USER_ID = "ll_session_user_id"
        const val PREFS_NAME = "locallift_auth"
    }
}
