package com.example.locallift.data.repository

import com.example.locallift.BuildConfig
import com.example.locallift.data.InitialDataSeeder
import com.example.locallift.data.dao.LocalLiftDao
import com.example.locallift.data.model.CartItemEntity
import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.OrderEntity
import com.example.locallift.data.model.OrderItemEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.data.model.ReviewEntity
import com.example.locallift.data.model.VendorEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

data class GeneratedCatalog(
    val products: List<GeneratedProduct>,
    val specialOffer: GeneratedOffer
)

data class GeneratedProduct(
    val name: String,
    val price: Double,
    val description: String
)

data class GeneratedOffer(
    val title: String,
    val discount: String,
    val description: String
)

class LocalLiftRepository(private val dao: LocalLiftDao) {

    val allVendors: Flow<List<VendorEntity>> = dao.getAllVendors()
    val allOffers: Flow<List<OfferEntity>> = dao.getAllOffers()
    val allOrders: Flow<List<OrderEntity>> = dao.getAllOrders()
    val cartItems: Flow<List<CartItemEntity>> = dao.getCartItems()

    suspend fun ensureInitialData() {
        withContext(Dispatchers.IO) {
            val vendors = dao.getAllVendors().firstOrNull()
            if (vendors.isNullOrEmpty()) {
                dao.insertVendors(InitialDataSeeder.getInitialVendors())
                dao.insertProducts(InitialDataSeeder.getInitialProducts())
                dao.insertOffers(InitialDataSeeder.getInitialOffers())
                dao.insertReviews(InitialDataSeeder.getInitialReviews())
                for (order in InitialDataSeeder.getInitialOrders()) {
                    dao.insertOrder(order)
                }
                dao.insertOrderItems(InitialDataSeeder.getInitialOrderItems())
            }
        }
    }

    fun getVendorById(vendorId: Long): Flow<VendorEntity?> = dao.getVendorById(vendorId)

    fun getProductsByVendor(vendorId: Long): Flow<List<ProductEntity>> =
        dao.getProductsByVendor(vendorId)

    fun getAllProducts(): Flow<List<ProductEntity>> = dao.getAllProducts()

    fun getOffersByVendor(vendorId: Long): Flow<List<OfferEntity>> =
        dao.getOffersByVendor(vendorId)

    fun getReviewsByVendor(vendorId: Long): Flow<List<ReviewEntity>> =
        dao.getReviewsByVendor(vendorId)

    fun getOrdersByVendor(vendorId: Long): Flow<List<OrderEntity>> =
        dao.getOrdersByVendor(vendorId)

    fun getOrderItems(orderId: Long): Flow<List<OrderItemEntity>> =
        dao.getOrderItems(orderId)

    suspend fun toggleVendorStatus(vendorId: Long, isOpen: Boolean) {
        withContext(Dispatchers.IO) {
            dao.toggleVendorStatus(vendorId, isOpen)
        }
    }

    suspend fun addProduct(product: ProductEntity): Long = withContext(Dispatchers.IO) {
        dao.insertProduct(product)
    }

    suspend fun updateProduct(product: ProductEntity) = withContext(Dispatchers.IO) {
        dao.updateProduct(product)
    }

    suspend fun deleteProductById(productId: Long) = withContext(Dispatchers.IO) {
        dao.deleteProductById(productId)
    }

    suspend fun toggleProductAvailability(productId: Long, isAvailable: Boolean) =
        withContext(Dispatchers.IO) {
            dao.toggleProductAvailability(productId, isAvailable)
        }

    suspend fun addOffer(offer: OfferEntity): Long = withContext(Dispatchers.IO) {
        dao.insertOffer(offer)
    }

    suspend fun deleteOfferById(offerId: Long) = withContext(Dispatchers.IO) {
        dao.deleteOfferById(offerId)
    }

    suspend fun updateOrderStatus(orderId: Long, newStatus: String) = withContext(Dispatchers.IO) {
        dao.updateOrderStatus(orderId, newStatus)
    }

    // ── Cart Operations ──
    suspend fun addToCart(product: ProductEntity, vendor: VendorEntity) = withContext(Dispatchers.IO) {
        val existing = dao.getCartItemByProductId(product.id)
        if (existing != null) {
            dao.updateCartItemQuantity(existing.id, existing.quantity + 1)
        } else {
            dao.insertCartItem(
                CartItemEntity(
                    productId = product.id,
                    vendorId = vendor.id,
                    vendorName = vendor.businessName,
                    productName = product.name,
                    price = product.price,
                    quantity = 1,
                    imageUrl = product.imageUrl
                )
            )
        }
    }

    suspend fun updateCartQuantity(cartItemId: Long, newQuantity: Int) = withContext(Dispatchers.IO) {
        if (newQuantity <= 0) {
            dao.removeCartItem(cartItemId)
        } else {
            dao.updateCartItemQuantity(cartItemId, newQuantity)
        }
    }

    suspend fun removeCartItem(cartItemId: Long) = withContext(Dispatchers.IO) {
        dao.removeCartItem(cartItemId)
    }

    suspend fun clearCart() = withContext(Dispatchers.IO) {
        dao.clearCart()
    }

    suspend fun placeOrder(
        vendorId: Long,
        vendorName: String,
        items: List<CartItemEntity>,
        deliveryAddress: String,
        notes: String,
        paymentMethod: String
    ): Long = withContext(Dispatchers.IO) {
        val total = items.sumOf { it.price * it.quantity }
        val orderId = dao.insertOrder(
            OrderEntity(
                vendorId = vendorId,
                vendorName = vendorName,
                totalAmount = total,
                status = "Pending",
                notes = notes,
                deliveryAddress = deliveryAddress,
                paymentMethod = paymentMethod
            )
        )

        val orderItems = items.map { item ->
            OrderItemEntity(
                orderId = orderId,
                productId = item.productId,
                productName = item.productName,
                quantity = item.quantity,
                price = item.price
            )
        }
        dao.insertOrderItems(orderItems)
        dao.clearCart()
        orderId
    }

    // ── Distance calculations ──
    fun calculateDistanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val r = 6371.0 // Earth radius in km
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return (r * c * 100.0).roundToInt() / 100.0
    }

    // ── AI Catalog Synthesizer ──
    suspend fun synthesizeCatalogWithAi(
        shopName: String,
        category: String,
        location: String
    ): GeneratedCatalog = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isNotBlank()) {
            try {
                val prompt = """
                    You are a retail expert for LocalLift hyperlocal marketplace.
                    Generate a realistic 4-item product menu and 1 promotional offer for this local neighborhood shop:
                    Shop: $shopName
                    Category: $category
                    Location: $location
                    Respond strictly with valid JSON with this exact schema:
                    {
                      "products": [
                        {"name": "string", "price": 100.0, "description": "string"}
                      ],
                      "special_offer": {"title": "string", "discount": "string", "description": "string"}
                    }
                """.trimIndent()

                val urlStr = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey"
                val connection = (URL(urlStr).openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                    connectTimeout = 8000
                    readTimeout = 8000
                }

                val body = JSONObject().apply {
                    put("contents", org.json.JSONArray().put(
                        JSONObject().put("parts", org.json.JSONArray().put(
                            JSONObject().put("text", prompt)
                        ))
                    ))
                    put("generationConfig", JSONObject().put("response_mime_type", "application/json"))
                }

                OutputStreamWriter(connection.outputStream).use { it.write(body.toString()) }

                if (connection.responseCode == 200) {
                    val resp = BufferedReader(InputStreamReader(connection.inputStream)).use { it.readText() }
                    val json = JSONObject(resp)
                    val text = json.getJSONArray("candidates")
                        .getJSONObject(0)
                        .getJSONObject("content")
                        .getJSONArray("parts")
                        .getJSONObject(0)
                        .getString("text")

                    val parsed = JSONObject(text)
                    val prodsArray = parsed.getJSONArray("products")
                    val productsList = mutableListOf<GeneratedProduct>()
                    for (i in 0 until prodsArray.length()) {
                        val p = prodsArray.getJSONObject(i)
                        productsList.add(
                            GeneratedProduct(
                                name = p.optString("name", "Product ${i + 1}"),
                                price = p.optDouble("price", 150.0),
                                description = p.optString("description", "Fresh local quality item")
                            )
                        )
                    }
                    val off = parsed.getJSONObject("special_offer")
                    return@withContext GeneratedCatalog(
                        products = productsList,
                        specialOffer = GeneratedOffer(
                            title = off.optString("title", "Special Neighborhood Deal"),
                            discount = off.optString("discount", "15% OFF"),
                            description = off.optString("description", "Flat discount on orders above ₹300")
                        )
                    )
                }
            } catch (e: Exception) {
                // Graceful fallback to domain synthesizer
            }
        }

        // Built-in intelligent contextual domain generator
        return@withContext getContextualCatalog(shopName, category)
    }

    private fun getContextualCatalog(shopName: String, category: String): GeneratedCatalog {
        val (prods, offer) = when (category.lowercase()) {
            "bakery" -> Pair(
                listOf(
                    GeneratedProduct("Artisan Blueberry Cheesecake (500g)", 420.0, "Decadent cream cheese on buttery biscuit crust"),
                    GeneratedProduct("Herb & Garlic Baguette (2 Pcs)", 95.0, "Fresh baked French baguette with oregano garlic butter"),
                    GeneratedProduct("Almond Croissant Deluxe", 110.0, "Golden flaky layers filled with sweet almond frangipane"),
                    GeneratedProduct("Rich Chocolate Brownie Box", 160.0, "Fudgy Belgian chocolate walnut brownies")
                ),
                GeneratedOffer("Tea Time Delights - 20% OFF", "20% OFF", "Enjoy 20% off all pastries and breads every evening at $shopName.")
            )
            "restaurant", "cafe & snacks" -> Pair(
                listOf(
                    GeneratedProduct("Signature Dum Biryani Special", 260.0, "Slow-cooked fragrant basmati rice with aromatic spices & raita"),
                    GeneratedProduct("Paneer Tikka Roll / Wrap", 130.0, "Grilled cottage cheese cubes wrapped in flaky paratha"),
                    GeneratedProduct("Crispy Kulhad Chai Combo", 75.0, "Special spiced milk tea in clay pot with butter bun maska"),
                    GeneratedProduct("Loaded Peri-Peri French Fries", 120.0, "Crispy golden potato fries topped with melted mozzarella")
                ),
                GeneratedOffer("Chef's Table Special", "15% OFF", "Flat 15% discount on all main course orders above ₹399.")
            )
            "pharmacy" -> Pair(
                listOf(
                    GeneratedProduct("Daily Vitamin C + Zinc (30 Tabs)", 195.0, "Immune system support chewable tablets"),
                    GeneratedProduct("Digital Thermometer Quick Read", 249.0, "Accurate fast 10-second body temperature scanner"),
                    GeneratedProduct("Antiseptic First Aid Bandage Kit", 85.0, "Assorted waterproof adhesive bandages"),
                    GeneratedProduct("Ayurvedic Herbal Cough Lozenges", 60.0, "Natural honey and tulsi throat soothing drops")
                ),
                GeneratedOffer("Wellness Neighborhood Care", "10% OFF", "10% instant discount on health monitors and supplements at $shopName.")
            )
            else -> Pair(
                listOf(
                    GeneratedProduct("Premium Organic Pulses & Dal (1kg)", 140.0, "Unpolished farm fresh protein-rich lentils"),
                    GeneratedProduct("Pure Cold-Pressed Mustard Oil (1L)", 175.0, "Traditional wooden kachi ghani unrefined oil"),
                    GeneratedProduct("Aromatic Spice Masala Box", 90.0, "Hand-ground authentic roasted spice blend"),
                    GeneratedProduct("Stone-Ground Multigrain Flour (5kg)", 265.0, "High fiber wholesome blend of wheat, ragi, and oats")
                ),
                GeneratedOffer("Neighborhood Super Saver", "₹75 OFF", "Save ₹75 on monthly household grocery orders above ₹600 at $shopName.")
            )
        }
        return GeneratedCatalog(products = prods, specialOffer = offer)
    }
}
