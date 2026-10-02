package com.example.locallift.data.repository

import android.util.Log
import com.example.locallift.data.model.UserEntity
import com.example.locallift.data.model.UserRole
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

private const val TAG = "FirebaseService"

/**
 * Optional Firebase sync layer.
 *
 * Architecture: Room is the source of truth.
 * Firebase Auth is used for cloud identity; Firestore mirrors the user profile for cross-device sync.
 * If Firebase is unavailable (no google-services.json, no internet) everything falls back gracefully.
 */
object FirebaseService {

    private val auth: FirebaseAuth by lazy { Firebase.auth }
    private val db by lazy { Firebase.firestore }

    val currentFirebaseUser: FirebaseUser? get() = auth.currentUser

    /**
     * Register a new user in Firebase Auth and persist their profile in Firestore.
     * Returns true on success, false on any error (caller falls back to local Room auth).
     */
    suspend fun registerWithFirebase(
        email: String,
        password: String,
        displayName: String,
        role: UserRole
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val uid = result.user?.uid ?: return@withContext false
            db.collection("users").document(uid).set(
                mapOf(
                    "displayName" to displayName,
                    "email" to email,
                    "role" to role.name,
                    "createdAt" to System.currentTimeMillis()
                )
            ).await()
            true
        } catch (e: Exception) {
            Log.w(TAG, "Firebase register failed (local auth will be used): ${e.message}")
            false
        }
    }

    /**
     * Sign in with Firebase Auth. Returns true on success.
     */
    suspend fun loginWithFirebase(email: String, password: String): Boolean =
        withContext(Dispatchers.IO) {
            try {
                auth.signInWithEmailAndPassword(email, password).await()
                true
            } catch (e: Exception) {
                Log.w(TAG, "Firebase login failed (local auth will be used): ${e.message}")
                false
            }
        }

    /**
     * Update the user role in Firestore.
     */
    suspend fun syncRoleToFirestore(role: UserRole) = withContext(Dispatchers.IO) {
        try {
            val uid = auth.currentUser?.uid ?: return@withContext
            db.collection("users").document(uid)
                .update("role", role.name)
                .await()
        } catch (e: Exception) {
            Log.w(TAG, "Firestore role sync failed: ${e.message}")
        }
    }

    /**
     * Sync a full user profile to Firestore (called after role changes).
     */
    suspend fun syncUserProfile(user: UserEntity) = withContext(Dispatchers.IO) {
        try {
            val uid = auth.currentUser?.uid ?: return@withContext
            db.collection("users").document(uid).set(
                mapOf(
                    "displayName" to user.displayName,
                    "email" to user.email,
                    "role" to user.role.name,
                    "linkedVendorId" to (user.linkedVendorId ?: ""),
                    "lastUpdated" to System.currentTimeMillis()
                )
            ).await()
        } catch (e: Exception) {
            Log.w(TAG, "Firestore profile sync failed: ${e.message}")
        }
    }

    fun signOut() {
        try { auth.signOut() } catch (e: Exception) { /* ignore */ }
    }
}
