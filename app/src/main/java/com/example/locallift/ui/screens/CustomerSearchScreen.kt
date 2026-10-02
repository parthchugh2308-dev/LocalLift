package com.example.locallift.ui.screens

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.locallift.ui.components.CategoryIconHelper
import com.example.locallift.ui.theme.GreenDark
import com.example.locallift.ui.theme.GreenLight
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.viewmodel.CustomerViewModel
import com.example.locallift.ui.viewmodel.SearchTab

@Composable
fun CustomerSearchScreen(
    viewModel: CustomerViewModel,
    onNavigateToVendorDetail: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val searchTab by viewModel.searchTab.collectAsStateWithLifecycle()
    val filteredVendors by viewModel.filteredVendors.collectAsStateWithLifecycle()
    val filteredProducts by viewModel.filteredProducts.collectAsStateWithLifecycle()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("customer_search_screen")
    ) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { viewModel.setSearchQuery(it) },
            label = { Text("Search shops & products by name or category...") },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = null, tint = GreenPrimary)
            },
            trailingIcon = {
                if (searchQuery.isNotBlank()) {
                    IconButton(onClick = { viewModel.setSearchQuery("") }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear")
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("search_input_field")
        )

        if (searchQuery.isNotBlank()) {
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                val totalCount = filteredVendors.size + filteredProducts.size
                FilterChip(
                    selected = searchTab == SearchTab.ALL,
                    onClick = { viewModel.setSearchTab(SearchTab.ALL) },
                    label = { Text("All ($totalCount)", fontSize = 12.sp) },
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

        Spacer(modifier = Modifier.height(12.dp))

        if (searchQuery.isBlank()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Home,
                        contentDescription = null,
                        modifier = Modifier.size(56.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Search across 16 local neighborhood categories\nFind nearby bakeries, marts, tandoors, chemists & products",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 13.sp,
                        lineHeight = 18.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else if (filteredVendors.isEmpty() && filteredProducts.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = "No shops or products matching '$searchQuery'",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 14.sp
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                // Shops Section
                if (searchTab == SearchTab.ALL || searchTab == SearchTab.SHOPS) {
                    item {
                        Text(
                            text = "${filteredVendors.size} matching local shops",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    items(filteredVendors) { vDist ->
                        val v = vDist.vendor
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onNavigateToVendorDetail(v.id) },
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                AsyncImage(
                                    model = v.imageUrl,
                                    contentDescription = v.businessName,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(64.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(v.businessName, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text(v.category, fontSize = 11.sp, color = GreenPrimary, fontWeight = FontWeight.Medium)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text("📍 ${v.address}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(vDist.distanceFormatted, fontSize = 11.sp, color = GreenPrimary, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }

                // Products Section
                if (searchTab == SearchTab.ALL || searchTab == SearchTab.PRODUCTS) {
                    item {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "${filteredProducts.size} matching products",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

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
    }
}
