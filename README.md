# 🏬 KLU Shop — Official KL University Campus Store

[![KL University Store](https://img.shields.io/badge/Store-KLU%20Official-red.svg)](https://github.com/yaswanth192006/KLU-Shop)
[![Author](https://img.shields.io/badge/Developer-yaswanth192006-blue.svg)](https://github.com/yaswanth192006)
[![Roll ID](https://img.shields.io/badge/Roll%20ID-2500030520-green.svg)](#)

A modern, responsive e-commerce platform built for **KL University (KLU)** students and faculty, featuring dynamic product catalogs, smartphone showrooms, real-time cart management, **campus checkout & billing**, multiple payment modes (UPI, Cards, Net Banking, COD), **official printable tax invoices/receipts**, and **order history tracking**.

---

## 🚀 Key Features

### 1. 🛍️ Campus Product Catalog & Mobile Showroom
- Browse tech gadgets, college backpacks, scientific calculators, stationery, and grooming essentials.
- Real-time **keyword search** and **category filter**.
- **Mobile Phones Showroom**: Iqoo Z10 5G, Iqoo Z10x 5G, Iqoo Z10r 5G with university partner pricing.
- Offline-first JSON database bundled (`src/data/products.json`) with DummyJSON network sync.

### 2. 🛒 Interactive Cart with Quantity Controls
- Add items with instant toast feedback.
- Increment (`+`), decrement (`-`), or remove items.
- Dynamic cart counter badge displayed on the navigation bar.
- Accurate total price calculation multiplying price by quantity.

### 3. 🧾 Complete Campus Billing & Checkout (`#/billing`)
- **Student Details**: Pre-filled with student name (`Yaswanth`), Roll ID (`2500030520`), and email (`2500030520@kluniversity.in`).
- **Hostel Delivery Address**: Select hostel blocks (BH-1, BH-2, BH-3, GH-1, GH-2, or Day Scholar SAC pickup), room number, and campus location.
- **10% Student Concession**: Coupon code `KLU10` automatically applies a 10% discount.
- **Payment Modes**:
  - 📱 **UPI / QR Code**: Google Pay, PhonePe, Paytm, BHIM with UPI ID validation.
  - 💳 **Credit / Debit Cards**: Card number, expiry, CVV, and name.
  - 🏦 **Net Banking**: State Bank of India (KLU Campus Branch), HDFC, ICICI, or KLU Smart Wallet.
  - 💵 **Cash on Delivery (COD)**: Pay when package arrives at your hostel room.

### 4. 🖨️ Printable Official Tax Invoice / Receipt (`#/receipt`)
- Generates an official university store tax invoice.
- Complete with Order ID, customer details, itemized billing table, GST breakdown, discount summary, and authorized signature.
- **One-click "Print Tax Invoice / Save PDF"** button with dedicated `@media print` formatting.

### 5. 📦 Order History Tracking (`#/orders`)
- Saves past orders to `localStorage`.
- Displays hostel delivery status ("Confirmed / Preparing for Delivery").
- Allows viewing any invoice anytime.

### 6. ⏰ Real-time Clock Widget
- Floating widget at bottom-right showing live date and time ticker updating every second.

---

## 📁 Project Structure

```
KLU-Shop/
├── .gitignore                     # Git ignore rules (node_modules, dist, etc.)
├── package.json                   # Dependencies & build scripts
├── vite.config.js                 # Vite bundler configuration
├── index.html                     # HTML5 entry point
├── README.md                      # Documentation
├── src/
│   ├── main.jsx                   # React root entry
│   ├── App.jsx                    # SPA HashRouter routes
│   ├── context/
│   │   ├── DateContext.jsx        # Real-time clock ticker context
│   │   └── CartContext.jsx        # Cart, billing, auth, and order state
│   ├── data/
│   │   └── products.json          # Bundled offline product catalog
│   └── Components/
│       ├── Header.jsx             # Top navigation & student greeting
│       ├── Footer.jsx             # Fixed bottom footer
│       ├── Home.jsx               # Landing page
│       ├── Content.jsx            # Hero banner & CTA
│       ├── Highlights.jsx         # Why Choose KLU Shop section
│       ├── Products1.jsx          # Catalog grid with search & category filters
│       ├── Product.jsx            # Mobiles showroom (Iqoo Z10, Z10x, Z10r)
│       ├── Cart.jsx               # Shopping cart & subtotal
│       ├── Billing.jsx            # Campus checkout & billing form
│       ├── Receipt.jsx            # Printable official tax invoice
│       ├── Orders.jsx             # Order history tracking
│       ├── Login.jsx              # Student login portal
│       ├── Signup.jsx             # Student registration form
│       ├── ClockWidget.jsx        # Floating date/time widget
│       ├── Styles.css             # Unified CSS styles & print stylesheet
│       └── images/
│           ├── z10.jpeg           # Iqoo Z10 image
│           ├── z10x.jpeg          # Iqoo Z10x image
│           └── z10r.jpeg          # Iqoo Z10r image
```

---

## 🏃 Getting Started

### 1. Run Development Server
```powershell
cd C:\Users\sabbe\.gemini\antigravity\scratch\KLU-Shop
npm.cmd run dev
```
Open **`http://localhost:5173/`** in your browser.

### 2. Build for Production
```powershell
npm.cmd run build
```
Optimized assets will be generated in `dist/`.

---

## 🐙 Git & GitHub Connection

This project is configured with the following credentials:
- **GitHub Username:** `yaswanth192006`
- **Email:** `2500030520@kluniversity.in`
- **Remote Origin:** `https://github.com/yaswanth192006/KLU-Shop.git`
- **Branch:** `main`

### To Push to GitHub:
If you haven't created the repository on GitHub yet:
1. Go to [github.com/new](https://github.com/new) and create a repository named **`KLU-Shop`**.
2. Run:
```powershell
cd C:\Users\sabbe\.gemini\antigravity\scratch\KLU-Shop
git push -u origin main
```
