package com.example.locallift.data.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

enum class UserRole { CUSTOMER, VENDOR }

@Entity(
    tableName = "users",
    indices = [Index(value = ["email"], unique = true)]
)
data class UserEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val email: String,
    val displayName: String,
    val passwordHash: String,           // SHA-256 hex; never store plain text
    val role: UserRole = UserRole.CUSTOMER,
    val linkedVendorId: Long? = null,   // non-null when role == VENDOR
    val createdAt: Long = System.currentTimeMillis()
)
