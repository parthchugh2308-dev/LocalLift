# 🌿 LocalLift — Hyperlocal Marketplace Platform (React + Vite)
### *"Discover Local. Support with Love. Grow Together."*

LocalLift is an AI-powered, GPS-first hyperlocal marketplace Progressive Web App (PWA) rewritten in **React, TypeScript, Vite, and Tailwind CSS**. It connects everyday customers with verified neighborhood businesses — bakeries, grocery stores, pharmacies, cafes, and 12 more categories — in real-time, without charging vendors predatory commissions.

---

## 🎯 Architecture & Features Ported

### 👥 1. Customer Experience
- **Doorstep GPS & Pin Confirmation**: High-accuracy geolocation with interactive Leaflet map pin dragging to pinpoint exact gates and dropoffs.
- **Street-Level Discovery**: Real-time Haversine distance calculations and walking/driving time estimates from the user's location.
- **16 Core Marketplace Categories**: Bakery, Grocery, Restaurant, Pharmacy, Clothing, Electronics, Stationery, Beauty, Hardware, Fruits & Veg, Footwear, Flowers, Pet Supplies, Home Services, Dairy & Sweets, Cafe & Snacks.
- **Distance Radius Filter**: Within 500m / 1km / 2km / 5km / 10km chips.
- **Interactive Map Tab**: Leaflet map with colored category pins for neighborhood stores and user's pulsing GPS marker.
- **Storefront & Menu**: Store banner, active exclusive deals, categorized products with "+/-" cart counters, verified reviews, and "Write Review" capability.
- **Cart & Instant Checkout**: Multi-item cart, zero commission, free neighborhood delivery, notes for the store, and payment options (Pay on Delivery or instant simulated UPI).
- **Order Pipeline & Tracking**: Real-time order progress timeline (Pending → Confirmed → Preparing → Delivered).

### 🏪 2. Vendor Partner Portal
- **Zero Commission Model**: Vendors retain 100% of their sales with instant storefront control.
- **Live Open/Closed Toggle**: Real-time toggle switch directly affecting store discoverability.
- **Catalog Management**: Add, edit, and delete products with stock availability toggle (In Stock / Out of Stock).
- **Google Gemini AI Catalog Generator**: Generates 4 market-appropriate products with realistic Indian market INR prices, descriptions, and tailored promotional deals for the merchant's category and locality.
- **Order Workflow Pipeline**: Accept, Mark Preparing, Mark Delivered, or Reject customer orders.
- **Promotions Engine**: Launch custom % OFF, Flat OFF, and BOGO deals.
- **Store Settings**: Edit business name, owner contact, opening/closing hours, and store description.
- **Vendor Onboarding**: Register new shops into the governance approval pipeline.

### 🛡️ 3. Admin Control Center
- **Governance & Approvals Queue**: View incoming merchant applications with 1-click **Approve** and **Reject** controls.
- **Platform Analytics**: Total stores, pending applications, gross GMV, orders count, and product SKUs.
- **Platform Audit Trail**: View all marketplace orders across customers and merchants.
- **User Directory**: Customer accounts and order volume.

---

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite 6 (running on port 3000)
- **Styling**: Tailwind CSS with custom Plus Jakarta Sans typography
- **Maps**: Leaflet.js with OpenStreetMap tiles and custom SVG pins
- **AI Engine**: Google Gemini API integration with intelligent retail synthesizer fallback
- **Effects**: Canvas Confetti celebrations on order completion

---

## 🔑 Demo Credentials

- **Customer**: `customer@locallift.com` / `password123` (or Phone OTP `1234` / 1-Click Google)
- **Vendor**: `vendor@locallift.com` / `password123` (or 1-Click Demo Store)
- **Admin**: `admin@locallift.com` / `admin123` (or 1-Click Demo Admin)
