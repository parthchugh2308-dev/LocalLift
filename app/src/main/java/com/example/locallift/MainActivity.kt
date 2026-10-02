package com.example.locallift

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.locallift.ui.screens.AiCopilotScreen
import com.example.locallift.ui.screens.CustomerCartScreen
import com.example.locallift.ui.screens.CustomerExploreScreen
import com.example.locallift.ui.screens.CustomerOrdersScreen
import com.example.locallift.ui.screens.CustomerSearchScreen
import com.example.locallift.ui.screens.VendorDashboardScreen
import com.example.locallift.ui.screens.VendorDetailScreen
import com.example.locallift.ui.theme.CardBorderLight
import com.example.locallift.ui.theme.EmeraldJewel
import com.example.locallift.ui.theme.GreenLight
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.theme.LocalLiftTheme
import com.example.locallift.ui.viewmodel.CustomerViewModel
import com.example.locallift.ui.viewmodel.VendorViewModel

enum class NavDestination {
    EXPLORE,
    SEARCH,
    AI_COPILOT,
    CART,
    ORDERS,
    VENDOR
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val app = application as LocalLiftApp
        val repository = app.repository

        setContent {
            LocalLiftTheme {
                val customerViewModel: CustomerViewModel = viewModel { CustomerViewModel(repository) }
                val vendorViewModel: VendorViewModel = viewModel { VendorViewModel(repository) }

                MainScreen(
                    customerViewModel = customerViewModel,
                    vendorViewModel = vendorViewModel
                )
            }
        }
    }
}

@Composable
fun MainScreen(
    customerViewModel: CustomerViewModel,
    vendorViewModel: VendorViewModel
) {
    var currentNav by remember { mutableStateOf(NavDestination.EXPLORE) }
    var viewingVendorId by remember { mutableStateOf<Long?>(null) }
    val cartItems by customerViewModel.cartItems.collectAsStateWithLifecycle()
    val cartCount = cartItems.sumOf { it.quantity }

    // Handle Back Press navigation
    BackHandler(enabled = viewingVendorId != null) {
        viewingVendorId = null
        customerViewModel.selectVendor(null)
    }
    BackHandler(enabled = viewingVendorId == null && currentNav != NavDestination.EXPLORE) {
        currentNav = NavDestination.EXPLORE
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
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
                        NavigationBarItem(
                            selected = currentNav == NavDestination.EXPLORE,
                            onClick = { currentNav = NavDestination.EXPLORE },
                            icon = { Icon(Icons.Default.Home, contentDescription = stringResource(R.string.nav_explore)) },
                            label = { Text(stringResource(R.string.nav_explore), fontSize = 10.sp, fontWeight = if (currentNav == NavDestination.EXPLORE) FontWeight.Bold else FontWeight.Medium) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = GreenPrimary,
                                indicatorColor = GreenLight
                            ),
                            modifier = Modifier.testTag("nav_explore")
                        )

                        NavigationBarItem(
                            selected = currentNav == NavDestination.SEARCH,
                            onClick = { currentNav = NavDestination.SEARCH },
                            icon = { Icon(Icons.Default.Search, contentDescription = stringResource(R.string.nav_search)) },
                            label = { Text(stringResource(R.string.nav_search), fontSize = 10.sp, fontWeight = if (currentNav == NavDestination.SEARCH) FontWeight.Bold else FontWeight.Medium) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = GreenPrimary,
                                indicatorColor = GreenLight
                            ),
                            modifier = Modifier.testTag("nav_search")
                        )

                        NavigationBarItem(
                            selected = currentNav == NavDestination.AI_COPILOT,
                            onClick = { currentNav = NavDestination.AI_COPILOT },
                            icon = { Icon(Icons.Default.Star, contentDescription = "Gemini AI") },
                            label = { Text("Gemini AI", fontSize = 10.sp, fontWeight = if (currentNav == NavDestination.AI_COPILOT) FontWeight.Bold else FontWeight.Medium) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFF4F46E5),
                                indicatorColor = Color(0xFFEEF2FF)
                            ),
                            modifier = Modifier.testTag("nav_ai_copilot")
                        )

                        NavigationBarItem(
                            selected = currentNav == NavDestination.CART,
                            onClick = { currentNav = NavDestination.CART },
                            icon = {
                                BadgedBox(
                                    badge = {
                                        if (cartCount > 0) {
                                            Badge(containerColor = EmeraldJewel) {
                                                Text("$cartCount", color = Color.White, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.ShoppingCart, contentDescription = stringResource(R.string.nav_cart))
                                }
                            },
                            label = { Text(stringResource(R.string.nav_cart), fontSize = 10.sp, fontWeight = if (currentNav == NavDestination.CART) FontWeight.Bold else FontWeight.Medium) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = GreenPrimary,
                                indicatorColor = GreenLight
                            ),
                            modifier = Modifier.testTag("nav_cart")
                        )

                        NavigationBarItem(
                            selected = currentNav == NavDestination.ORDERS,
                            onClick = { currentNav = NavDestination.ORDERS },
                            icon = { Icon(Icons.Default.DateRange, contentDescription = stringResource(R.string.nav_orders)) },
                            label = { Text(stringResource(R.string.nav_orders), fontSize = 10.sp, fontWeight = if (currentNav == NavDestination.ORDERS) FontWeight.Bold else FontWeight.Medium) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = GreenPrimary,
                                indicatorColor = GreenLight
                            ),
                            modifier = Modifier.testTag("nav_orders")
                        )

                        NavigationBarItem(
                            selected = currentNav == NavDestination.VENDOR,
                            onClick = { currentNav = NavDestination.VENDOR },
                            icon = { Icon(Icons.Default.Star, contentDescription = stringResource(R.string.nav_vendor)) },
                            label = { Text(stringResource(R.string.nav_vendor), fontSize = 10.sp, fontWeight = if (currentNav == NavDestination.VENDOR) FontWeight.Bold else FontWeight.Medium) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = GreenPrimary,
                                indicatorColor = GreenLight
                            ),
                            modifier = Modifier.testTag("nav_vendor")
                        )
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
                        onOrderPlaced = { orderId ->
                            currentNav = NavDestination.ORDERS
                        }
                    )
                    NavDestination.ORDERS -> CustomerOrdersScreen(
                        viewModel = customerViewModel
                    )
                    NavDestination.VENDOR -> VendorDashboardScreen(
                        viewModel = vendorViewModel
                    )
                }
            }
        }
    }
}
