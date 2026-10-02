# 🌿 LocalLift — Hyperlocal Marketplace Platform
### *"Discover Local. Support Local. Grow Together."*

---

## 📌 One-Line Pitch

**LocalLift** is an AI-powered, GPS-first Progressive Web App (PWA) that connects everyday customers with verified neighborhood businesses — bakeries, grocery stores, pharmacies, and 13 more categories — in real-time, without charging vendors predatory commissions.

---

## 🧩 Problem Statement

Every day, millions of small Indian shop owners — the kirana store owner, the local bakery uncle, the neighborhood pharmacy — lose customers to giant e-commerce platforms like Swiggy, Zomato, Amazon, and Blinkit.

These platforms:
- Charge **25–35% commission** per order from small vendors
- Show **distant, irrelevant** results to customers
- Make it **impossible** for a new local shop to get discovered
- Require vendors to have **technical knowledge** to onboard

Meanwhile, the customer who lives **200 meters** away from a fresh bakery is ordering from a dark kitchen 8 km away, paying more, waiting longer, and getting lower quality.

**The result?** Local economies collapse. Community bonds break. Money flows out of neighborhoods into corporate pockets.

---

## 💡 Our Solution

**LocalLift** is a hyperlocal digital marketplace where:

- **Customers** open the app, share their GPS location, and instantly see every verified local shop within 500m–10km sorted by walking distance
- **Vendors** get a free digital storefront, order management dashboard, and AI-powered tools — with zero commission
- **Communities** keep money local, support familiar faces, and get faster deliveries

---

## 🎯 Design Thinking Journey

### 🔍 Empathize
We interviewed 12 local shop owners and 30 customers in our neighborhood. Key findings:
- 9/12 vendors said they had **no online presence** and didn't know how to create one
- 23/30 customers said they **didn't know** there was a fresh bakery or dairy within 500m of them
- 100% of vendors said they **cannot afford** Zomato/Swiggy commissions

### 🎯 Define
**Core Problem Statement:**
*"Local shop owners lack digital visibility tools, and customers have no way to discover verified hyperlocal businesses near them — so money exits the community."*

### 💭 Ideate
We brainstormed 40+ solutions. Voted and shortlisted:
- GPS-first discovery (not city-level, but street-level)
- Zero-commission vendor model
- Mobile-first PWA (no app store needed)
- AI tools to help vendors go digital instantly

### 🛠️ Prototype → LocalLift
Built a fully functional web application in two weeks with real GPS data, live shop discovery, cart + order flow, and a vendor dashboard.

### 🧪 Test
- Deployed live via Cloudflare tunnel
- Tested with real GPS coordinates across 3 Indian cities
- Verified live shop data from OpenStreetMap (Ludhiana → 31 shops, Delhi → 23 shops)
- Fixed 15 bugs based on real user testing

---

## ✨ Core Features

### 👥 Customer Side

| Feature | Description |
|---------|-------------|
| 📍 **GPS Location** | High-accuracy hardware GPS with draggable map pin confirmation |
| 🗺️ **Google Maps Tiles** | Real Google Maps look with street-level detail |
| 🏪 **Live Shop Discovery** | Real shops from OpenStreetMap Nominatim — different shops per city |
| 16 **Categories** | Bakery, Grocery, Restaurant, Pharmacy, Clothing, Electronics, Stationery, Beauty, Hardware, Fruits & Veg, Footwear, Flowers, Pet Supplies, Home Services, Dairy & Sweets, Cafe & Snacks |
| 📏 **Distance Filter** | 500m / 1km / 2km / 5km / 10km chips with auto-expansion |
| 🔍 **Smart Search** | Search by shop name, product name, or category |
| 🛒 **Cart & Checkout** | Multi-item cart, quantity controls, order notes, Pay on Delivery/UPI |
| 📦 **Order History** | All orders saved locally with status tracking |
| 🏷️ **Live Offers** | Real-time promotional deals from local vendors |
| 📱 **PWA Installable** | Install on Android/iOS home screen like a native app |
| 🔐 **Auth Options** | Phone OTP, Email/Password, or Google Sign-in |

### 🏪 Vendor Side

| Feature | Description |
|---------|-------------|
| 📊 **Live Dashboard** | Total products, orders, active offers, rating at a glance |
| 🟢 **Shop Status Toggle** | Open/Closed switch visible to customers in real-time |
| 📦 **Product Catalog** | Add, edit, delete products with image, price, category, description |
| 🔄 **Stock Toggle** | Mark products In Stock / Out of Stock instantly |
| 🛍️ **Order Management** | Accept, Confirm, Mark Ready, Mark Delivered, Reject orders |
| 🏷️ **Promotions** | Create discount deals (% off, flat off, BOGO) with validity dates |
| 🤖 **AI Catalog Generator** | Google Gemini AI auto-generates 4 realistic products + 1 offer |
| ⚙️ **Store Settings** | Edit shop name, address, owner name, phone number |

---

## 🤖 AI Integration (Google AI Studio / Gemini API)

LocalLift is powered by **Google Gemini 2.5 Flash** for intelligent vendor tools:

### 1. AI Catalog Generator
- Vendor enters shop name + category + location
- Gemini AI generates 4 realistic, market-appropriate products with names, prices (in INR), and descriptions
- Also generates 1 promotional offer tailored to the shop
- Falls back to smart template system if API key not provided

### 2. Smart Product Descriptions (built-in)
- Every synthesized product has a professionally written description
- Category-specific, authentic to Indian market pricing

### 3. Planned AI Features (next phase)
- **Shopping Chatbot** — Natural language shop discovery
- **Voice Search** — Speak in Hindi/English to find shops
- **Daily Business Summary** — AI-generated vendor insights
- **Smart Pricing Suggester** — AI recommends product prices
- **Review Summarizer** — AI condenses reviews into key points

---

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CUSTOMER PWA                      │
│         Alpine.js + Tailwind CSS + Leaflet.js        │
│              Google Maps Tile Layer                   │
└────────────────────┬───────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────┐
│                  FLASK BACKEND                       │
│                   Python 3.14                        │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Geo Engine   │  │ Gemini AI    │                 │
│  │ Nominatim    │  │ REST Client  │                 │
│  │ + Haversine  │  │              │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │            SQLite Database                    │   │
│  │  Users / Vendors / Products / Orders /        │   │
│  │  Order_Items / Offers / Reviews / Cart        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                     │
         ┌──────────▼──────────┐
         │  OpenStreetMap API  │
         │  (Nominatim)        │
         │  Live POI Discovery  │
         └─────────────────────┘
```

### How Live Shop Discovery Works
1. User grants GPS → Device returns `lat, lon` (e.g. `30.8971, 75.8528`)
2. Backend calls Nominatim reverse geocode → gets road, suburb, city name
3. Backend searches Nominatim for 6 shop types within bounding box
4. Real shops found (e.g. *Janta Bakery, Ludhiana*) are returned
5. Missing categories filled with authentic locality-named synthetic shops
6. All sorted by **Haversine great-circle distance** (nearest first)
7. Result cached for 15 minutes per coordinate to respect API rate limits

---

## 📂 File Structure

```
locallift/
│
├── app.py                    # Flask app — all 22 API routes
│   ├── fetch_live_internet_vendors()   # Core geo-discovery engine
│   ├── CATEGORY_METADATA{}             # 16 categories with items + images
│   ├── OSM_KEYWORD_MAP{}               # Maps OSM types to our categories
│   └── /api/ai/synthesize-catalog      # Gemini AI endpoint
│
├── init_db.py                # Database schema + sample data seeder
│
├── templates/
│   ├── customer.html         # 1900+ lines — complete customer PWA
│   │   ├── Screen 1: Splash
│   │   ├── Screen 2: Login (OTP / Email / Google)
│   │   ├── Screen 3: Location Permission
│   │   ├── Screen 4: Map Pin Confirmation
│   │   └── Screen 5: Main App
│   │       ├── Home Tab (Offers, Categories, Shops)
│   │       ├── Explore Tab (Search + Filter)
│   │       ├── Map Tab (All vendors on map)
│   │       ├── Orders Tab (Order history)
│   │       ├── Profile Tab
│   │       ├── Shop Profile Modal
│   │       ├── Cart Drawer
│   │       └── Order Success Modal
│   │
│   └── vendor.html           # 700+ lines — vendor dashboard PWA
│       ├── Login Screen
│       ├── Tab 1: Dashboard (stats + recent orders)
│       ├── Tab 2: Products (CRUD + AI generator)
│       ├── Tab 3: Orders (workflow management)
│       ├── Tab 4: Promotions (deals creator)
│       └── Tab 5: Store Settings
│
├── static/
│   ├── manifest.json         # PWA installation manifest
│   └── sw.js                 # Service Worker (offline support)
│
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

### Customer APIs
```
GET  /api/vendors/nearby?lat=X&lon=Y&radius=2
     Returns vendors sorted by distance with distance_km, time_estimate

GET  /api/vendors/<id>?lat=X&lon=Y
     Full vendor details + products + offers + reviews

GET  /api/offers
     All active promotional deals across the platform

GET  /api/search?q=query&lat=X&lon=Y
     Search vendors + products by keyword

POST /api/orders
     Place order {user_id, vendor_id, total_amount, items[], notes}

POST /api/auth/login
POST /api/auth/register
POST /api/auth/phone-login
```

### Vendor APIs
```
GET  /api/vendors/<id>/dashboard
     Stats, products, orders, offers for vendor dashboard

POST   /api/products
PUT    /api/products/<id>
DELETE /api/products/<id>
PATCH  /api/products/<id>/toggle   Toggle stock status

PATCH  /api/orders/<id>/status     Update order status

POST   /api/offers
DELETE /api/offers/<id>

POST   /api/ai/synthesize-catalog  Gemini AI product generator
```

---

## 📊 Database Schema

```sql
Users        (user_id, name, email, phone, password_hash, user_type)
Vendors      (vendor_id, owner_user_id, business_name, category,
              address, city, latitude, longitude, phone, rating, is_open)
Products     (product_id, vendor_id, product_name, category,
              price, image, availability, description)
Orders       (order_id, user_id, vendor_id, total_amount, status, notes)
Order_Items  (order_item_id, order_id, product_id, quantity, price)
Offers       (offer_id, vendor_id, title, discount, description,
              start_date, end_date, status)
Reviews      (review_id, user_id, vendor_id, rating, comment)
Cart         (cart_id, user_id, product_id, vendor_id, quantity)
```

---

## 🔢 Key Technical Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | 3,000+ |
| API Endpoints | 22 routes |
| Product Categories | 16 |
| Products in Catalog | 50+ items across categories |
| Geo Cache Duration | 15 minutes per coordinate |
| GPS Accuracy | ±5–30m (hardware GPS) |
| Max Search Radius | 10 km |
| Supported Cities | Any city worldwide (OpenStreetMap) |
| PWA Manifest | Installable on Android & iOS |
| Service Worker | Offline splash screen |

---

## 🏆 LocalLift vs Competition

| | LocalLift | Swiggy/Zomato | Google Maps |
|--|-----------|---------------|-------------|
| Commission | ✅ Zero | ❌ 25–35% | ❌ N/A |
| Vendor Onboarding | ✅ Instant | ❌ Weeks | ❌ Months |
| Street-level GPS | ✅ Yes | ⚠️ City-level | ✅ Yes |
| AI Tools for Vendors | ✅ Free | ❌ No | ❌ No |
| Works without App Store | ✅ PWA | ❌ App required | ✅ Web |
| Cart + Ordering | ✅ Yes | ✅ Yes | ❌ No |
| Local Community Focus | ✅ 100% | ❌ Corporate | ❌ Directory |

---

## 👨‍💻 Tech Stack

```
Frontend Framework : Alpine.js (reactive, lightweight, no build step)
CSS Framework      : Tailwind CSS (utility-first, CDN)
Maps               : Leaflet.js + Google Maps Tile Layer
Icons              : Font Awesome 6.5
Fonts              : Plus Jakarta Sans (Google Fonts)
Backend            : Python 3.14 + Flask
Database           : SQLite (portable, zero-config)
Geo Discovery      : OpenStreetMap Nominatim API (free, global)
Distance Calc      : Haversine Formula (great-circle accuracy)
AI Engine          : Google Gemini 2.5 Flash API
Public Deployment  : Cloudflare Quick Tunnels (zero config HTTPS)
Version Control    : Git + GitHub
```

---

## 🚀 Setup & Run

```bash
# 1. Clone the repo
git clone https://github.com/parthchugh2308-dev/LocalLift.git
cd LocalLift

# 2. Install Flask
pip install flask

# 3. Initialize Database
python init_db.py

# 4. (Optional) Add Gemini API Key for AI features
# Windows: set GEMINI_API_KEY=your_key_here

# 5. Run
python app.py

# Customer: http://localhost:5000
# Vendor:   http://localhost:5000/vendor
```

**Demo Credentials:**
```
Vendor:   vendor@locallift.com   / password123
Customer: customer@locallift.com / password123
Phone OTP (any number): 1234
```

---

## 🔮 Future Roadmap

**Phase 2 — AI Superpowers**
- AI Shopping Chatbot — Natural language vendor discovery
- Voice Search — Hindi/English speech recognition
- Daily Business Summary — AI-generated vendor analytics
- Smart Pricing — AI suggests optimal product prices
- Review Summarizer — AI condenses customer feedback

**Phase 3 — Platform Growth**
- Real-time Delivery Tracking — Live map order tracking
- UPI Payment Integration — Razorpay/PhonePe
- Push Notifications — Order updates via browser push
- WhatsApp Integration — Orders via WhatsApp Business API
- Loyalty Points System — Reward frequent local shoppers

**Phase 4 — Scale**
- Vendor Mobile App — React Native
- Analytics Dashboard — Revenue trends, peak hours, heatmaps
- B2B Procurement — Bulk orders for offices/institutions
- Cloud Deployment — AWS / GCP production hosting

---

## 🌱 Social Impact

> *"Every ₹100 spent at a local shop keeps ₹68 in the local economy."*

By giving local vendors free digital tools and helping customers discover businesses within walking distance, LocalLift:
- **Reduces carbon footprint** (shorter delivery distances)
- **Supports 63 million** unorganized retail businesses in India
- **Preserves local culture** — your neighborhood baker, not a cloud kitchen
- **Creates local jobs** — delivery and service stay local
- **Builds community trust** — you know your vendor personally

---

## 📜 License

MIT License — Free to use, modify, and distribute.

---

## 👤 Author

**Parth Chugh** — Design Thinking & Innovation College Project
GitHub: [@parthchugh2308-dev](https://github.com/parthchugh2308-dev)
Repo: [github.com/parthchugh2308-dev/LocalLift](https://github.com/parthchugh2308-dev/LocalLift)

---

*Built with ❤️ for local communities, small vendors, and the belief that technology should empower neighborhoods — not replace them.*
