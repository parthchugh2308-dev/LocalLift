# 🌿 LocalLift — Hyperlocal Marketplace Platform

> **Design Thinking & Innovation College Project**  
> Discover Local. Support Local. Grow Together.

---

## 🚀 What is LocalLift?

LocalLift is a **mobile-first Progressive Web App (PWA)** that connects customers with **verified local businesses** in their neighborhood using real-time GPS, live OpenStreetMap data, and Google Maps tiles.

No big commissions. No distant warehouses. Just your local kirana, bakery, and pharmacy — discovered instantly.

---

## ✨ Features

### Customer App (`/`)
- 📍 **High-accuracy GPS** with draggable map pin confirmation
- 🗺️ **Google Maps tiles** with 16 category pins
- 🏪 **Live hyperlocal vendors** from OpenStreetMap Nominatim
- 🛒 **Full cart & checkout** flow (Pay on Delivery / UPI)
- 🔍 **Search & filter** by category, distance (500m – 10km)
- 📦 **Order tracking** in My Orders tab
- 📱 **PWA** — installable on phone like a native app

### Vendor Dashboard (`/vendor`)
- 📊 **Real-time dashboard** with stats
- 📦 **Product catalog** management (Add/Edit/Delete/Toggle stock)
- 🛍️ **Order management** with status workflow (Pending → Confirmed → Ready → Delivered)
- 🏷️ **Promotions & Deals** creator
- 🤖 **Google Gemini AI** catalog generator
- 🔄 **Shop Open/Closed** toggle

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python + Flask |
| Database | SQLite |
| Frontend | Alpine.js + Tailwind CSS |
| Maps | Leaflet.js + Google Maps tiles |
| Geo Data | OpenStreetMap Nominatim API |
| AI | Google Gemini 2.5 Flash API |
| PWA | Service Worker + Web App Manifest |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pip install flask

# 2. Initialize database
python init_db.py

# 3. Run the app
python app.py

# 4. Open in browser
# Customer: http://localhost:5000
# Vendor:   http://localhost:5000/vendor
```

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Vendor | vendor@locallift.com | password123 |
| Customer | customer@locallift.com | password123 |

---

## 📁 Project Structure

```
locallift/
├── app.py              # Flask backend + all API routes
├── init_db.py          # Database setup & sample data
├── templates/
│   ├── customer.html   # Customer PWA (1900+ lines)
│   └── vendor.html     # Vendor Dashboard (700+ lines)
├── static/
│   ├── manifest.json   # PWA manifest
│   └── sw.js           # Service Worker
└── LocalLift_DB.sqlite # SQLite database (gitignored)
```

---

## 🗺️ API Endpoints

```
GET  /api/vendors/nearby?lat=X&lon=Y&radius=2   # Live nearby shops
GET  /api/vendors/<id>?lat=X&lon=Y              # Shop details + products
GET  /api/offers                                 # Active promotional offers
GET  /api/search?q=query&lat=X&lon=Y            # Search vendors + products
POST /api/orders                                 # Place an order
POST /api/ai/synthesize-catalog                 # AI product generator
```

---

## 🎯 College Project Context

Built for **Design Thinking & Innovation** — demonstrating:
- **Empathize**: Local vendors losing customers to mega-platforms
- **Define**: No digital discovery for hyperlocal shops
- **Ideate**: GPS-first, community-powered marketplace
- **Prototype**: Full-stack PWA with real location data
- **Test**: Live deployment via Cloudflare tunnel

---

*Made with ❤️ for local communities*
