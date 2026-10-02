package com.example.locallift.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.locallift.data.model.CartItemEntity
import com.example.locallift.ui.theme.GreenDark
import com.example.locallift.ui.theme.GreenLight
import com.example.locallift.ui.theme.GreenPrimary
import com.example.locallift.ui.viewmodel.CustomerViewModel

@Composable
fun CustomerCartScreen(
    viewModel: CustomerViewModel,
    onOrderPlaced: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val cartItems by viewModel.cartItems.collectAsStateWithLifecycle()
    val cartTotal by viewModel.cartTotal.collectAsStateWithLifecycle()
    val currentLocation by viewModel.currentLocation.collectAsStateWithLifecycle()

    var deliveryAddress by remember(currentLocation) {
        mutableStateOf("${currentLocation.title}, ${currentLocation.address}")
    }
    var notes by remember { mutableStateOf("") }
    var paymentMethod by remember { mutableStateOf("Cash on Delivery") }

    val deliveryFee = if (cartTotal > 200.0) 0.0 else 25.0
    val grandTotal = cartTotal + deliveryFee

    if (cartItems.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(24.dp)
                .testTag("empty_cart_view"),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    imageVector = Icons.Default.ShoppingCart,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Your Cart is Empty",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Explore neighborhood shops and add delicious items or groceries to your cart.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        }
        return
    }

    val primaryVendorId = cartItems.first().vendorId
    val primaryVendorName = cartItems.first().vendorName

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("customer_cart_screen"),
        contentPadding = PaddingValues(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Cart (${cartItems.sumOf { it.quantity }} items)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Home, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Ordering from $primaryVendorName",
                            fontSize = 12.sp,
                            color = GreenPrimary,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                TextButton(
                    onClick = { viewModel.clearCart() },
                    modifier = Modifier.testTag("btn_clear_cart")
                ) {
                    Text("Clear All", color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Cart items
        items(cartItems) { item ->
            CartItemRow(
                item = item,
                onIncrement = { viewModel.updateCartQuantity(item.id, item.quantity + 1) },
                onDecrement = { viewModel.updateCartQuantity(item.id, item.quantity - 1) },
                onRemove = { viewModel.updateCartQuantity(item.id, 0) }
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Delivery Address & Notes Section
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("Delivery Details", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = deliveryAddress,
                        onValueChange = { deliveryAddress = it },
                        label = { Text("Delivery Address") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_delivery_address"),
                        singleLine = false,
                        maxLines = 2
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Delivery Instructions / Notes (Optional)") },
                        placeholder = { Text("e.g. Ring the bell twice, leave with guard") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_delivery_notes"),
                        singleLine = true
                    )
                }
            }
        }

        // Payment Method
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("Payment Method", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(6.dp))

                    val methods = listOf("Cash on Delivery", "UPI / Digital")
                    methods.forEach { method ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp)
                        ) {
                            RadioButton(
                                selected = (paymentMethod == method),
                                onClick = { paymentMethod = method },
                                colors = RadioButtonDefaults.colors(selectedColor = GreenPrimary)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(method, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Bill Summary
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("Bill Summary", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Item Total", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("₹${cartTotal.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Neighborhood Delivery Fee", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            if (deliveryFee == 0.0) "FREE" else "₹${deliveryFee.toInt()}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (deliveryFee == 0.0) GreenPrimary else MaterialTheme.colorScheme.onSurface
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("To Pay", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("₹${grandTotal.toInt()}", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = GreenPrimary)
                    }
                }
            }
        }

        // Checkout Action Button
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    viewModel.placeOrder(
                        vendorId = primaryVendorId,
                        vendorName = primaryVendorName,
                        items = cartItems,
                        address = deliveryAddress,
                        notes = notes,
                        paymentMethod = paymentMethod,
                        onSuccess = { orderId ->
                            onOrderPlaced(orderId)
                        }
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_place_order"),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
            ) {
                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Place Order • ₹${grandTotal.toInt()}", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItemEntity,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("cart_item_${item.id}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = item.imageUrl,
                contentDescription = item.productName,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(8.dp))
            )
            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(item.productName, fontWeight = FontWeight.Bold, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text("₹${item.price.toInt()} each", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .background(GreenLight, RoundedCornerShape(8.dp))
                    .padding(horizontal = 4.dp, vertical = 2.dp)
            ) {
                IconButton(onClick = onDecrement, modifier = Modifier.size(26.dp)) {
                    Text("-", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = GreenDark)
                }
                Text("${item.quantity}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = GreenDark, modifier = Modifier.padding(horizontal = 4.dp))
                IconButton(onClick = onIncrement, modifier = Modifier.size(26.dp)) {
                    Text("+", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = GreenDark)
                }
            }

            Spacer(modifier = Modifier.width(4.dp))
            IconButton(onClick = onRemove, modifier = Modifier.size(28.dp)) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
            }
        }
    }
}
