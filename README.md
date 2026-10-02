# 🌿 LocalLift — Hyperlocal Marketplace Android App

> Discover Local. Support Local. Grow Together.

LocalLift is a native Android application built with **Kotlin** and **Jetpack Compose** that connects customers directly with verified neighborhood businesses within 500m to 10km radius.

---

## ✨ Features Ported & Implemented

### 📱 Customer App
- 📍 **Hyperlocal GPS Location Detection**: Dynamic selection of locations with live latitude/longitude calculation and preset discovery hubs.
- 📡 **Interactive Radar & Range Slider**: Adjustable discovery radius from 500m up to 10km with a real-time animated Canvas radar map displaying vendor pins.
- 🏪 **16 Hyperlocal Marketplace Categories**: Bakery, Grocery, Restaurant, Pharmacy, Clothing, Electronics, Stationery, Beauty, Hardware, Fruits & Vegetables, Footwear, Flowers, Pet Supplies, Home Services, Dairy & Sweets, and Cafe & Snacks.
- 🔍 **Live Search**: Instant keyword search matching local vendors, descriptions, and catalog items.
- 🛍️ **Shop Details & Product Catalog**: Verified badges, operational hours, rating, phone dialer shortcut, active deals, and customer reviews.
- 🛒 **Cart & Checkout**: Multi-item cart management, address specification, delivery instructions, payment method selection (Cash on Delivery / UPI), and instant order placement.
- 📦 **Order Tracking**: Comprehensive step tracker (Pending → Confirmed → Preparing → Delivered) with itemized receipts.

### 🏢 Vendor Dashboard
- 📊 **Real-time Metrics**: Total Products, Active Orders, Revenue, Rating, and Active Deals.
- 🔄 **Shop Status Toggle**: Real-time Open/Closed switch.
- 📦 **Catalog Management**: Add new products, toggle stock availability, edit, and delete products.
- 🛍️ **Order Management Workflow**: Real-time incoming orders with status transitions (Confirm → Prepare/Ready → Deliver, or Reject).
- 🏷️ **Promotional Deals**: Create and publish custom neighborhood discounts and offers.
- 🤖 **Google Gemini AI Catalog Synthesizer**: Generates tailored products and promotional deals for the shop using Google Gemini or the built-in domain synthesizer.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Modern Android (Kotlin + Jetpack Compose)
- **UI Design System**: Material Design 3 (M3) with dynamic color palette and dark/light theme support
- **Local Persistence**: Room Database (Kotlin Coroutines & Flow) with pre-seeded rich catalog
- **Image Loading**: Coil Compose
- **Build System**: Gradle 9.3.1 (Kotlin DSL) with Android Gradle Plugin 9.1.1
