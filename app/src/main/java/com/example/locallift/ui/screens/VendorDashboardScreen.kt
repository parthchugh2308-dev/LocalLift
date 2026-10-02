package com.example.locallift.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.OrderEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.ui.components.AiCatalogGeneratorDialog
import com.example.locallift.data.model.UserEntity
import com.example.locallift.ui.theme.AmberAccent
import com.example.locallift.ui.theme.GreenDark
import com.example.locallift.ui.theme.GreenLight
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.viewmodel.VendorViewModel

@Composable
fun VendorDashboardScreen(
    viewModel: VendorViewModel,
    currentUser: UserEntity? = null,
    onSwitchToCustomer: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val currentVendor by viewModel.currentVendor.collectAsStateWithLifecycle()
    val allVendors by viewModel.allVendors.collectAsStateWithLifecycle()
    val stats by viewModel.stats.collectAsStateWithLifecycle()
    val products by viewModel.products.collectAsStateWithLifecycle()
    val orders by viewModel.orders.collectAsStateWithLifecycle()
    val offers by viewModel.offers.collectAsStateWithLifecycle()
    val isGeneratingAi by viewModel.isGeneratingAi.collectAsStateWithLifecycle()
    val generatedCatalog by viewModel.generatedCatalog.collectAsStateWithLifecycle()

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var showAddProductDialog by remember { mutableStateOf(false) }
    var showAddOfferDialog by remember { mutableStateOf(false) }
    var showSwitchVendorMenu by remember { mutableStateOf(false) }

    // AI Catalog Dialog
    if (generatedCatalog != null) {
        AiCatalogGeneratorDialog(
            catalog = generatedCatalog!!,
            onDismiss = { viewModel.dismissGeneratedCatalog() },
            onApply = { viewModel.applyGeneratedCatalog() }
        )
    }

    if (showAddProductDialog) {
        AddProductDialog(
            defaultCategory = currentVendor?.category ?: "Grocery",
            onDismiss = { showAddProductDialog = false },
            onAdd = { name, cat, price, desc, img ->
                viewModel.addProduct(name, cat, price, desc, img)
                showAddProductDialog = false
            }
        )
    }

    if (showAddOfferDialog) {
        AddOfferDialog(
            onDismiss = { showAddOfferDialog = false },
            onAdd = { title, disc, desc ->
                viewModel.addOffer(title, disc, desc)
                showAddOfferDialog = false
            }
        )
    }

    Scaffold(
        floatingActionButton = {
            if (selectedTabIndex == 0) {
                FloatingActionButton(
                    onClick = { showAddProductDialog = true },
                    containerColor = GreenPrimary,
                    contentColor = Color.White,
                    modifier = Modifier
                        .padding(bottom = 72.dp)
                        .testTag("fab_add_product")
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Product")
                }
            } else if (selectedTabIndex == 2) {
                FloatingActionButton(
                    onClick = { showAddOfferDialog = true },
                    containerColor = AmberAccent,
                    contentColor = Color.White,
                    modifier = Modifier
                        .padding(bottom = 72.dp)
                        .testTag("fab_add_offer")
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Offer")
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .testTag("vendor_dashboard_screen"),
            contentPadding = PaddingValues(16.dp)
        ) {
            // Header with Shop Name, Switch Shop, and Open/Closed Toggle
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Vendor Portal", fontSize = 12.sp, color = GreenPrimary, fontWeight = FontWeight.Bold)
                                Text(
                                    text = currentVendor?.businessName ?: "Sharma Bakery",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "Owner: ${currentVendor?.ownerName ?: "Rajesh Sharma"} • ${currentVendor?.category ?: "Bakery"}",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            // Switch Shop Button
                            Box {
                                OutlinedButton(
                                    onClick = { showSwitchVendorMenu = true },
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.testTag("btn_switch_vendor")
                                ) {
                                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Switch", fontSize = 11.sp)
                                }
                                DropdownMenu(
                                    expanded = showSwitchVendorMenu,
                                    onDismissRequest = { showSwitchVendorMenu = false }
                                ) {
                                    allVendors.forEach { v ->
                                        DropdownMenuItem(
                                            text = { Text("${v.businessName} (${v.category})", fontSize = 13.sp) },
                                            onClick = {
                                                viewModel.switchVendor(v.id)
                                                showSwitchVendorMenu = false
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                        // Open / Closed Status Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .background(
                                            if (currentVendor?.isOpen == true) GreenPrimary else Color(0xFFEF4444),
                                            CircleShape
                                        )
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (currentVendor?.isOpen == true) "Shop is OPEN for orders" else "Shop is currently CLOSED",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp,
                                    color = if (currentVendor?.isOpen == true) GreenDark else Color(0xFF991B1B)
                                )
                            }
                            Switch(
                                checked = currentVendor?.isOpen ?: true,
                                onCheckedChange = { viewModel.toggleShopOpen(it) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = GreenPrimary,
                                    checkedTrackColor = GreenLight
                                ),
                                modifier = Modifier.testTag("switch_shop_open_toggle")
                            )
                        }
                    }
                }
            }

            // Real-Time Stats Grid
            item {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatCard(title = "Products", value = "${stats.totalProducts}", modifier = Modifier.weight(1f))
                    StatCard(title = "Active Orders", value = "${stats.activeOrders}", modifier = Modifier.weight(1f), highlight = true)
                    StatCard(title = "Revenue", value = "₹${stats.revenue.toInt()}", modifier = Modifier.weight(1f))
                    StatCard(title = "Rating", value = "★ ${"%.1f".format(stats.rating)}", modifier = Modifier.weight(1f))
                }
            }

            // Google Gemini AI Catalog Generator Banner
            item {
                Spacer(modifier = Modifier.height(12.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF1E293B)
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .background(Color(0xFF334155), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    tint = AmberAccent,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Google Gemini Retail AI", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.White)
                                Text("Generate 4 products + deal tailored for this shop", fontSize = 11.sp, color = Color(0xFF94A3B8))
                            }
                        }
                        Button(
                            onClick = { viewModel.generateAiCatalog() },
                            enabled = !isGeneratingAi,
                            colors = ButtonDefaults.buttonColors(containerColor = AmberAccent),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            modifier = Modifier.testTag("btn_trigger_ai_catalog")
                        ) {
                            if (isGeneratingAi) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp)
                            } else {
                                Text("Generate", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.White)
                            }
                        }
                    }
                }
            }

            // Tabs: Products | Orders | Deals
            item {
                Spacer(modifier = Modifier.height(16.dp))
                TabRow(
                    selectedTabIndex = selectedTabIndex,
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = GreenPrimary
                ) {
                    Tab(
                        selected = selectedTabIndex == 0,
                        onClick = { selectedTabIndex = 0 },
                        text = { Text("Products (${products.size})", fontSize = 13.sp, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.testTag("tab_vendor_products")
                    )
                    Tab(
                        selected = selectedTabIndex == 1,
                        onClick = { selectedTabIndex = 1 },
                        text = { Text("Orders (${orders.size})", fontSize = 13.sp, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.testTag("tab_vendor_orders")
                    )
                    Tab(
                        selected = selectedTabIndex == 2,
                        onClick = { selectedTabIndex = 2 },
                        text = { Text("Deals (${offers.size})", fontSize = 13.sp, fontWeight = FontWeight.Bold) },
                        modifier = Modifier.testTag("tab_vendor_offers")
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Tab 0: Products Management
            if (selectedTabIndex == 0) {
                if (products.isEmpty()) {
                    item {
                        Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("No products in catalog yet. Tap '+' or 'Generate' above!", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                } else {
                    items(products) { prod ->
                        VendorProductRow(
                            product = prod,
                            onToggleStock = { viewModel.toggleProductStock(prod.id, prod.isAvailable) },
                            onDelete = { viewModel.deleteProduct(prod.id) }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }

            // Tab 1: Orders Management
            if (selectedTabIndex == 1) {
                if (orders.isEmpty()) {
                    item {
                        Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("No orders received yet.", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                } else {
                    items(orders) { ord ->
                        VendorOrderRow(
                            order = ord,
                            viewModel = viewModel,
                            onStatusChange = { newStatus -> viewModel.updateOrderStatus(ord.id, newStatus) }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }

            // Tab 2: Deals Management
            if (selectedTabIndex == 2) {
                if (offers.isEmpty()) {
                    item {
                        Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("No active promotional deals. Tap '+' to create one!", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                } else {
                    items(offers) { offer ->
                        VendorOfferRow(
                            offer = offer,
                            onDelete = { viewModel.deleteOffer(offer.id) }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, modifier: Modifier = Modifier, highlight: Boolean = false) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (highlight) GreenLight else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 10.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(title, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                value,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = if (highlight) GreenDark else MaterialTheme.colorScheme.onSurface,
                maxLines = 1
            )
        }
    }
}

@Composable
fun VendorProductRow(
    product: ProductEntity,
    onToggleStock: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth().testTag("vendor_product_${product.id}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(54.dp).clip(RoundedCornerShape(8.dp))
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(product.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text("₹${product.price.toInt()} • ${product.category}", fontSize = 11.sp, color = GreenPrimary, fontWeight = FontWeight.SemiBold)
                Text(product.description, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Spacer(modifier = Modifier.width(6.dp))

            // In Stock Toggle Button
            OutlinedButton(
                onClick = onToggleStock,
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                modifier = Modifier.height(30.dp)
            ) {
                Text(
                    text = if (product.isAvailable) "In Stock" else "Out of Stock",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (product.isAvailable) GreenDark else Color(0xFF991B1B)
                )
            }

            IconButton(onClick = onDelete, modifier = Modifier.size(30.dp)) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@Composable
fun VendorOrderRow(
    order: OrderEntity,
    viewModel: VendorViewModel,
    onStatusChange: (String) -> Unit
) {
    val items by viewModel.getOrderItems(order.id).collectAsStateWithLifecycle()

    Card(
        modifier = Modifier.fillMaxWidth().testTag("vendor_order_${order.id}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Order #${order.id}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Box(
                    modifier = Modifier
                        .background(GreenLight, RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(order.status.uppercase(), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GreenDark)
                }
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text("Total: ₹${order.totalAmount.toInt()} • Pay: ${order.paymentMethod}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Text("Deliver to: ${order.deliveryAddress}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

            if (items.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Items: " + items.joinToString { "${it.quantity}x ${it.productName}" },
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Action Workflow Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                when (order.status.lowercase()) {
                    "pending" -> {
                        OutlinedButton(
                            onClick = { onStatusChange("Cancelled") },
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("Reject", fontSize = 11.sp, color = MaterialTheme.colorScheme.error)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onStatusChange("Confirmed") },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("Confirm", fontSize = 11.sp)
                        }
                    }
                    "confirmed" -> {
                        Button(
                            onClick = { onStatusChange("Preparing") },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AmberAccent),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("Mark Preparing / Ready", fontSize = 11.sp)
                        }
                    }
                    "preparing", "ready" -> {
                        Button(
                            onClick = { onStatusChange("Delivered") },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("Mark Delivered", fontSize = 11.sp)
                        }
                    }
                    else -> {
                        Text("Completed", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
fun VendorOfferRow(offer: OfferEntity, onDelete: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().testTag("vendor_offer_${offer.id}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Star, contentDescription = null, tint = AmberAccent, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(offer.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF78350F))
                    Text(offer.discount, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp, color = AmberAccent)
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(offer.description, fontSize = 11.sp, color = Color(0xFF78350F))
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Delete, contentDescription = "Delete Offer", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
fun AddProductDialog(
    defaultCategory: String,
    onDismiss: () -> Unit,
    onAdd: (String, String, Double, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var category by remember { mutableStateOf(defaultCategory) }
    var priceStr by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var imgUrl by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add New Product", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Product Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("input_new_prod_name")
                )
                OutlinedTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = { Text("Category") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = priceStr,
                    onValueChange = { priceStr = it },
                    label = { Text("Price (₹)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("input_new_prod_price")
                )
                OutlinedTextField(
                    value = desc,
                    onValueChange = { desc = it },
                    label = { Text("Description") },
                    maxLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = imgUrl,
                    onValueChange = { imgUrl = it },
                    label = { Text("Image URL (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val p = priceStr.toDoubleOrNull() ?: 100.0
                    if (name.isNotBlank()) {
                        onAdd(name, category, p, desc, imgUrl)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                modifier = Modifier.testTag("btn_confirm_add_product")
            ) {
                Text("Add to Shop")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
fun AddOfferDialog(
    onDismiss: () -> Unit,
    onAdd: (String, String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var discount by remember { mutableStateOf("15% OFF") }
    var desc by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Promotional Deal", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Deal Title") },
                    placeholder = { Text("e.g. Weekend Flat 20% OFF") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("input_new_offer_title")
                )
                OutlinedTextField(
                    value = discount,
                    onValueChange = { discount = it },
                    label = { Text("Discount Tag") },
                    placeholder = { Text("e.g. 20% OFF / B2G1 FREE") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("input_new_offer_discount")
                )
                OutlinedTextField(
                    value = desc,
                    onValueChange = { desc = it },
                    label = { Text("Offer Terms / Description") },
                    maxLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        onAdd(title, discount, desc)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = AmberAccent),
                modifier = Modifier.testTag("btn_confirm_add_offer")
            ) {
                Text("Publish Deal")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
