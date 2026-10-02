package com.example.locallift.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.locallift.data.model.UserEntity
import com.example.locallift.data.model.UserRole
import com.example.locallift.ui.theme.AmberAccent
import com.example.locallift.ui.theme.GreenDark
import com.example.locallift.ui.theme.GreenLight
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.viewmodel.AuthViewModel
import com.example.locallift.ui.viewmodel.VendorViewModel

@Composable
fun ProfileScreen(
    currentUser: UserEntity,
    authViewModel: AuthViewModel,
    vendorViewModel: VendorViewModel,
    onNavigateToVendorDashboard: () -> Unit
) {
    val uiState by authViewModel.authUiState.collectAsStateWithLifecycle()
    val allVendors by vendorViewModel.allVendors.collectAsStateWithLifecycle()
    val isVendor = currentUser.role == UserRole.VENDOR

    var showLogoutConfirm by remember { mutableStateOf(false) }
    var showBecomeVendorDialog by remember { mutableStateOf(false) }

    // Logout confirmation dialog
    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text("Sign Out", fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to sign out of LocalLift?") },
            confirmButton = {
                Button(
                    onClick = {
                        authViewModel.logout()
                        showLogoutConfirm = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFB71C1C))
                ) {
                    Text("Sign Out", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirm = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Become Vendor dialog
    if (showBecomeVendorDialog) {
        AlertDialog(
            onDismissRequest = { showBecomeVendorDialog = false },
            title = { Text("Become a Vendor", fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text("Your account will be linked to the first shop in our marketplace.")
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "You can switch back to Customer mode anytime from your profile.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val vid = allVendors.firstOrNull()?.id ?: 1L
                        authViewModel.becomeVendor(vid)
                        showBecomeVendorDialog = false
                        onNavigateToVendorDashboard()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                ) {
                    Text("Activate Vendor Mode", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showBecomeVendorDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize()
    ) {
        // ── Profile Header ──────────────────────────────────────────────────
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(GreenPrimary, GreenDark),
                            startY = 0f,
                            endY = 400f
                        )
                    )
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(84.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.22f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            currentUser.displayName.firstOrNull()?.uppercase() ?: "U",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(
                        currentUser.displayName,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        currentUser.email,
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                    Spacer(Modifier.height(10.dp))

                    // Role badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (isVendor) AmberAccent.copy(alpha = 0.2f)
                                else GreenLight.copy(alpha = 0.25f)
                            )
                            .padding(horizontal = 14.dp, vertical = 5.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                if (isVendor) Icons.Default.Store else Icons.Default.Person,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                if (isVendor) "Vendor Account" else "Customer Account",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }

        // ── Role Switch Card ────────────────────────────────────────────────
        item {
            Spacer(Modifier.height(16.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Role & Access",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = GreenPrimary
                    )
                    Spacer(Modifier.height(12.dp))

                    if (isVendor) {
                        // Currently in VENDOR mode → offer switch to CUSTOMER
                        ProfileActionRow(
                            icon = Icons.Default.Person,
                            title = "Switch to Customer Mode",
                            subtitle = "Browse shops and place orders",
                            actionLabel = "Switch",
                            actionColor = GreenPrimary,
                            isLoading = uiState.isLoading,
                            onClick = { authViewModel.switchRole(UserRole.CUSTOMER) }
                        )
                        Spacer(Modifier.height(12.dp))
                        ProfileActionRow(
                            icon = Icons.Default.Store,
                            title = "Go to Vendor Dashboard",
                            subtitle = "Manage your shop, products and orders",
                            actionLabel = "Open",
                            actionColor = GreenDark,
                            isLoading = false,
                            onClick = onNavigateToVendorDashboard
                        )
                    } else {
                        // Currently in CUSTOMER mode
                        if (currentUser.linkedVendorId != null) {
                            // Has a linked vendor → can switch
                            ProfileActionRow(
                                icon = Icons.Default.Store,
                                title = "Switch to Vendor Mode",
                                subtitle = "Manage your shop on LocalLift",
                                actionLabel = "Switch",
                                actionColor = AmberAccent,
                                isLoading = uiState.isLoading,
                                onClick = { authViewModel.switchRole(UserRole.VENDOR, currentUser.linkedVendorId) }
                            )
                        } else {
                            // No vendor linked → offer to become one
                            ProfileActionRow(
                                icon = Icons.Default.Star,
                                title = "Become a Vendor",
                                subtitle = "List your shop and start selling locally",
                                actionLabel = "Activate",
                                actionColor = AmberAccent,
                                isLoading = uiState.isLoading,
                                onClick = { showBecomeVendorDialog = true }
                            )
                        }
                    }
                }
            }
        }

        // ── Account Section ─────────────────────────────────────────────────
        item {
            Spacer(Modifier.height(12.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Account", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GreenPrimary)
                    Spacer(Modifier.height(8.dp))
                    HorizontalDivider(color = GreenLight.copy(alpha = 0.4f))
                    Spacer(Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = GreenPrimary)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(currentUser.displayName, fontSize = 15.sp, fontWeight = FontWeight.Medium)
                            Text(currentUser.email, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }

        // ── Sign Out ────────────────────────────────────────────────────────
        item {
            Spacer(Modifier.height(16.dp))
            OutlinedButton(
                onClick = { showLogoutConfirm = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFB71C1C))
            ) {
                Icon(Icons.Default.ExitToApp, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Sign Out", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun ProfileActionRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    actionLabel: String,
    actionColor: Color,
    isLoading: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(actionColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = actionColor, modifier = Modifier.size(22.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column {
                Text(title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                Text(subtitle, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Spacer(Modifier.width(8.dp))
        Button(
            onClick = onClick,
            enabled = !isLoading,
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = actionColor)
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = Color.White, strokeWidth = 2.dp, modifier = Modifier.size(18.dp))
            } else {
                Text(actionLabel, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
