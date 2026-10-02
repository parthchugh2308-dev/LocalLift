package com.example.locallift.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.data.model.VendorEntity
import com.example.locallift.ui.components.CategoryIconHelper
import com.example.locallift.ui.components.HyperlocalMapCanvas
import com.example.locallift.ui.components.LocationSelectorDialog
import com.example.locallift.ui.theme.AmberAccent
import com.example.locallift.ui.theme.CardBorderLight
import com.example.locallift.ui.theme.GreenDark
import com.example.locallift.ui.theme.GreenLight
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.theme.TextureAmbientGlow
import com.example.locallift.ui.theme.TextureDotColor
import com.example.locallift.ui.viewmodel.CustomerViewModel
import com.example.locallift.ui.viewmodel.ProductWithVendor
import com.example.locallift.ui.viewmodel.SearchTab
import com.example.locallift.ui.viewmodel.VendorWithDistance

@Composable
fun CustomerExploreScreen(
    viewModel: CustomerViewModel,
    onNavigateToVendorDetail: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val location by viewModel.currentLocation.collectAsStateWithLifecycle()
    val radiusKm by viewModel.radiusKm.collectAsStateWithLifecycle()
    val selectedCategory by viewModel.selectedCategory.collectAsStateWithLifecycle()
    val vendors by viewModel.vendorsWithDistance.collectAsStateWithLifecycle()
    val offers by viewModel.offers.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val searchTab by viewModel.searchTab.collectAsStateWithLifecycle()
    val filteredVendors by viewModel.filteredVendors.collectAsStateWithLifecycle()
    val filteredProducts by viewModel.filteredProducts.collectAsStateWithLifecycle()
    val allProductsWithVendor by viewModel.allProductsWithVendor.collectAsStateWithLifecycle()

    var showLocationDialog by remember { mutableStateOf(false) }

    if (showLocationDialog) {
        LocationSelectorDialog(
            currentLocation = location,
            onDismiss = { showLocationDialog = false },
            onLocationSelected = { title, addr, lat, lon ->
                viewModel.setLocation(title, addr, lat, lon)
            }
        )
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .drawBehind {
                // Soft luminous ambient corner glows
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(TextureAmbientGlow, Color.Transparent),
                        center = Offset(size.width * 0.12f, size.height * 0.08f),
                        radius = size.width * 0.65f
                    )
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0x0AF59E0B), Color.Transparent),
                        center = Offset(size.width * 0.88f, size.height * 0.18f),
                        radius = size.width * 0.55f
                    )
                )

                // Delicate micro dot texture
                val spacing = 28.dp.toPx()
                val dotRadius = 1.dp.toPx()
                val numCols = (size.width / spacing).toInt() + 1
                val numRows = (size.height / spacing).toInt() + 1
                for (i in 0 until numCols) {
                    for (j in 0 until numRows) {
                        drawCircle(
                            color = TextureDotColor,
                            radius = dotRadius,
                            center = Offset(i * spacing, j * spacing)
                        )
                    }
                }
            }
            .testTag("customer_explore_screen"),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // Location Bar Header
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 1.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showLocationDialog = true }
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                        .testTag("location_selector_bar"),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(GreenLight, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Location",
                            tint = GreenPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = location.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Text(
                            text = location.address,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }

        // TOP HOME SCREEN SEARCH BAR (Filters local shops and products by name or category)
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { viewModel.setSearchQuery(it) },
                        placeholder = {
                            Text(
                                text = "Search shops & products by name or category...",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                            )
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
                                tint = GreenPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        },
                        trailingIcon = {
                            if (searchQuery.isNotBlank()) {
                                IconButton(
                                    onClick = { viewModel.setSearchQuery("") },
                                    modifier = Modifier.testTag("clear_home_search")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Clear,
                                        contentDescription = "Clear Search",
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GreenPrimary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.35f),
                            focusedContainerColor = MaterialTheme.colorScheme.surface,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surface
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("home_search_bar")
                    )

                    // Quick Result Tabs when search query is active
                    if (searchQuery.isNotBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            val totalMatches = filteredVendors.size + filteredProducts.size
                            FilterChip(
                                selected = searchTab == SearchTab.ALL,
                                onClick = { viewModel.setSearchTab(SearchTab.ALL) },
                                label = { Text("All ($totalMatches)", fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = GreenLight,
                                    selectedLabelColor = GreenDark
                                ),
                                modifier = Modifier.testTag("search_tab_all")
                            )

                            FilterChip(
                                selected = searchTab == SearchTab.SHOPS,
                                onClick = { viewModel.setSearchTab(SearchTab.SHOPS) },
                                label = { Text("Shops (${filteredVendors.size})", fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = GreenLight,
                                    selectedLabelColor = GreenDark
                                ),
                                modifier = Modifier.testTag("search_tab_shops")
                            )

                            FilterChip(
                                selected = searchTab == SearchTab.PRODUCTS,
                                onClick = { viewModel.setSearchTab(SearchTab.PRODUCTS) },
                                label = { Text("Products (${filteredProducts.size})", fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = GreenLight,
                                    selectedLabelColor = GreenDark
                                ),
                                modifier = Modifier.testTag("search_tab_products")
                            )
                        }
                    }
                }
            }
        }

        // CONDITIONAL CONTENT: SEARCH RESULTS VS DEFAULT DISCOVERY
        if (searchQuery.isNotBlank()) {
            // Category Filter row during search to filter by category alongside query
            item {
                Column(modifier = Modifier.padding(top = 10.dp, bottom = 4.dp)) {
                    Text(
                        text = "Refine by Category",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 2.dp)
                    )
                    Row(
                        modifier = Modifier
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CategoryIconHelper.all16Categories.forEach { cat ->
                            val isSelected = selectedCategory.equals(cat, ignoreCase = true)
                            FilterChip(
                                selected = isSelected,
                                onClick = { viewModel.selectCategory(cat) },
                                label = { Text(cat, fontSize = 12.sp) },
                                leadingIcon = if (cat != "All") {
                                    {
                                        Icon(
                                            imageVector = CategoryIconHelper.getIcon(cat),
                                            contentDescription = null,
                                            modifier = Modifier.size(14.dp),
                                            tint = if (isSelected) GreenPrimary else CategoryIconHelper.getColor(cat)
                                        )
                                    }
                                } else null,
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = GreenLight,
                                    selectedLabelColor = GreenDark
                                ),
                                modifier = Modifier.testTag("search_category_chip_${cat.replace(' ', '_')}")
                            )
                        }
                    }
                }
            }

            // Empty state if nothing matches
            if (filteredVendors.isEmpty() && filteredProducts.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                                modifier = Modifier.size(54.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No shops or products matching \"$searchQuery\"",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Try searching by shop name, category (e.g., Bakery, Pharmacy, Cafe, Grocery), or product (e.g., Cake, Bread, Rice, Paneer)",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = {
                                    viewModel.setSearchQuery("")
                                    viewModel.selectCategory("All")
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.testTag("reset_search_filters_button")
                            ) {
                                Text("Clear Search & Show All")
                            }
                        }
                    }
                }
            } else {
                // Section: Matching Local Shops
                if (searchTab == SearchTab.ALL || searchTab == SearchTab.SHOPS) {
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Matching Local Shops (${filteredVendors.size})",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    }

                    if (filteredVendors.isEmpty()) {
                        item {
                            Text(
                                text = "No shops matching \"$searchQuery\"",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                            )
                        }
                    } else {
                        items(filteredVendors) { item ->
                            VendorListItemCard(
                                vendorWithDistance = item,
                                onClick = { onNavigateToVendorDetail(item.vendor.id) }
                            )
                        }
                    }
                }

                // Section: Matching Products
                if (searchTab == SearchTab.ALL || searchTab == SearchTab.PRODUCTS) {
                    item {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Matching Products (${filteredProducts.size})",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    }

                    if (filteredProducts.isEmpty()) {
                        item {
                            Text(
                                text = "No products matching \"$searchQuery\"",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                            )
                        }
                    } else {
                        items(filteredProducts) { pWithV ->
                            ProductListItemCard(
                                productWithVendor = pWithV,
                                onProductClick = { vendorId -> onNavigateToVendorDetail(vendorId) },
                                onAddToCart = { prod, vend -> viewModel.addToCart(prod, vend) }
                            )
                        }
                    }
                }
            }
        } else {
            // DEFAULT EXPLORE VIEW (Radar, Map, Deals, Categories, Shops & Products)

            // Radar Distance Slider Section
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Place,
                                contentDescription = null,
                                tint = GreenPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Discovery Radius: ${"%.1f".format(radiusKm)} km",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp
                            )
                        }
                        val visibleCount = vendors.count { it.isWithinRadius }
                        Text(
                            text = "$visibleCount shops nearby",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = GreenPrimary
                        )
                    }

                    Slider(
                        value = radiusKm.toFloat(),
                        onValueChange = { viewModel.setRadius(it.toDouble()) },
                        valueRange = 0.5f..10.0f,
                        steps = 18,
                        colors = SliderDefaults.colors(
                            thumbColor = GreenPrimary,
                            activeTrackColor = GreenPrimary,
                            inactiveTrackColor = GreenLight
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("radius_slider")
                    )
                }
            }

            // Interactive Hyperlocal Map Canvas
            item {
                Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                    HyperlocalMapCanvas(
                        userLocation = location,
                        radiusKm = radiusKm,
                        vendors = vendors,
                        onSelectVendor = { vendorId ->
                            onNavigateToVendorDetail(vendorId)
                        }
                    )
                }
            }

            // Active Neighborhood Deals Carousel
            if (offers.isNotEmpty()) {
                item {
                    Column(modifier = Modifier.padding(top = 16.dp)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Favorite,
                                contentDescription = null,
                                tint = AmberAccent,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Active Neighborhood Deals",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(offers) { offer ->
                                DealCard(offer = offer, onVendorClick = { onNavigateToVendorDetail(offer.vendorId) })
                            }
                        }
                    }
                }
            }

            // 16 Categories Chips Filter Bar
            item {
                Column(modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)) {
                    Text(
                        text = "Shop by Category (16 Local Types)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                    )
                    Row(
                        modifier = Modifier
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CategoryIconHelper.all16Categories.forEach { cat ->
                            val isSelected = selectedCategory.equals(cat, ignoreCase = true)
                            FilterChip(
                                selected = isSelected,
                                onClick = { viewModel.selectCategory(cat) },
                                label = { Text(cat, fontSize = 12.sp) },
                                leadingIcon = if (cat != "All") {
                                    {
                                        Icon(
                                            imageVector = CategoryIconHelper.getIcon(cat),
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = if (isSelected) GreenPrimary else CategoryIconHelper.getColor(cat)
                                        )
                                    }
                                } else null,
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = GreenLight,
                                    selectedLabelColor = GreenDark
                                ),
                                modifier = Modifier.testTag("category_chip_${cat.replace(' ', '_')}")
                            )
                        }
                    }
                }
            }

            // Section Title: Verified Local Shops
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (selectedCategory == "All") "Nearby Local Shops" else "$selectedCategory Shops",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp
                    )
                    Text(
                        text = "${vendors.size} found",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Vendor Cards List
            if (vendors.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No shops found in this category within ${radiusKm}km.\nTry expanding the discovery radius!",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 14.sp
                        )
                    }
                }
            } else {
                items(vendors) { item ->
                    VendorListItemCard(
                        vendorWithDistance = item,
                        onClick = { onNavigateToVendorDetail(item.vendor.id) }
                    )
                }
            }

            // Featured Local Products Section
            val relevantProducts = if (selectedCategory == "All") {
                allProductsWithVendor.take(8)
            } else {
                allProductsWithVendor.filter {
                    it.product.category.equals(selectedCategory, ignoreCase = true) ||
                    it.vendor.category.equals(selectedCategory, ignoreCase = true)
                }
            }

            if (relevantProducts.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = null,
                                tint = GreenPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (selectedCategory == "All") "Popular Local Products" else "$selectedCategory Products",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                        Text(
                            text = "${relevantProducts.size} items",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                items(relevantProducts) { pWithV ->
                    ProductListItemCard(
                        productWithVendor = pWithV,
                        onProductClick = { vendorId -> onNavigateToVendorDetail(vendorId) },
                        onAddToCart = { prod, vend -> viewModel.addToCart(prod, vend) }
                    )
                }
            }
        }
    }
}

@Composable
fun DealCard(offer: OfferEntity, onVendorClick: () -> Unit) {
    Card(
        modifier = Modifier
            .width(260.dp)
            .clickable { onVendorClick() }
            .testTag("deal_card_${offer.id}"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFFFFBEB)
        ),
        border = BorderStroke(1.dp, Color(0xFFFDE68A)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = offer.discount,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 13.sp,
                    color = AmberAccent,
                    modifier = Modifier
                        .background(Color.White, RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
                Text(
                    text = "Limited Deal",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = AmberAccent
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = offer.title,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = offer.description,
                fontSize = 11.sp,
                color = Color(0xFF78350F),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 15.sp
            )
        }
    }
}

@Composable
fun VendorListItemCard(
    vendorWithDistance: VendorWithDistance,
    onClick: () -> Unit
) {
    val vendor = vendorWithDistance.vendor
    val catColor = CategoryIconHelper.getColor(vendor.category)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clickable { onClick() }
            .testTag("vendor_card_${vendor.id}"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.95f)
        ),
        border = BorderStroke(1.dp, CardBorderLight),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Shop Image
            Box(
                modifier = Modifier
                    .size(86.dp)
                    .clip(RoundedCornerShape(12.dp))
            ) {
                AsyncImage(
                    model = vendor.imageUrl,
                    contentDescription = vendor.businessName,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                // Category pill over image
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .background(catColor.copy(alpha = 0.9f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = vendor.category,
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Shop Details
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = vendor.businessName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .background(Color(0xFFFEF3C7), RoundedCornerShape(6.dp))
                            .padding(horizontal = 5.dp, vertical = 2.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = AmberAccent,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "%.1f".format(vendor.rating),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = Color(0xFF78350F)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(3.dp))
                Text(
                    text = vendor.address,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Distance + Time + Open Status Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Place,
                            contentDescription = null,
                            tint = GreenPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "${vendorWithDistance.distanceFormatted} • ${vendorWithDistance.timeEstimate}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = GreenPrimary
                        )
                    }

                    Box(
                        modifier = Modifier
                            .background(
                                if (vendor.isOpen) GreenLight else Color(0xFFFEE2E2),
                                RoundedCornerShape(6.dp)
                            )
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (vendor.isOpen) "OPEN" else "CLOSED",
                            color = if (vendor.isOpen) GreenDark else Color(0xFF991B1B),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProductListItemCard(
    productWithVendor: ProductWithVendor,
    onProductClick: (Long) -> Unit,
    onAddToCart: (ProductEntity, VendorEntity) -> Unit
) {
    val product = productWithVendor.product
    val vendor = productWithVendor.vendor
    var addedToCart by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clickable { onProductClick(vendor.id) }
            .testTag("product_card_${product.id}"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.95f)
        ),
        border = BorderStroke(1.dp, CardBorderLight),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product image
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(12.dp))
            ) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                // Category pill over image
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .background(
                            CategoryIconHelper.getColor(product.category).copy(alpha = 0.9f)
                        )
                        .padding(horizontal = 5.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = product.category,
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Info column
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "₹${product.price.toInt()}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 15.sp,
                        color = GreenPrimary
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "by ${vendor.businessName} • ${productWithVendor.distanceFormatted}",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.description,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 8.dp)
                    )

                    Button(
                        onClick = {
                            onAddToCart(product, vendor)
                            addedToCart = true
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (addedToCart) GreenDark else GreenPrimary
                        ),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .height(30.dp)
                            .testTag("add_to_cart_btn_${product.id}")
                    ) {
                        Icon(
                            imageVector = if (addedToCart) Icons.Default.Check else Icons.Default.Add,
                            contentDescription = if (addedToCart) "Added to Cart" else "Add to Cart",
                            tint = Color.White,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = if (addedToCart) "Added" else "Add",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
