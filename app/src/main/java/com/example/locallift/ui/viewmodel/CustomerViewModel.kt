package com.example.locallift.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locallift.data.model.CartItemEntity
import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.OrderEntity
import com.example.locallift.data.model.OrderItemEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.data.model.ReviewEntity
import com.example.locallift.data.model.VendorEntity
import com.example.locallift.data.repository.LocalLiftRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlin.math.max

data class VendorWithDistance(
    val vendor: VendorEntity,
    val distanceKm: Double,
    val distanceFormatted: String,
    val timeEstimate: String,
    val isWithinRadius: Boolean
)

data class ProductWithVendor(
    val product: ProductEntity,
    val vendor: VendorEntity,
    val distanceKm: Double,
    val distanceFormatted: String
)

enum class SearchTab {
    ALL,
    SHOPS,
    PRODUCTS
}

data class LocationInfo(
    val title: String,
    val address: String,
    val latitude: Double,
    val longitude: Double
)

class CustomerViewModel(private val repository: LocalLiftRepository) : ViewModel() {

    init {
        viewModelScope.launch {
            repository.ensureInitialData()
        }
    }

    private val _currentLocation = MutableStateFlow(
        LocationInfo(
            title = "Connaught Place / Main Market",
            address = "Central Square, Block B",
            latitude = 28.6328,
            longitude = 77.2197
        )
    )
    val currentLocation: StateFlow<LocationInfo> = _currentLocation.asStateFlow()

    private val _radiusKm = MutableStateFlow(2.5)
    val radiusKm: StateFlow<Double> = _radiusKm.asStateFlow()

    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _searchTab = MutableStateFlow(SearchTab.ALL)
    val searchTab: StateFlow<SearchTab> = _searchTab.asStateFlow()

    private val _selectedVendorId = MutableStateFlow<Long?>(null)
    val selectedVendorId: StateFlow<Long?> = _selectedVendorId.asStateFlow()

    // Enriched vendors with distance
    val vendorsWithDistance: StateFlow<List<VendorWithDistance>> = combine(
        repository.allVendors,
        _currentLocation,
        _radiusKm,
        _selectedCategory
    ) { vendors, location, radius, category ->
        vendors.map { v ->
            val dist = repository.calculateDistanceKm(
                location.latitude,
                location.longitude,
                v.latitude,
                v.longitude
            )
            val distFormatted = if (dist < 1.0) {
                "${(dist * 1000).toInt()} m away"
            } else {
                "%.1f km away".format(dist)
            }
            val time = if (dist < 1.0) {
                "${max(1, (dist * 1000 / 75).toInt())} min walk"
            } else {
                "${max(2, (dist * 2.5).toInt())} min drive"
            }
            VendorWithDistance(
                vendor = v,
                distanceKm = dist,
                distanceFormatted = distFormatted,
                timeEstimate = time,
                isWithinRadius = dist <= radius
            )
        }.filter {
            if (category == "All") true else it.vendor.category.equals(category, ignoreCase = true)
        }.sortedBy { it.distanceKm }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // All products enriched with vendor and distance
    val allProductsWithVendor: StateFlow<List<ProductWithVendor>> = combine(
        repository.getAllProducts(),
        repository.allVendors,
        _currentLocation
    ) { products, vendors, location ->
        val vendorMap = vendors.associateBy { it.id }
        products.mapNotNull { prod ->
            val v = vendorMap[prod.vendorId] ?: return@mapNotNull null
            val dist = repository.calculateDistanceKm(
                location.latitude,
                location.longitude,
                v.latitude,
                v.longitude
            )
            val distFormatted = if (dist < 1.0) {
                "${(dist * 1000).toInt()} m away"
            } else {
                "%.1f km away".format(dist)
            }
            ProductWithVendor(
                product = prod,
                vendor = v,
                distanceKm = dist,
                distanceFormatted = distFormatted
            )
        }.sortedBy { it.distanceKm }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filtered vendors by name or category AND search query
    val filteredVendors: StateFlow<List<VendorWithDistance>> = combine(
        vendorsWithDistance,
        repository.getAllProducts(),
        _searchQuery
    ) { vList, products, query ->
        val trimmed = query.trim()
        if (trimmed.isBlank()) {
            vList
        } else {
            val vendorIdsWithMatchingProducts = products.filter { prod ->
                prod.name.contains(trimmed, ignoreCase = true) ||
                prod.category.contains(trimmed, ignoreCase = true) ||
                prod.description.contains(trimmed, ignoreCase = true)
            }.map { it.vendorId }.toSet()

            vList.filter { item ->
                val v = item.vendor
                v.businessName.contains(trimmed, ignoreCase = true) ||
                v.category.contains(trimmed, ignoreCase = true) ||
                v.description.contains(trimmed, ignoreCase = true) ||
                v.address.contains(trimmed, ignoreCase = true) ||
                vendorIdsWithMatchingProducts.contains(v.id)
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filtered products by name or category AND search query
    val filteredProducts: StateFlow<List<ProductWithVendor>> = combine(
        allProductsWithVendor,
        _searchQuery,
        _selectedCategory
    ) { pList, query, cat ->
        val trimmed = query.trim()
        pList.filter { pWithV ->
            val prod = pWithV.product
            val v = pWithV.vendor
            val categoryMatches = if (cat == "All") {
                true
            } else {
                prod.category.equals(cat, ignoreCase = true) || v.category.equals(cat, ignoreCase = true)
            }
            val queryMatches = if (trimmed.isBlank()) {
                true
            } else {
                prod.name.contains(trimmed, ignoreCase = true) ||
                prod.category.contains(trimmed, ignoreCase = true) ||
                prod.description.contains(trimmed, ignoreCase = true) ||
                v.businessName.contains(trimmed, ignoreCase = true) ||
                v.category.contains(trimmed, ignoreCase = true)
            }
            categoryMatches && queryMatches
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // All active offers
    val offers: StateFlow<List<OfferEntity>> = repository.allOffers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Cart items
    val cartItems: StateFlow<List<CartItemEntity>> = repository.cartItems
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val cartTotal: StateFlow<Double> = combine(repository.cartItems) { items ->
        items[0].sumOf { it.price * it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    // Orders
    val orders: StateFlow<List<OrderEntity>> = repository.allOrders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Vendor detail streams
    val selectedVendor: StateFlow<VendorEntity?> = combine(
        repository.allVendors,
        _selectedVendorId
    ) { vendors, id ->
        id?.let { vId -> vendors.find { it.id == vId } }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val selectedVendorProducts: StateFlow<List<ProductEntity>> = combine(
        repository.getAllProducts(),
        _selectedVendorId
    ) { products, id ->
        if (id == null) emptyList() else products.filter { it.vendorId == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val selectedVendorOffers: StateFlow<List<OfferEntity>> = combine(
        repository.allOffers,
        _selectedVendorId
    ) { offers, id ->
        if (id == null) emptyList() else offers.filter { it.vendorId == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setLocation(title: String, address: String, lat: Double, lon: Double) {
        _currentLocation.value = LocationInfo(title, address, lat, lon)
    }

    fun setRadius(radius: Double) {
        _radiusKm.value = radius
    }

    fun selectCategory(cat: String) {
        _selectedCategory.value = cat
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setSearchTab(tab: SearchTab) {
        _searchTab.value = tab
    }

    fun selectVendor(vendorId: Long?) {
        _selectedVendorId.value = vendorId
    }

    fun addToCart(product: ProductEntity, vendor: VendorEntity) {
        viewModelScope.launch {
            repository.addToCart(product, vendor)
        }
    }

    fun updateCartQuantity(cartItemId: Long, newQuantity: Int) {
        viewModelScope.launch {
            repository.updateCartQuantity(cartItemId, newQuantity)
        }
    }

    fun clearCart() {
        viewModelScope.launch {
            repository.clearCart()
        }
    }

    fun placeOrder(
        vendorId: Long,
        vendorName: String,
        items: List<CartItemEntity>,
        address: String,
        notes: String,
        paymentMethod: String,
        onSuccess: (Long) -> Unit
    ) {
        viewModelScope.launch {
            val orderId = repository.placeOrder(
                vendorId = vendorId,
                vendorName = vendorName,
                items = items,
                deliveryAddress = address,
                notes = notes,
                paymentMethod = paymentMethod
            )
            onSuccess(orderId)
        }
    }

    fun getOrderItems(orderId: Long): StateFlow<List<OrderItemEntity>> =
        repository.getOrderItems(orderId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun getVendorReviews(vendorId: Long): StateFlow<List<ReviewEntity>> =
        repository.getReviewsByVendor(vendorId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
