import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CATEGORIES,
  calculateHaversineDistance,
  DEFAULT_ADDR,
  DEFAULT_LAT,
  DEFAULT_LON,
  formatDistance,
  INITIAL_OFFERS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_USERS,
  INITIAL_VENDORS
} from '../data/initialData';
import { CartItem, Offer, Order, Product, Review, User, UserRole, Vendor } from '../types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface UserLocation {
  lat: number;
  lon: number;
  address: string;
  locality: string;
  city: string;
}

interface AppContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentVendor: Vendor | null;
  setCurrentVendor: (vendor: Vendor | null) => void;
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
  vendors: Vendor[];
  nearbyVendors: Vendor[];
  products: Product[];
  offers: Offer[];
  orders: Order[];
  reviews: Review[];
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  toast: ToastState;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  addToCart: (product: Product, vendor: Vendor, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  createOrder: (orderData: {
    vendorId: number;
    items: { productId: number; productName: string; price: number; quantity: number }[];
    totalAmount: number;
    notes?: string;
    deliveryAddress?: string;
  }) => Order;
  updateOrderStatus: (orderId: number, status: Order['status']) => void;
  addProduct: (product: Omit<Product, 'product_id'>) => Product;
  updateProduct: (productId: number, product: Partial<Product>) => void;
  deleteProduct: (productId: number) => void;
  toggleProductStock: (productId: number) => void;
  addOffer: (offer: Omit<Offer, 'offer_id'>) => Offer;
  deleteOffer: (offerId: number) => void;
  addReview: (review: Omit<Review, 'review_id'>) => void;
  registerVendorApplication: (data: {
    business_name: string;
    owner_name: string;
    category: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    description: string;
  }) => Vendor;
  updateVendorStatus: (vendorId: number, status: 'approved' | 'rejected') => void;
  deleteVendor: (vendorId: number) => void;
  updateVendorDetails: (vendorId: number, updates: Partial<Vendor>) => void;
  synthesizeCatalogAI: (
    shopName: string,
    category: string,
    location: string,
    apiKey?: string
  ) => Promise<{ products: { name: string; price: number; description: string }[]; special_offer: { title: string; discount: string; description: string } }>;
  reverseGeocode: (lat: number, lon: number) => Promise<{ address: string; locality: string; city: string }>;
  geocodeQuery: (query: string) => Promise<{ lat: number; lon: number; address: string } | null>;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role
  const [activeRole, setActiveRole] = useState<UserRole>('customer');

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('locallift_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default logged in as demo customer
  });

  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(() => {
    const saved = localStorage.getItem('locallift_active_vendor');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS[0]; // Default Sharma Bakery
  });

  // Location
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('locallift_location');
    return saved
      ? JSON.parse(saved)
      : {
          lat: DEFAULT_LAT,
          lon: DEFAULT_LON,
          address: DEFAULT_ADDR,
          locality: 'Model Town',
          city: 'Ludhiana'
        };
  });

  // Core Data Stores with localStorage persistence
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('locallift_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('locallift_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('locallift_offers');
    return saved ? JSON.parse(saved) : INITIAL_OFFERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('locallift_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('locallift_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('locallift_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('locallift_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('locallift_active_vendor', JSON.stringify(currentVendor));
  }, [currentVendor]);

  useEffect(() => {
    localStorage.setItem('locallift_location', JSON.stringify(userLocation));
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem('locallift_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('locallift_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('locallift_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('locallift_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('locallift_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('locallift_cart', JSON.stringify(cart));
  }, [cart]);

  // Dynamically calculate nearby vendors with Haversine distance from current userLocation
  const nearbyVendors = React.useMemo(() => {
    const approved = vendors.filter(v => v.status === 'approved');
    return approved
      .map(v => {
        const distKm = calculateHaversineDistance(userLocation.lat, userLocation.lon, v.latitude, v.longitude);
        const { formatted, timeEstimate, distM } = formatDistance(distKm);
        return {
          ...v,
          distance_km: distKm,
          distance_m: distM,
          distance_formatted: formatted,
          time_estimate: timeEstimate
        };
      })
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }, [vendors, userLocation]);

  // Cart operations
  const addToCart = (product: Product, vendor: Vendor, quantity = 1) => {
    setCart(prev => {
      // Check if item belongs to different vendor
      const differentVendor = prev.find(item => item.vendor.vendor_id !== vendor.vendor_id);
      if (differentVendor) {
        showToast(`Your cart was reset because items must be from the same local vendor (${vendor.business_name})`, 'info');
        return [{ product, vendor, quantity }];
      }

      const existingIndex = prev.findIndex(item => item.product.product_id === product.product_id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [...prev, { product, vendor, quantity }];
      }
    });
    showToast(`Added ${product.product_name} to cart!`, 'success');
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.product_id !== productId));
  };

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.product_id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Orders
  const createOrder = (orderData: {
    vendorId: number;
    items: { productId: number; productName: string; price: number; quantity: number }[];
    totalAmount: number;
    notes?: string;
    deliveryAddress?: string;
  }): Order => {
    const newOrderId = Math.floor(1000 + Math.random() * 9000);
    const vendor = vendors.find(v => v.vendor_id === orderData.vendorId);
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      order_id: newOrderId,
      user_id: currentUser ? currentUser.user_id : 1,
      customer_name: currentUser ? currentUser.name : 'Guest Customer',
      customer_phone: currentUser?.phone || '9876543210',
      vendor_id: orderData.vendorId,
      business_name: vendor ? vendor.business_name : 'Local Shop',
      total_amount: orderData.totalAmount,
      status: 'pending',
      notes: orderData.notes || '',
      delivery_address: orderData.deliveryAddress || userLocation.address,
      created_at: timeStr,
      items: orderData.items.map((it, idx) => ({
        order_item_id: newOrderId * 10 + idx,
        order_id: newOrderId,
        product_id: it.productId,
        product_name: it.productName,
        price: it.price,
        quantity: it.quantity
      }))
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast(`Order #${newOrderId} placed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: number, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => (o.order_id === orderId ? { ...o, status } : o))
    );
    showToast(`Order #${orderId} marked as ${status.toUpperCase()}`, 'info');
  };

  // Products
  const addProduct = (productData: Omit<Product, 'product_id'>): Product => {
    const newId = Math.floor(2000 + Math.random() * 8000);
    const newProduct: Product = {
      ...productData,
      product_id: newId
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Added ${newProduct.product_name} to catalog!`, 'success');
    return newProduct;
  };

  const updateProduct = (productId: number, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.product_id === productId ? { ...p, ...updates } : p))
    );
    showToast('Product updated successfully', 'success');
  };

  const deleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.product_id !== productId));
    showToast('Product removed from catalog', 'info');
  };

  const toggleProductStock = (productId: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.product_id === productId) {
          const nextStock = p.availability === 1 ? 0 : 1;
          showToast(`${p.product_name} is now ${nextStock === 1 ? 'In Stock' : 'Out of Stock'}`, 'info');
          return { ...p, availability: nextStock };
        }
        return p;
      })
    );
  };

  // Offers
  const addOffer = (offerData: Omit<Offer, 'offer_id'>): Offer => {
    const newId = Math.floor(100 + Math.random() * 900);
    const vendor = vendors.find(v => v.vendor_id === offerData.vendor_id);
    const newOffer: Offer = {
      ...offerData,
      offer_id: newId,
      business_name: vendor?.business_name || 'Local Shop'
    };
    setOffers(prev => [newOffer, ...prev]);
    showToast(`Promotional deal "${newOffer.title}" launched!`, 'success');
    return newOffer;
  };

  const deleteOffer = (offerId: number) => {
    setOffers(prev => prev.filter(o => o.offer_id !== offerId));
    showToast('Promotional deal deleted', 'info');
  };

  // Reviews
  const addReview = (reviewData: Omit<Review, 'review_id'>) => {
    const newReview: Review = {
      ...reviewData,
      review_id: Math.floor(500 + Math.random() * 5000),
      created_at: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
    showToast('Thank you for your review!', 'success');
  };

  // Vendor Registration & Approval Governance
  const registerVendorApplication = (data: {
    business_name: string;
    owner_name: string;
    category: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    description: string;
  }): Vendor => {
    const newVid = Math.floor(100 + Math.random() * 900);
    const catMeta = CATEGORIES[data.category] || CATEGORIES['Grocery'];

    // Randomize slight offset near user location
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lonOffset = (Math.random() - 0.5) * 0.015;

    const newVendor: Vendor = {
      vendor_id: newVid,
      business_name: data.business_name,
      owner_name: data.owner_name,
      category: data.category,
      address: data.address,
      city: data.city || 'Ludhiana',
      latitude: Number((userLocation.lat + latOffset).toFixed(6)),
      longitude: Number((userLocation.lon + lonOffset).toFixed(6)),
      phone: data.phone,
      email: data.email,
      opening_hours: '8:00 AM',
      closing_time: '9:30 PM',
      rating: 4.8,
      description: data.description || `Authentic ${data.category.toLowerCase()} store registered with LocalLift.`,
      image: catMeta.image,
      is_open: true,
      status: 'pending' // Enforces admin approval workflow
    };

    // Prepopulate 3 starter items for the vendor
    const starterItems: Product[] = catMeta.items.slice(0, 3).map((it, idx) => ({
      product_id: newVid * 100 + idx + 1,
      vendor_id: newVid,
      product_name: it.name,
      category: data.category,
      price: it.price,
      image: it.img,
      availability: 1,
      description: it.desc
    }));

    setVendors(prev => [newVendor, ...prev]);
    setProducts(prev => [...prev, ...starterItems]);
    showToast('Vendor registration submitted! Pending Admin approval.', 'success');
    return newVendor;
  };

  const updateVendorStatus = (vendorId: number, status: 'approved' | 'rejected') => {
    setVendors(prev =>
      prev.map(v => (v.vendor_id === vendorId ? { ...v, status } : v))
    );
    showToast(`Vendor #${vendorId} has been ${status.toUpperCase()}!`, status === 'approved' ? 'success' : 'info');
  };

  const deleteVendor = (vendorId: number) => {
    setVendors(prev => prev.filter(v => v.vendor_id !== vendorId));
    setProducts(prev => prev.filter(p => p.vendor_id !== vendorId));
    setOffers(prev => prev.filter(o => o.vendor_id !== vendorId));
    showToast(`Vendor #${vendorId} removed from platform`, 'info');
  };

  const updateVendorDetails = (vendorId: number, updates: Partial<Vendor>) => {
    setVendors(prev =>
      prev.map(v => (v.vendor_id === vendorId ? { ...v, ...updates } : v))
    );
    if (currentVendor && currentVendor.vendor_id === vendorId) {
      setCurrentVendor(prev => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Store settings updated!', 'success');
  };

  // Google Gemini AI Catalog Generator with authentic fallback
  const synthesizeCatalogAI = async (
    shopName: string,
    category: string,
    location: string,
    apiKey?: string
  ): Promise<{ products: { name: string; price: number; description: string }[]; special_offer: { title: string; discount: string; description: string } }> => {
    // If Gemini API key is provided, attempt call to Google Gemini 2.5 Flash
    if (apiKey) {
      try {
        const prompt = `You are an expert retail AI for LocalLift hyperlocal marketplace.
Generate a realistic 4-item product menu and 1 promotional offer for this small Indian neighborhood shop:
Shop Name: ${shopName}
Category: ${category}
Location: ${location}

Respond strictly with valid JSON with this exact schema:
{
  "products": [
    {"name": "string", "price": number_in_inr, "description": "string"}
  ],
  "special_offer": {"title": "string", "discount": "string", "description": "string"}
}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: 'application/json' }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent fallback:', err);
      }
    }

    // High quality contextual retail AI synthesizer fallback
    const catMeta = CATEGORIES[category] || CATEGORIES['Grocery'];
    const sampleItems = catMeta.items.slice(0, 4).map(item => ({
      name: `${shopName}'s ${item.name}`,
      price: item.price,
      description: item.desc
    }));

    return {
      products: sampleItems,
      special_offer: {
        title: `Exclusive ${category} Inaugural Deal`,
        discount: '15% OFF',
        description: `Get flat 15% discount on all orders above ₹299 at ${shopName}, ${location}.`
      }
    };
  };

  // Reverse geocoding via OpenStreetMap Nominatim with safe fallback
  const reverseGeocode = async (lat: number, lon: number): Promise<{ address: string; locality: string; city: string }> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'LocalLiftPlatform-React/3.0' }
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.neighbourhood || addr.suburb || addr.hamlet || 'Main Market';
        const city = addr.city || addr.town || addr.village || addr.county || 'Local City';
        const locality = road || addr.suburb || city;
        const fullAddress = data.display_name?.split(',').slice(0, 3).join(', ') || `${road}, ${city}`;
        return { address: fullAddress, locality, city };
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode note:', e);
    }
    return {
      address: `Sector 14, Near Main Chowk, ${userLocation.city}`,
      locality: 'Main Market',
      city: userLocation.city
    };
  };

  // Forward geocoding query search via Nominatim
  const geocodeQuery = async (query: string): Promise<{ lat: number; lon: number; address: string } | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'LocalLiftPlatform-React/3.0' }
      });
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          return {
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            address: item.display_name?.split(',').slice(0, 3).join(', ') || query
          };
        }
      }
    } catch (e) {
      console.warn('Nominatim forward search note:', e);
    }
    return null;
  };

  // Reset to demo defaults
  const resetDemoData = () => {
    localStorage.removeItem('locallift_vendors');
    localStorage.removeItem('locallift_products');
    localStorage.removeItem('locallift_offers');
    localStorage.removeItem('locallift_orders');
    localStorage.removeItem('locallift_reviews');
    localStorage.removeItem('locallift_cart');
    localStorage.removeItem('locallift_location');
    setVendors(INITIAL_VENDORS);
    setProducts(INITIAL_PRODUCTS);
    setOffers(INITIAL_OFFERS);
    setOrders(INITIAL_ORDERS);
    setReviews(INITIAL_REVIEWS);
    setCart([]);
    setUserLocation({
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
      address: DEFAULT_ADDR,
      locality: 'Model Town',
      city: 'Ludhiana'
    });
    showToast('Platform data reset to default demo values!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        setCurrentUser,
        currentVendor,
        setCurrentVendor,
        userLocation,
        setUserLocation,
        vendors,
        nearbyVendors,
        products,
        offers,
        orders,
        reviews,
        cart,
        cartTotal,
        cartItemCount,
        toast,
        showToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        addOffer,
        deleteOffer,
        addReview,
        registerVendorApplication,
        updateVendorStatus,
        deleteVendor,
        updateVendorDetails,
        synthesizeCatalogAI,
        reverseGeocode,
        geocodeQuery,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
