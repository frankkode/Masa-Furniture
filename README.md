# Masa – Furniture E-Commerce Platform

A full-stack furniture e-commerce web application built with React, Node.js, Express, SQLite, and Stripe.

**Course:** Getting Started in Web Programming (DLBITPEWP01_E)  
**Student:** Frank Masabo | 321147823  
**IU International University of Applied Sciences**  
**GitHub:** https://github.com/frankkode/Masa-Furniture

---

## Features

### Customer-Facing
- **Homepage** — Hero search, Best Selling Products (category tabs with live API), Why Choosing Us, Experiences stats, Materials showcase, Testimonials carousel, Newsletter CTA
- **Shop Page** — Category sidebar (live counts), price-range filter, search, sort (5 options), grid/list toggle, pagination, active filter chips, mobile filter drawer
- **Product Detail** — Image gallery with thumbnail strip, finish colour swatches, quantity stepper, Add to Cart, Description/Specifications/Reviews tabs, star rating breakdown, submit review (auth required), related products row
- **Cart** — Full item list with qty controls, free-shipping progress bar, coupon code input, order summary
- **Checkout** — 3-step wizard (Address → Review → Stripe Payment), address form, white-glove delivery notice
- **Order Confirmation** — Order ID, status badge, itemised receipt, delivery ETA
- **Auth** — Register with password strength meter, Login with show/hide password, JWT session, protected routes
- **Dashboard** — Overview with recent orders, full order history, wishlist management, profile & password settings

### Technical Highlights
- Server-side price integrity — cart stores no prices; `POST /api/orders` re-fetches product prices from DB
- Stripe PaymentIntent amount set entirely server-side; client only confirms with the `client_secret`
- Webhook handler (`POST /api/payments/webhook`) for `payment_intent.succeeded` / `payment_intent.payment_failed`
- JWT auth with 7-day expiry, bcrypt password hashing (cost factor 12)
- SQLite with `better-sqlite3` (synchronous, no connection pool needed)
- React Context API for cart state and auth state across the app
- Graceful fallback to placeholder data on every page when the API is offline

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | React 18, Vite, React Router v6, Axios          |
| Styling     | Tailwind CSS (custom masa-dark / masa-accent theme) |
| Payments    | Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`) |
| Backend     | Node.js, Express.js (REST API, JSON only)       |
| Database    | SQLite 3 + better-sqlite3                       |
| Auth        | JWT (jsonwebtoken) + bcrypt                     |

---

## Project Structure

```
Masa-Furniture/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navbar, Footer, CartDrawer, ProtectedRoute
│   │   │   └── ProductCard.jsx
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── pages/           # All page components
│   │   ├── services/        # Axios instance (api.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example         # Copy to .env and add Stripe key
│   └── tailwind.config.js
│
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── db/              # SQLite setup and seed data
│   │   ├── middleware/      # JWT auth middleware
│   │   └── routes/          # auth, products, categories, cart,
│   │                        #   orders, payments, wishlist
│   ├── .env.example
│   └── index.js
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Stripe](https://stripe.com) account (test mode keys)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/frankkode/Masa-Furniture.git
cd Masa-Furniture

# 2. Install server dependencies and configure environment
cd server
npm install
cp .env.example .env
# Edit server/.env — add JWT_SECRET and Stripe keys

# 3. Seed the database
npm run db:setup

# 4. Install client dependencies and configure environment
cd ../client
npm install
cp .env.example .env
# Edit client/.env — add your Stripe publishable key (VITE_STRIPE_PK)

# 5. Start the servers (two terminal windows)
#    Terminal 1 — API server on http://localhost:5000
cd server && npm run dev

#    Terminal 2 — React dev server on http://localhost:5173
cd client && npm run dev
```

### Environment Variables

**`server/.env`**
```
PORT=5000
JWT_SECRET=your_long_random_secret_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**`client/.env`**
```
VITE_STRIPE_PK=pk_test_...
```

### Stripe Test Card
Use card number `4242 4242 4242 4242` with any future expiry and any 3-digit CVC for test payments.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| PATCH | `/api/auth/profile` | ✓ | Update profile |
| POST | `/api/auth/change-password` | ✓ | Change password |
| GET | `/api/products` | — | List products (filter/sort/page) |
| GET | `/api/products/:id` | — | Product detail + reviews |
| POST | `/api/products/:id/reviews` | ✓ | Submit review |
| GET | `/api/categories` | — | All categories with counts |
| GET | `/api/cart` | ✓ | Get cart |
| POST | `/api/cart` | ✓ | Add item |
| PATCH | `/api/cart/:id` | ✓ | Update qty |
| DELETE | `/api/cart/:id` | ✓ | Remove item |
| GET | `/api/orders` | ✓ | Order history |
| POST | `/api/orders` | ✓ | Create order from cart |
| GET | `/api/orders/:id` | ✓ | Order detail |
| POST | `/api/payments/create-intent` | ✓ | Create Stripe PaymentIntent |
| POST | `/api/payments/confirm` | ✓ | Confirm order post-payment |
| POST | `/api/payments/webhook` | — | Stripe webhook handler |
| GET | `/api/wishlist` | ✓ | Get wishlist |
| POST | `/api/wishlist/:productId` | ✓ | Add to wishlist |
| DELETE | `/api/wishlist/:productId` | ✓ | Remove from wishlist |

---

## Pages

| Route | Component | Protected |
|-------|-----------|-----------|
| `/` | HomePage | — |
| `/shop` | ShopPage | — |
| `/shop/:category` | ShopPage | — |
| `/product/:id` | ProductPage | — |
| `/cart` | CartPage | — |
| `/login` | LoginPage | — |
| `/register` | RegisterPage | — |
| `/checkout` | CheckoutPage | ✓ |
| `/order/:id` | OrderConfirmPage | ✓ |
| `/dashboard/*` | DashboardPage | ✓ |
| `*` | NotFoundPage | — |

---

## Screenshots

<!-- Frank: add screenshots here before final submission -->

---

## License

Built for academic submission — IU Internationale Hochschule, 2026.  
© Frank Masabo
