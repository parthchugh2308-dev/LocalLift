package com.example.locallift.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

object CategoryIconHelper {

    val all16Categories = listOf(
        "All",
        "Bakery",
        "Grocery",
        "Restaurant",
        "Pharmacy",
        "Clothing",
        "Electronics",
        "Stationery",
        "Beauty",
        "Hardware",
        "Fruits & Vegetables",
        "Footwear",
        "Flowers",
        "Pet Supplies",
        "Home Services",
        "Dairy & Sweets",
        "Cafe & Snacks"
    )

    fun getIcon(category: String): ImageVector {
        return when (category.lowercase()) {
            "bakery" -> Icons.Default.ShoppingCart
            "grocery" -> Icons.Default.ShoppingCart
            "restaurant" -> Icons.Default.Star
            "pharmacy" -> Icons.Default.Add
            "clothing" -> Icons.Default.Favorite
            "electronics" -> Icons.Default.Phone
            "stationery" -> Icons.Default.Edit
            "beauty" -> Icons.Default.Star
            "hardware" -> Icons.Default.Build
            "fruits & vegetables" -> Icons.Default.ShoppingCart
            "footwear" -> Icons.Default.Place
            "flowers" -> Icons.Default.Favorite
            "pet supplies" -> Icons.Default.Favorite
            "home services" -> Icons.Default.Home
            "dairy & sweets" -> Icons.Default.Star
            "cafe & snacks" -> Icons.Default.Star
            else -> Icons.Default.ShoppingCart
        }
    }

    fun getColor(category: String): Color {
        return when (category.lowercase()) {
            "bakery" -> Color(0xFFD97706)
            "grocery" -> Color(0xFF16A34A)
            "restaurant" -> Color(0xFFE11D48)
            "pharmacy" -> Color(0xFF0284C7)
            "clothing" -> Color(0xFFDB2777)
            "electronics" -> Color(0xFF0D9488)
            "stationery" -> Color(0xFF4F46E5)
            "beauty" -> Color(0xFFC026D3)
            "hardware" -> Color(0xFF78716C)
            "fruits & vegetables" -> Color(0xFF65A30D)
            "footwear" -> Color(0xFF059669)
            "flowers" -> Color(0xFFF43F5E)
            "pet supplies" -> Color(0xFFEA580C)
            "home services" -> Color(0xFF0284C7)
            "dairy & sweets" -> Color(0xFFCA8A04)
            "cafe & snacks" -> Color(0xFF7C3AED)
            else -> Color(0xFF15803D)
        }
    }
}
