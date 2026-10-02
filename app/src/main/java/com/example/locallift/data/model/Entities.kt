package com.example.locallift.data.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "vendors")
data class VendorEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val businessName: String,
    val ownerName: String,
    val category: String,
    val address: String,
    val city: String = "Local Market",
    val latitude: Double,
    val longitude: Double,
    val phone: String,
    val email: String = "",
    val openingHours: String = "8:00 AM",
    val closingTime: String = "10:00 PM",
    val rating: Double = 4.7,
    val description: String,
    val imageUrl: String,
    val isOpen: Boolean = true
)

@Entity(
    tableName = "products",
    foreignKeys = [
        ForeignKey(
            entity = VendorEntity::class,
            parentColumns = ["id"],
            childColumns = ["vendorId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["vendorId"])]
)
data class ProductEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val vendorId: Long,
    val name: String,
    val category: String,
    val price: Double,
    val description: String,
    val imageUrl: String,
    val isAvailable: Boolean = true
)

@Entity(
    tableName = "offers",
    foreignKeys = [
        ForeignKey(
            entity = VendorEntity::class,
            parentColumns = ["id"],
            childColumns = ["vendorId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["vendorId"])]
)
data class OfferEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val vendorId: Long,
    val title: String,
    val discount: String,
    val description: String,
    val validUntil: String = "2026-12-31",
    val isActive: Boolean = true
)

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val vendorId: Long,
    val vendorName: String,
    val totalAmount: Double,
    val status: String = "Pending", // Pending, Confirmed, Preparing, Delivered, Cancelled
    val notes: String = "",
    val deliveryAddress: String = "Current Location",
    val paymentMethod: String = "Cash on Delivery",
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "order_items",
    foreignKeys = [
        ForeignKey(
            entity = OrderEntity::class,
            parentColumns = ["id"],
            childColumns = ["orderId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["orderId"])]
)
data class OrderItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val orderId: Long,
    val productId: Long,
    val productName: String,
    val quantity: Int,
    val price: Double
)

@Entity(tableName = "cart_items")
data class CartItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: Long,
    val vendorId: Long,
    val vendorName: String,
    val productName: String,
    val price: Double,
    val quantity: Int = 1,
    val imageUrl: String
)

@Entity(tableName = "reviews")
data class ReviewEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val vendorId: Long,
    val userName: String,
    val rating: Int,
    val comment: String,
    val date: String = "Recently"
)
