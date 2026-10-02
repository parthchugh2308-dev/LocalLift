package com.example.locallift.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.locallift.data.model.CartItemEntity
import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.OrderEntity
import com.example.locallift.data.model.OrderItemEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.data.model.ReviewEntity
import com.example.locallift.data.model.UserEntity
import com.example.locallift.data.model.UserRole
import com.example.locallift.data.model.VendorEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LocalLiftDao {

    // ── VENDORS ──
    @Query("SELECT * FROM vendors ORDER BY id ASC")
    fun getAllVendors(): Flow<List<VendorEntity>>

    @Query("SELECT * FROM vendors WHERE id = :id LIMIT 1")
    fun getVendorById(id: Long): Flow<VendorEntity?>

    @Query("SELECT * FROM vendors WHERE id = :id LIMIT 1")
    suspend fun getVendorByIdSync(id: Long): VendorEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVendors(vendors: List<VendorEntity>)

    @Update
    suspend fun updateVendor(vendor: VendorEntity)

    @Query("UPDATE vendors SET isOpen = :isOpen WHERE id = :vendorId")
    suspend fun toggleVendorStatus(vendorId: Long, isOpen: Boolean)

    // ── PRODUCTS ──
    @Query("SELECT * FROM products WHERE vendorId = :vendorId ORDER BY id ASC")
    fun getProductsByVendor(vendorId: Long): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products ORDER BY id ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE id = :id LIMIT 1")
    fun getProductById(id: Long): Flow<ProductEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<ProductEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity): Long

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Delete
    suspend fun deleteProduct(product: ProductEntity)

    @Query("DELETE FROM products WHERE id = :productId")
    suspend fun deleteProductById(productId: Long)

    @Query("UPDATE products SET isAvailable = :isAvailable WHERE id = :productId")
    suspend fun toggleProductAvailability(productId: Long, isAvailable: Boolean)

    // ── OFFERS ──
    @Query("SELECT * FROM offers WHERE isActive = 1 ORDER BY id DESC")
    fun getAllOffers(): Flow<List<OfferEntity>>

    @Query("SELECT * FROM offers WHERE vendorId = :vendorId AND isActive = 1 ORDER BY id DESC")
    fun getOffersByVendor(vendorId: Long): Flow<List<OfferEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOffers(offers: List<OfferEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOffer(offer: OfferEntity): Long

    @Query("DELETE FROM offers WHERE id = :offerId")
    suspend fun deleteOfferById(offerId: Long)

    // ── CART ──
    @Query("SELECT * FROM cart_items ORDER BY id ASC")
    fun getCartItems(): Flow<List<CartItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCartItem(item: CartItemEntity)

    @Query("SELECT * FROM cart_items WHERE productId = :productId LIMIT 1")
    suspend fun getCartItemByProductId(productId: Long): CartItemEntity?

    @Query("UPDATE cart_items SET quantity = :quantity WHERE id = :cartItemId")
    suspend fun updateCartItemQuantity(cartItemId: Long, quantity: Int)

    @Query("DELETE FROM cart_items WHERE id = :cartItemId")
    suspend fun removeCartItem(cartItemId: Long)

    @Query("DELETE FROM cart_items")
    suspend fun clearCart()

    // ── ORDERS ──
    @Query("SELECT * FROM orders ORDER BY timestamp DESC")
    fun getAllOrders(): Flow<List<OrderEntity>>

    @Query("SELECT * FROM orders WHERE vendorId = :vendorId ORDER BY timestamp DESC")
    fun getOrdersByVendor(vendorId: Long): Flow<List<OrderEntity>>

    @Query("SELECT * FROM orders WHERE id = :orderId LIMIT 1")
    fun getOrderById(orderId: Long): Flow<OrderEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: OrderEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrderItems(items: List<OrderItemEntity>)

    @Query("SELECT * FROM order_items WHERE orderId = :orderId")
    fun getOrderItems(orderId: Long): Flow<List<OrderItemEntity>>

    @Query("UPDATE orders SET status = :status WHERE id = :orderId")
    suspend fun updateOrderStatus(orderId: Long, status: String)

    // ── REVIEWS ──
    @Query("SELECT * FROM reviews WHERE vendorId = :vendorId ORDER BY id DESC")
    fun getReviewsByVendor(vendorId: Long): Flow<List<ReviewEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReviews(reviews: List<ReviewEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReview(review: ReviewEntity)

    // ── USERS / AUTH ──
    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertUser(user: UserEntity): Long

    @Query("SELECT * FROM users WHERE email = :email LIMIT 1")
    suspend fun findUserByEmail(email: String): UserEntity?

    @Query("SELECT * FROM users WHERE id = :id LIMIT 1")
    suspend fun findUserById(id: Long): UserEntity?

    @Query("UPDATE users SET role = :role WHERE id = :userId")
    suspend fun updateUserRole(userId: Long, role: UserRole)

    @Query("UPDATE users SET linkedVendorId = :vendorId WHERE id = :userId")
    suspend fun linkUserToVendor(userId: Long, vendorId: Long)

    @Query("UPDATE users SET linkedVendorId = NULL, role = 'CUSTOMER' WHERE id = :userId")
    suspend fun unlinkUserFromVendor(userId: Long)
}
