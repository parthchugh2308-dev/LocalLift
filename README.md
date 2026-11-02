# 🌿 LocalLift 2.0 — Pan-India Hyperlocal Marketplace Platform
### *"Discover Local. Support with Love. Grow Together."*

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg?logo=flask)](https://flask.palletsprojects.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash-4285F4.svg?logo=google)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?logo=sqlite)](https://sqlite.org)
[![Render](https://img.shields.io/badge/Render-Ready-46E3B7.svg?logo=render)](https://render.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340.svg?logo=razorpay)](https://razorpay.com)

**LocalLift 2.0** is an enterprise-grade, GPS-first hyperlocal marketplace platform designed for neighborhood Indian commerce. Built with a robust **Python Flask** backend and clean **Alpine.js + Tailwind CSS** progressive frontend, LocalLift connects everyday customers with verified local kiranas, bakeries, pharmacies, eateries, and specialty stores within a 500m to 10km radius.

LocalLift empowers neighborhood merchants with a **zero-commission storefront**, coordinates orders via a dedicated **gig delivery fleet**, secures transactions with **Razorpay & Cash on Delivery (COD)**, and embeds **Google Gemini AI** across every portal for intelligent commerce.

---

## 🏛️ The Four Ecosystem Portals

| Portal | URL Route | Target Persona | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer App** | `/` | Everyday Shoppers | Street-level GPS discovery, 16 categories, multi-vendor cart, COD & Razorpay, live GPS tracking, AI shopping concierge. |
| **Vendor Partner** | `/vendor` | Local Store Owners | Store open/close toggle, stock & catalog management, Gemini AI product synthesizer, order fulfillment, earnings ledger. |
| **Delivery Fleet** | `/delivery` | Gig Riders | Real-device Geolocation telemetry, trip acceptance, double OTP cryptographic handshake, earnings payouts. |
| **Admin Center** | `/admin` | City Governance | Merchant KYC approvals, fleet management, multi-city GMV & financial oversight, refund execution, Executive AI insights. |

---

## ✨ Key Technical Architecture & Features

### 🛒 1. Customer Shopping Experience (`/`)
* **Hardware GPS & Draggable Pin**: Pinpoint dropoffs accurately on interactive Leaflet maps with automatic road and locality detection.
* **16 Core Categories**: Bakery, Grocery, Restaurant, Pharmacy, Clothing, Electronics, Stationery, Beauty, Hardware, Fruits & Veg, Footwear, Flowers, Pet Supplies, Home Services, Dairy & Sweets, Cafe & Snacks.
* **Persistent Multi-Vendor Basket**: Add items across multiple neighborhood stores. The client maintains basket state in `localStorage` (`locallift_cart`), and the server enforces authoritative price checks and stock verification.
* **Real-Time Orders Sync**: The "My Orders" tab automatically synchronizes past orders and line-item details directly from SQLite upon app launch or tab selection.
* **Dual Payment Support**: Complete checkout seamlessly with **Cash on Delivery (COD)** or online via **Razorpay**.

### 🏪 2. Vendor Partner Portal (`/vendor`)
* **Zero-Commission Model**: Store owners keep 100% of their product revenue with instant online/offline discovery controls.
* **Catalog Management**: Add, update, and toggle inventory stock (`In Stock` / `Out of Stock`) in real time.
* **Google Gemini AI Product Generator**: Generates 4 market-appropriate catalog items with authentic Indian INR pricing and promotional launch deals tailored to the store's category and locality.
* **Fulfillment Pipeline**: Transition orders smoothly through `Pending` ➔ `Confirmed` ➔ `Ready for Pickup` ➔ `Delivered`.
* **Settlements & Financial Dashboard**: View gross sales, platform commissions, settled funds, and pending payouts with strict role data isolation.

### 🚴 3. Delivery Fleet & Dispatch Cockpit (`/delivery`)
* **Real-Device Geolocation Telemetry**: Uses browser Geolocation API (`watchPosition`) over HTTPS. Transmits live coordinates, accuracy, and timestamps to `PATCH /api/delivery/location` strictly when an active delivery is in progress.
* **Double OTP Cryptographic Handshake**:
  * **Pickup OTP**: Merchant verifies the rider at the shop before handover.
  * **Delivery OTP**: Customer provides a one-time 6-digit code at their doorstep to confirm handover.
  * *Security*: OTPs are derived using HMAC-SHA256 with rate limits, 15-minute expiry, attempt tracking (max 3), and zero exposure in public APIs.
* **Delivery Earnings Ledger**: Every fulfilled delivery automatically credits delivery fee and partner compensation to the rider's auditable balance.

### 🏛️ 4. Admin Control Center (`/admin`)
* **Governance & Merchant KYC**: Review incoming store registration requests with 1-click **Approve** and **Reject** controls.
* **Platform Analytics & GMV**: Real-time aggregation of platform gross merchandise value (GMV), completed orders, active shops, and fleet capacity.
* **Financial Oversight & Refunds**: Audit Razorpay payments, monitor platform commission receivables, and execute full or partial customer refunds with automatic status reconciliation.
* **Delivery Fleet Monitoring**: Approve riders, inspect vehicle documentation (driving license, registration), and monitor active orders across city zones.

---

## 🤖 Google Gemini AI Ecosystem (Stage 12)

LocalLift integrates Google's **Gemini AI API** (`gemini-3.5-flash`) through a centralized Python service ([`gemini_service.py`](file:///C:/Users/Asus/.gemini/antigravity/scratch/locallift/gemini_service.py)) with **17 controlled function-calling tools**:

```
                       ┌────────────────────────┐
                       │   Client Portals (4)   │
                       └───────────┬────────────┘
                                   │ POST /api/ai/chat
                                   ▼
                       ┌────────────────────────┐
                       │   Flask AI Gateway     │
                       │   - Prompt Injection   │
                       │   - Rate Limiting      │
                       │   - Strict Role Scoping│
                       └───────────┬────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
     ┌───────────────────────┐             ┌─────────────────────┐
     │  Google Gemini API    │             │ Deterministic Local │
     │  (AI Studio 3.5-Flash)│             │  Fallback Engine    │
     └──────────┬────────────┘             └──────────┬──────────┘
                │ Tool Calls                          │ Rule Matching
                └──────────────────┬──────────────────┘
                                   ▼
                       ┌────────────────────────┐
                       │ 17 Role-Gated Tools    │
                       │ (Read-Only DB Queries) │
                       └────────────────────────┘
```

* **Customer AI Concierge**: Recommends products, finds budget combo meals, locates nearby open shops, tracks active deliveries, and proposes basket additions.
* **Vendor AI Business Advisor**: Summarizes daily orders, suggests stock reorders, analyzes category pricing, and drafts promotional campaigns.
* **Rider AI Assistant**: Summarizes trip counts, calculates daily/weekly earnings, and guides active dropoffs.
* **Admin Executive AI**: Answers natural-language executive queries regarding city-wise GMV, platform commission, active merchant counts, and operational delivery anomalies.
* **Zero-Failure Architecture**: If `GEMINI_API_KEY` is missing or the external API times out/rate-limits, LocalLift automatically switches to its local deterministic rule engine without throwing errors or breaking the user experience.
* **Enterprise Guardrails**: All tools are read-only; mutation operations (payments, refunds, status changes, approvals) are strictly excluded from tool calling.

---

## 💳 Secure Financial Architecture (Stage 11)

* **Dual Payment Channels**:
  * **Cash on Delivery (COD)**: Immediately marks child orders as confirmed and enables rider dispatch.
  * **Online (Razorpay Gateway)**: Generates a parent Razorpay order with server-side price validation. Verifies cryptographic HMAC-SHA256 signatures (`razorpay_order_id|razorpay_payment_id`) before confirming child orders.
* **Multi-Vendor Order Groups**: 1 parent order (`Order_Groups`) maps to $N$ vendor child orders (`Orders`), guaranteeing atomic checkout and independent store fulfillment.
* **Auditable Refunds**: Supports full and partial refunds against captured payments, automatically adjusting vendor settlements and recording immutable entries in `Financial_Audit_Log`.
* **Platform Commission**: Configurable percentage commission calculated on net item subtotals.

---

## 🛠️ Technology Stack

* **Backend**: Python 3.11+, Flask 3.1.x, Gunicorn WSGI
* **Database**: SQLite3 with `PRAGMA foreign_keys = ON` and automated migration hooks
* **Frontend**: Vanilla HTML5, Alpine.js 3.x, Tailwind CSS, FontAwesome 6
* **Design System**: Contrasting Romantic LocalLift palette (`#e11d48` primary rose, `#be123c` hover, `#fff1f3` tinted card surfaces, Fraunces serif headings, Plus Jakarta Sans text)
* **Maps & Geolocation**: Leaflet.js with OpenStreetMap tiles & custom SVG category markers
* **Payment Gateway**: Razorpay REST API with HMAC-SHA256 verification
* **AI Model**: Google Gemini API (`gemini-3.5-flash`) via `gemini_service.py`

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* Python 3.11 or higher
* Git

### 2. Clone and Setup Environment
```bash
# Clone the repository
git clone https://github.com/parthchugh2308-dev/LocalLift.git
cd LocalLift

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=locallift_dev_secret_key_change_in_prod

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash

# Razorpay Configuration (Optional for Online Payments)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Initialize Database
```bash
python init_db.py
```
This automatically sets up all 16 categories, seeded stores, sample products, multi-city delivery zones (Ludhiana, New Delhi), and runs all schema migrations.

### 5. Launch the Server
```bash
python app.py
```
The application will be live at **`http://127.0.0.1:5000/`**.

---

## ☁️ Production Cloud Deployment

### Deploying on Render (Recommended)
LocalLift includes a production-ready [`render.yaml`](file:///C:/Users/Asus/.gemini/antigravity/scratch/locallift/render.yaml) blueprint:

1. Connect your GitHub repository to [Render](https://dashboard.render.com/).
2. Select **Web Service** or use **Blueprints** pointing to `render.yaml`.
3. Build & Start Commands:
   * **Build Command**: `pip install -r requirements.txt && python init_db.py`
   * **Start Command**: `gunicorn app:app`
4. In the Render **Environment** tab, add:
   * `GEMINI_API_KEY`: *Your Google AI Studio key*
   * `GEMINI_MODEL`: `gemini-3.5-flash`
   * *(Optional)* `SECRET_KEY`: Custom secret string (if omitted, LocalLift automatically derives a persistent, secure 256-bit key from `RENDER_SERVICE_ID` to prevent startup crashes).

---

## 🔑 Demo Credentials

| Role | Portal URL | Email / Phone | Password | 1-Click Demo Available |
| :--- | :--- | :--- | :--- | :---: |
| **Customer** | `/` | `customer@locallift.com` | `password123` | ✅ (1-Click Google / Phone OTP) |
| **Vendor** | `/vendor` | `vendor@locallift.com` | `password123` | ✅ (1-Click Demo Store) |
| **Delivery Rider**| `/delivery` | `delivery@locallift.com` | `password123` | ✅ (1-Click Rajesh Kumar PB10-DL-5521) |
| **Administrator** | `/admin` | `admin@locallift.com` | `admin123` | ✅ (1-Click Super Admin) |

---

## 🧪 Automated Test Suites

LocalLift includes 10 comprehensive unit and integration test suites covering all stages (91+ tests):

```bash
# Run multi-vendor checkout tests (Stage 10)
python test_stage10.py

# Run secure payments & financial ledger tests (Stage 11)
python test_stage11.py

# Run Gemini AI ecosystem & function-calling tests (Stage 12)
python test_stage12.py

# Run live GPS telemetry & delivery OTP security tests (Stage 8/9)
python test_stage8_9.py

# Run production security & role-isolation audit
python test_production_security.py
```

---

## 📄 License & Community Rules

* **Documentation & Data Integrity**: Preserves all local neighborhood listings, merchant identity data, and delivery logs.
* **Security & Privacy First**: Zero exposure of customer coordinates, delivery OTP hashes, or gateway secrets in public endpoints.
* Built with ❤️ to champion local Indian shopkeepers and neighborhood commerce.
