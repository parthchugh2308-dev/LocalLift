package com.example.locallift

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.locallift.data.model.UserEntity
import com.example.locallift.data.model.UserRole
import com.example.locallift.ui.screens.AiCopilotScreen
import com.example.locallift.ui.screens.CustomerCartScreen
import com.example.locallift.ui.screens.CustomerExploreScreen
import com.example.locallift.ui.screens.CustomerOrdersScreen
import com.example.locallift.ui.screens.CustomerSearchScreen
import com.example.locallift.ui.screens.LoginRegisterScreen
import com.example.locallift.ui.screens.ProfileScreen
import com.example.locallift.ui.screens.VendorDashboardScreen
import com.example.locallift.ui.screens.VendorDetailScreen
import com.example.locallift.ui.theme.CardBorderLight
import com.example.locallift.ui.theme.EmeraldJewel
import com.example.locallift.ui.theme.GreenLight
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.theme.LocalLiftTheme
import com.example.locallift.ui.viewmodel.AuthScreenState
import com.example.locallift.ui.viewmodel.AuthViewModel
import com.example.locallift.ui.viewmodel.CustomerViewModel
import com.example.locallift.ui.viewmodel.VendorViewModel

// ── Nav destinations per role ───────────────────────────────────────────────
enum class NavDestination {
    EXPLORE, SEARCH, AI_COPILOT, CART, ORDERS, VENDOR, PROFILE
}

data class NavItem(
    val destination: NavDestination,
    val label: String,
    val icon: ImageVector,
    val tag: String
)

val customerNavItems = listOf(
    NavItem(NavDestination.EXPLORE,    "Explore",   Icons.Default.Home,          "nav_explore"),
    NavItem(NavDestination.SEARCH,     "Search",    Icons.Default.Search,        "nav_search"),
    NavItem(NavDestination.AI_COPILOT, "AI",        Icons.Default.Star,          "nav_ai_copilot"),
    NavItem(NavDestination.CART,       "Cart",      Icons.Default.ShoppingCart,  "nav_cart"),
    NavItem(NavDestination.ORDERS,     "Orders",    Icons.Default.DateRange,     "nav_orders"),
    NavItem(NavDestination.PROFILE,    "Profile",   Icons.Default.AccountCircle, "nav_profile")
)

val vendorNavItems = listOf(
    NavItem(NavDestination.VENDOR,  "My Shop",   Icons.Default.Store,         "nav_vendor"),
    NavItem(NavDestination.EXPLORE, "Browse",    Icons.Default.Home,          "nav_explore"),
    NavItem(NavDestination.PROFILE, "Profile",   Icons.Default.AccountCircle, "nav_profile")
)

// ── Activity ────────────────────────────────────────────────────────────────
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as LocalLiftApp

        setContent {
            LocalLiftTheme {
                val authViewModel: AuthViewModel = viewModel {
                    AuthViewModel(app.authRepository)
                }
                val customerViewModel: CustomerViewModel = viewModel {
                    CustomerViewModel(app.repository)
                }
                val vendorViewModel: VendorViewModel = viewModel {
                    VendorViewModel(app.repository)
                }

                val authState by authViewModel.authScreenState.collectAsStateWithLifecycle()
                val allVendors by customerViewModel.vendorsWithDistance.collectAsStateWithLifecycle()

                AnimatedContent(
                    targetState = authState,
                    transitionSpec = { fadeIn(tween(300)) togetherWith fadeOut(tween(200)) },
                    label = "auth_transition"
                ) { state ->
                    when (state) {
                        is AuthScreenState.Loading -> {
                            // Blank while session is being restored
                            Box(Modifier.fillMaxSize())
                        }
                        is AuthScreenState.LoggedOut -> {
                            LoginRegisterScreen(
                                viewModel = authViewModel,
                                availableVendorIds = allVendors.map { it.vendor.id }
                            )
                        }
                        is AuthScreenState.LoggedIn -> {
                            MainScreen(
                                currentUser = state.user,
                                authViewModel = authViewModel,
                                customerViewModel = customerViewModel,
                                vendorViewModel = vendorViewModel
                            )
                        }
                    }
                }
            }
        }
    }
}

// ── Main app shell (post-login) ─────────────────────────────────────────────
@Composable
fun MainScreen(
    currentUser: UserEntity,
    authViewModel: AuthViewModel,
    customerViewModel: CustomerViewModel,
    vendorViewModel: VendorViewModel
) {
    val snackbarHostState = remember { SnackbarHostState() }
    val roleSwitchMsg by authViewModel.roleSwitchMessage.collectAsStateWithLifecycle()

    // Sync VendorViewModel with the logged-in user's vendor id
    LaunchedEffect(currentUser.linkedVendorId) {
        currentUser.linkedVendorId?.let { vendorViewModel.switchVendor(it) }
    }

    // Show role-switch snackbar
    LaunchedEffect(roleSwitchMsg) {
        roleSwitchMsg?.let {
            snackbarHostState.showSnackbar(it)
            authViewModel.clearRoleSwitchMessage()
        }
    }

    val isVendor = currentUser.role == UserRole.VENDOR
    val navItems = if (isVendor) vendorNavItems else customerNavItems

    var currentNav by remember(isVendor) {
        mutableStateOf(if (isVendor) NavDestination.VENDOR else NavDestination.EXPLORE)
    }
    var viewingVendorId by remember { mutableStateOf<Long?>(null) }

    val cartItems by customerViewModel.cartItems.collectAsStateWithLifecycle()
    val cartCount = cartItems.sumOf { it.quantity }

    // Back-press handling
    BackHandler(enabled = viewingVendorId != null) {
        viewingVendorId = null
        customerViewModel.selectVendor(null)
    }
    BackHandler(enabled = viewingVendorId == null && currentNav != navItems.first().destination) {
        currentNav = navItems.first().destination
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState, modifier = Modifier.padding(bottom = 80.dp))
        },
        bottomBar = {
            if (viewingVendorId == null) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                        .testTag("bottom_nav_bar"),
                    shape = RoundedCornerShape(26.dp),
                    color = Color.White.copy(alpha = 0.96f),
                    shadowElevation = 8.dp,
                    tonalElevation = 2.dp,
                    border = BorderStroke(1.dp, CardBorderLight)
                ) {
                    NavigationBar(
                        containerColor = Color.Transparent,
                        tonalElevation = 0.dp,
                        windowInsets = WindowInsets(0, 0, 0, 0),
                        modifier = Modifier.padding(horizontal = 2.dp, vertical = 2.dp)
                    ) {
                        navItems.forEach { item ->
                            val isCart = item.destination == NavDestination.CART
                            NavigationBarItem(
                                selected = currentNav == item.destination,
                                onClick = { currentNav = item.destination },
                                icon = {
                                    if (isCart && cartCount > 0) {
                                        BadgedBox(
                                            badge = {
                                                Badge(containerColor = EmeraldJewel) {
                                                    Text("$cartCount", color = Color.White, fontWeight = FontWeight.Bold)
                                                }
                                            }
                                        ) {
                                            Icon(item.icon, contentDescription = item.label)
                                        }
                                    } else {
                                        Icon(item.icon, contentDescription = item.label)
                                    }
                                },
                                label = {
                                    Text(
                                        item.label,
                                        fontSize = 10.sp,
                                        fontWeight = if (currentNav == item.destination) FontWeight.Bold else FontWeight.Medium
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = GreenPrimary,
                                    indicatorColor = GreenLight
                                ),
                                modifier = Modifier.testTag(item.tag)
                            )
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (viewingVendorId != null) {
                VendorDetailScreen(
                    viewModel = customerViewModel,
                    onBack = {
                        viewingVendorId = null
                        customerViewModel.selectVendor(null)
                    },
                    onNavigateToCart = {
                        viewingVendorId = null
                        customerViewModel.selectVendor(null)
                        currentNav = NavDestination.CART
                    }
                )
            } else {
                when (currentNav) {
                    NavDestination.EXPLORE -> CustomerExploreScreen(
                        viewModel = customerViewModel,
                        onNavigateToVendorDetail = { vendorId ->
                            customerViewModel.selectVendor(vendorId)
                            viewingVendorId = vendorId
                        }
                    )
                    NavDestination.SEARCH -> CustomerSearchScreen(
                        viewModel = customerViewModel,
                        onNavigateToVendorDetail = { vendorId ->
                            customerViewModel.selectVendor(vendorId)
                            viewingVendorId = vendorId
                        }
                    )
                    NavDestination.AI_COPILOT -> AiCopilotScreen(
                        customerViewModel = customerViewModel
                    )
                    NavDestination.CART -> CustomerCartScreen(
                        viewModel = customerViewModel,
                        onOrderPlaced = {
                            currentNav = NavDestination.ORDERS
                        }
                    )
                    NavDestination.ORDERS -> CustomerOrdersScreen(
                        viewModel = customerViewModel
                    )
                    NavDestination.VENDOR -> VendorDashboardScreen(
                        viewModel = vendorViewModel,
                        currentUser = currentUser,
                        onSwitchToCustomer = {
                            authViewModel.switchRole(UserRole.CUSTOMER)
                        }
                    )
                    NavDestination.PROFILE -> ProfileScreen(
                        currentUser = currentUser,
                        authViewModel = authViewModel,
                        vendorViewModel = vendorViewModel,
                        onNavigateToVendorDashboard = {
                            currentNav = NavDestination.VENDOR
                        }
                    )
                }
            }
        }
    }
}
