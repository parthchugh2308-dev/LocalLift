package com.example.locallift.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.OrderEntity
import com.example.locallift.data.model.OrderItemEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.data.model.VendorEntity
import com.example.locallift.data.repository.GeneratedCatalog
import com.example.locallift.data.repository.LocalLiftRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class VendorStats(
    val totalProducts: Int,
    val totalOrders: Int,
    val activeOrders: Int,
    val revenue: Double,
    val activeOffers: Int,
    val rating: Double
)

class VendorViewModel(private val repository: LocalLiftRepository) : ViewModel() {

    private val _currentVendorId = MutableStateFlow(1L)
    val currentVendorId: StateFlow<Long> = _currentVendorId.asStateFlow()

    val allVendors: StateFlow<List<VendorEntity>> = repository.allVendors
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val currentVendor: StateFlow<VendorEntity?> = combine(
        repository.allVendors,
        _currentVendorId
    ) { vendors, id ->
        vendors.find { it.id == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val products: StateFlow<List<ProductEntity>> = combine(
        repository.getAllProducts(),
        _currentVendorId
    ) { allProds, id ->
        allProds.filter { it.vendorId == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val offers: StateFlow<List<OfferEntity>> = combine(
        repository.allOffers,
        _currentVendorId
    ) { allOffers, id ->
        allOffers.filter { it.vendorId == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val orders: StateFlow<List<OrderEntity>> = combine(
        repository.allOrders,
        _currentVendorId
    ) { allOrders, id ->
        allOrders.filter { it.vendorId == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val stats: StateFlow<VendorStats> = combine(
        products,
        orders,
        offers,
        currentVendor
    ) { prods, ords, offs, vendor ->
        val activeOrds = ords.count { it.status.equals("Pending", ignoreCase = true) || it.status.equals("Confirmed", ignoreCase = true) || it.status.equals("Preparing", ignoreCase = true) }
        val rev = ords.filter { !it.status.equals("Cancelled", ignoreCase = true) }.sumOf { it.totalAmount }
        VendorStats(
            totalProducts = prods.size,
            totalOrders = ords.size,
            activeOrders = activeOrds,
            revenue = rev,
            activeOffers = offs.size,
            rating = vendor?.rating ?: 4.7
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        VendorStats(0, 0, 0, 0.0, 0, 4.7)
    )

    // AI Generation State
    private val _isGeneratingAi = MutableStateFlow(false)
    val isGeneratingAi: StateFlow<Boolean> = _isGeneratingAi.asStateFlow()

    private val _generatedCatalog = MutableStateFlow<GeneratedCatalog?>(null)
    val generatedCatalog: StateFlow<GeneratedCatalog?> = _generatedCatalog.asStateFlow()

    fun switchVendor(vendorId: Long) {
        _currentVendorId.value = vendorId
    }

    fun toggleShopOpen(isOpen: Boolean) {
        viewModelScope.launch {
            repository.toggleVendorStatus(_currentVendorId.value, isOpen)
        }
    }

    fun addProduct(name: String, category: String, price: Double, desc: String, imageUrl: String) {
        viewModelScope.launch {
            val img = if (imageUrl.isBlank()) {
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&fit=crop"
            } else imageUrl
            repository.addProduct(
                ProductEntity(
                    vendorId = _currentVendorId.value,
                    name = name,
                    category = category,
                    price = price,
                    description = desc,
                    imageUrl = img,
                    isAvailable = true
                )
            )
        }
    }

    fun updateProduct(product: ProductEntity) {
        viewModelScope.launch {
            repository.updateProduct(product)
        }
    }

    fun deleteProduct(productId: Long) {
        viewModelScope.launch {
            repository.deleteProductById(productId)
        }
    }

    fun toggleProductStock(productId: Long, currentStock: Boolean) {
        viewModelScope.launch {
            repository.toggleProductAvailability(productId, !currentStock)
        }
    }

    fun addOffer(title: String, discount: String, description: String) {
        viewModelScope.launch {
            repository.addOffer(
                OfferEntity(
                    vendorId = _currentVendorId.value,
                    title = title,
                    discount = discount,
                    description = description
                )
            )
        }
    }

    fun deleteOffer(offerId: Long) {
        viewModelScope.launch {
            repository.deleteOfferById(offerId)
        }
    }

    fun updateOrderStatus(orderId: Long, newStatus: String) {
        viewModelScope.launch {
            repository.updateOrderStatus(orderId, newStatus)
        }
    }

    fun getOrderItems(orderId: Long): StateFlow<List<OrderItemEntity>> =
        repository.getOrderItems(orderId)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun generateAiCatalog() {
        val vendor = currentVendor.value ?: return
        viewModelScope.launch {
            _isGeneratingAi.value = true
            val catalog = repository.synthesizeCatalogWithAi(
                shopName = vendor.businessName,
                category = vendor.category,
                location = vendor.address
            )
            _generatedCatalog.value = catalog
            _isGeneratingAi.value = false
        }
    }

    fun dismissGeneratedCatalog() {
        _generatedCatalog.value = null
    }

    fun applyGeneratedCatalog() {
        val catalog = _generatedCatalog.value ?: return
        val vendor = currentVendor.value ?: return
        viewModelScope.launch {
            for (p in catalog.products) {
                repository.addProduct(
                    ProductEntity(
                        vendorId = vendor.id,
                        name = p.name,
                        category = vendor.category,
                        price = p.price,
                        description = p.description,
                        imageUrl = vendor.imageUrl,
                        isAvailable = true
                    )
                )
            }
            repository.addOffer(
                OfferEntity(
                    vendorId = vendor.id,
                    title = catalog.specialOffer.title,
                    discount = catalog.specialOffer.discount,
                    description = catalog.specialOffer.description
                )
            )
            _generatedCatalog.value = null
        }
    }
}
