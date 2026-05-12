# RiceMindAI — Complete Product Requirements Document (PRD)
> Version 1.0 | For Claude Code / AI Agent Use
> Stack: FastAPI (Backend) + React (Buyer/Seller Frontend @ 5173) + React (Admin Frontend @ 5174)
> Auth: Clerk | Images: ImageKit | Database: Neon (PostgreSQL) | UI: Shadcn/ui + Tailwind CSS

---

## TABLE OF CONTENTS
1. Project Overview
2. System Architecture
3. Tech Stack (Complete)
4. Repository Structure
5. Database Schema (Neon PostgreSQL)
6. Authentication Flow (Clerk)
7. Role-Based Access Control
8. Feature Breakdown by Stakeholder
   - 8.1 Seller
   - 8.2 Buyer
   - 8.3 Admin
9. AI Integration (Image Scan + Price Validation)
10. ImageKit Integration
11. Wallet System (Dummy Escrow)
12. Contract System
13. Order Lifecycle
14. API Endpoints (FastAPI)
15. Environment Variables
16. UI/UX Guidelines
17. Important Rules & Edge Cases

---

## 1. PROJECT OVERVIEW

RiceMindAI is an AI-powered B2B/B2C rice marketplace platform. It connects rice sellers and buyers through a smart listing, ordering, and payment system.

**Core Value Propositions:**
- Sellers list rice with AI-validated quality and pricing
- Buyers browse, order, and pay through an in-platform escrow wallet
- Contracts are generated on-platform for every order
- Admin manages users and funds

**Three Stakeholders:**
| Role | Description |
|------|-------------|
| Seller | Lists rice, manages orders, sends contracts, receives payment after delivery |
| Buyer | Browses listings, places orders, pays via wallet (escrow held) |
| Admin | Manages users, adds wallet funds, oversees platform |

---

## 2. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│                                                         │
│  [Buyer/Seller React App]     [Admin React App]         │
│       Port: 5173                   Port: 5174           │
│   Clerk Auth + Shadcn/ui       Clerk Auth + Shadcn/ui   │
└──────────────┬──────────────────────────┬───────────────┘
               │  REST API calls          │
               ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND                         │
│              (Single backend for both frontends)        │
│                                                         │
│  Routers: auth | listings | orders | contracts |        │
│           wallet | admin | ai                           │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
  [Neon PostgreSQL]  [ImageKit CDN]
  (All app data)     (Listing images)
       │
       ▼
  [AI Service]
  (Image scan + price validation)
```

**Communication:**
- Both React apps communicate with the same FastAPI backend
- Clerk JWT tokens are verified on every protected API call
- ImageKit handles all image uploads directly from frontend (using signed URL from backend)

---

## 3. TECH STACK (COMPLETE)

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | Python web framework |
| SQLAlchemy (async) | ORM for PostgreSQL |
| asyncpg | Async PostgreSQL driver |
| Neon | Serverless PostgreSQL database |
| Alembic | Database migrations |
| Clerk Python SDK / JWKS | JWT verification |
| ImageKit Python SDK | Image signed URL generation |
| httpx | Async HTTP calls to AI API |
| python-dotenv | Environment variables |
| pydantic | Data validation / schemas |
| uvicorn | ASGI server |

### Frontend (Both Apps)
| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS v3 | Utility styling |
| Shadcn/ui | Component library |
| Clerk React SDK | Authentication |
| React Router v6 | Routing |
| Axios | HTTP client |
| React Query (TanStack) | Server state management |
| Zustand | Client state (wallet, cart, etc.) |
| React Hook Form + Zod | Form validation |
| Lucide React | Icons |

### External Services
| Service | Purpose |
|---------|---------|
| Clerk | Authentication (Google OAuth + Email) |
| ImageKit | Image storage and CDN |
| Neon | PostgreSQL cloud database |
| AI API (TBD) | Image quality scan + price validation |

---

## 4. REPOSITORY STRUCTURE

### Repo 1: `ricemindai-backend`
```
ricemindai-backend/
├── app/
│   ├── main.py                  # FastAPI app entry point, CORS, routers
│   ├── database.py              # Neon async SQLAlchemy engine + session
│   ├── dependencies.py          # get_db, get_current_user (Clerk JWT verify)
│   ├── config.py                # Settings from .env
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── listing.py
│   │   ├── order.py
│   │   ├── contract.py
│   │   └── wallet.py
│   │
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── user.py
│   │   ├── listing.py
│   │   ├── order.py
│   │   ├── contract.py
│   │   └── wallet.py
│   │
│   ├── routers/                 # API route handlers
│   │   ├── auth.py              # Profile completion, role assignment
│   │   ├── listings.py          # CRUD listings
│   │   ├── orders.py            # Order placement, approval
│   │   ├── contracts.py         # Contract generation, signing
│   │   ├── wallet.py            # Wallet transactions, escrow
│   │   ├── ai.py                # AI image scan + price validation
│   │   ├── imagekit.py          # Signed URL generation for ImageKit
│   │   └── admin.py             # Admin-only routes
│   │
│   └── services/
│       ├── ai_service.py        # AI API call logic
│       ├── wallet_service.py    # Escrow logic
│       └── contract_service.py  # Contract building logic
│
├── alembic/                     # DB migrations
├── alembic.ini
├── .env
├── requirements.txt
└── README.md
```

### Repo 2: `ricemindai-frontend` (Port 5173 — Buyer/Seller)
```
ricemindai-frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── ui/                  # Shadcn components
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── listings/
│   │   │   ├── ListingCard.jsx
│   │   │   ├── ListingForm.jsx
│   │   │   └── ImageUploader.jsx
│   │   ├── orders/
│   │   │   ├── OrderCard.jsx
│   │   │   └── OrderModal.jsx
│   │   ├── contracts/
│   │   │   └── ContractViewer.jsx
│   │   └── wallet/
│   │       └── WalletCard.jsx
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── OnboardingPage.jsx   # Role + profile setup after Clerk signup
│   │   ├── seller/
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   ├── MyListings.jsx
│   │   │   ├── SellerOrders.jsx
│   │   │   └── SellerWallet.jsx
│   │   └── buyer/
│   │       ├── BuyerDashboard.jsx
│   │       ├── BrowseListings.jsx
│   │       ├── ListingDetail.jsx
│   │       ├── BuyerOrders.jsx
│   │       └── BuyerWallet.jsx
│   │
│   ├── store/
│   │   └── useStore.js          # Zustand global state
│   │
│   ├── hooks/
│   │   ├── useListings.js
│   │   ├── useOrders.js
│   │   └── useWallet.js
│   │
│   ├── lib/
│   │   ├── axios.js             # Axios instance with Clerk JWT header
│   │   └── utils.js
│   │
│   └── clerk/
│       └── ClerkProvider.jsx
│
├── .env
├── vite.config.js
└── package.json
```

### Repo 3: `ricemindai-admin` (Port 5174 — Admin)
```
ricemindai-admin/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersManagement.jsx  # List all buyers + sellers, delete
│   │   └── WalletManagement.jsx # Add funds to any user wallet
│   │
│   ├── components/
│   │   ├── UserTable.jsx
│   │   └── AddFundsModal.jsx
│   │
│   └── lib/
│       └── axios.js
│
├── .env
├── vite.config.js
└── package.json
```

---

## 5. DATABASE SCHEMA (Neon PostgreSQL)

### Table: `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      VARCHAR(255) UNIQUE NOT NULL,   -- Clerk user ID
  email         VARCHAR(255) UNIQUE NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  full_name     VARCHAR(255),
  role          VARCHAR(20) NOT NULL,            -- 'buyer' | 'seller' | 'admin'
  phone         VARCHAR(30),
  address       TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### Table: `listings`
```sql
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  rice_type       VARCHAR(100) NOT NULL,         -- e.g. Basmati, Jasmine, Brown
  suggested_price DECIMAL(10,2) NOT NULL,         -- seller's original input
  ai_validated_price DECIMAL(10,2),              -- AI suggested price
  final_price     DECIMAL(10,2) NOT NULL,         -- confirmed final price
  stock_kg        DECIMAL(10,2) NOT NULL,
  images          TEXT[] NOT NULL,               -- array of ImageKit URLs
  ai_quality_score DECIMAL(3,2),                 -- 0.00 to 1.00
  ai_quality_notes TEXT,
  status          VARCHAR(30) DEFAULT 'pending_approval',
  -- Status values:
  -- 'pending_approval' → submitted, waiting buyer/market approval
  -- 'approved'         → live on marketplace
  -- 'rejected'         → rejected
  -- 'sold_out'         → stock finished
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Table: `orders`
```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id        UUID REFERENCES users(id),
  seller_id       UUID REFERENCES users(id),
  listing_id      UUID REFERENCES listings(id),
  quantity_kg     DECIMAL(10,2) NOT NULL,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_amount    DECIMAL(10,2) NOT NULL,
  status          VARCHAR(30) DEFAULT 'placed',
  -- Status flow:
  -- 'placed'            → buyer placed order
  -- 'seller_approved'   → seller approved the order
  -- 'contract_sent'     → seller sent contract
  -- 'contract_signed'   → buyer signed/accepted contract
  -- 'payment_held'      → payment deducted from buyer, held in escrow
  -- 'shipped'           → seller marked as shipped
  -- 'delivered'         → buyer confirmed delivery
  -- 'completed'         → payment released to seller
  -- 'cancelled'         → order cancelled
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Table: `contracts`
```sql
CREATE TABLE contracts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES orders(id) UNIQUE,
  seller_id         UUID REFERENCES users(id),
  buyer_id          UUID REFERENCES users(id),
  transaction_id    VARCHAR(100) UNIQUE NOT NULL,  -- auto-generated ref
  delivery_days     INTEGER NOT NULL,               -- days for delivery
  delivery_deadline TIMESTAMP NOT NULL,             -- calculated deadline
  total_amount      DECIMAL(10,2) NOT NULL,
  terms             TEXT,                           -- additional terms
  contract_pdf_url  TEXT,                           -- optional future use
  seller_signed     BOOLEAN DEFAULT TRUE,           -- seller creates = auto signed
  buyer_signed      BOOLEAN DEFAULT FALSE,
  buyer_signed_at   TIMESTAMP,
  status            VARCHAR(30) DEFAULT 'pending_buyer',
  -- 'pending_buyer' → waiting for buyer to sign
  -- 'active'        → both signed
  -- 'completed'     → order done
  created_at        TIMESTAMP DEFAULT NOW()
);
```

### Table: `wallets`
```sql
CREATE TABLE wallets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) UNIQUE,
  balance     DECIMAL(10,2) DEFAULT 0.00,
  currency    VARCHAR(10) DEFAULT 'PKR',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Table: `wallet_transactions`
```sql
CREATE TABLE wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID REFERENCES wallets(id),
  user_id         UUID REFERENCES users(id),
  type            VARCHAR(30) NOT NULL,
  -- Types:
  -- 'credit'         → money added (by admin or release)
  -- 'debit'          → money deducted (payment)
  -- 'escrow_hold'    → held for order
  -- 'escrow_release' → released to seller after delivery
  amount          DECIMAL(10,2) NOT NULL,
  reference_id    UUID,                    -- order_id or contract_id
  description     TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

### Table: `escrow`
```sql
CREATE TABLE escrow (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) UNIQUE,
  buyer_id        UUID REFERENCES users(id),
  seller_id       UUID REFERENCES users(id),
  amount          DECIMAL(10,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'held',
  -- 'held'      → money is locked
  -- 'released'  → sent to seller
  -- 'refunded'  → returned to buyer
  held_at         TIMESTAMP DEFAULT NOW(),
  released_at     TIMESTAMP
);
```

---

## 6. AUTHENTICATION FLOW (CLERK)

### Setup
- Install `@clerk/clerk-react` in both frontend apps
- Use Clerk Dashboard to enable: **Google OAuth** and **Email/Password**
- Get `VITE_CLERK_PUBLISHABLE_KEY` from Clerk dashboard

### Flow Step by Step

#### Step 1: User Visits App (Port 5173)
- If not logged in → show Landing Page with "Sign In / Sign Up" button
- Clerk's `<SignIn />` or `<SignUp />` component handles everything

#### Step 2: After Clerk Sign Up / Sign In
- Clerk fires `user.created` or session becomes active
- Frontend checks: does this Clerk user exist in our `users` table?
- Call: `POST /api/auth/sync` with Clerk JWT token in header
  - Backend verifies JWT using Clerk's JWKS
  - If user doesn't exist in DB → create user with `profile_complete: false`
  - If user exists → return user data

#### Step 3: Profile Complete Check
```javascript
// In App.jsx after auth
if (user && !user.profile_complete) {
  navigate('/onboarding')
}
```

#### Step 4: Onboarding Page (`/onboarding`)
Fields to fill:
- Select Role: **Buyer** or **Seller** (radio buttons)
- Username (unique)
- Full Name
- Phone Number
- Address

On submit → `PUT /api/auth/complete-profile`
- Saves all info
- Sets `profile_complete: true`
- Creates wallet for user automatically
- Redirects to role-specific dashboard

#### Step 5: Role-Based Redirect
```javascript
if (role === 'seller') navigate('/seller/dashboard')
if (role === 'buyer') navigate('/buyer/dashboard')
```

### JWT Verification in FastAPI
```python
# dependencies.py
async def get_current_user(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    # Verify using Clerk JWKS endpoint
    # Extract clerk_id from token
    # Look up user in DB
    # Return user object
```

### Admin Auth (Port 5174)
- Admin also uses Clerk
- After login, backend checks if `role == 'admin'`
- If not admin → return 403 Forbidden
- Admin accounts are seeded manually in DB (not self-registered)

---

## 7. ROLE-BASED ACCESS CONTROL

All protected routes check the user's role from DB (not just JWT).

| Route Prefix | Allowed Roles |
|---|---|
| `/api/seller/*` | seller only |
| `/api/buyer/*` | buyer only |
| `/api/admin/*` | admin only |
| `/api/auth/*` | any authenticated user |
| `/api/listings` (GET) | buyer, seller |
| `/api/wallet/*` | buyer, seller (own wallet only) |

---

## 8. FEATURE BREAKDOWN BY STAKEHOLDER

### 8.1 SELLER FEATURES

#### A. Create Listing
**Page:** `/seller/create-listing`

**Form Fields:**
- Rice Name (text input)
- Description (textarea)
- Rice Type (dropdown: Basmati, Jasmine, Brown, Sella, Super Kernel, Broken, Other)
- Suggested Price per KG (number input, in PKR)
- Stock Available in KG (number input)
- Images (drag & drop upload, min 3, max 5)

**Listing Creation Flow:**
1. Seller fills form and uploads 3–5 images
2. Frontend uploads images to ImageKit (using signed URL from backend)
3. After upload, ImageKit URLs are sent to backend
4. Backend calls AI service:
   - Send images to AI for quality analysis
   - AI returns: quality score (0–1), quality notes, suggested price range
5. If seller's price is within AI suggested range → price validated ✅
6. If seller's price is outside range → show warning with AI suggestion, force seller to update price or confirm with reason
7. Final listing data saved with `status: 'pending_approval'`
8. Seller sees: "Your listing is pending buyer approval"

**Listing Status Display:**
- Pending Approval → yellow badge
- Approved → green badge, live on marketplace
- Rejected → red badge with reason

#### B. My Listings
**Page:** `/seller/my-listings`
- Table/cards of all listings with status, price, stock, date
- Can edit listing if still in `pending_approval`
- Cannot edit approved/live listings
- Can see AI quality report for each listing

#### C. Seller Orders
**Page:** `/seller/orders`
- List of all incoming orders from buyers
- Each order shows: buyer name, listing name, quantity, total, date
- For `placed` orders:
  - **Approve Order** button → changes status to `seller_approved`
  - **Reject Order** button → cancel order
- For `seller_approved` orders:
  - **Create Contract** button → opens contract form modal

#### D. Contract Creation
**Modal on:** `/seller/orders`

**Contract Form Fields (seller fills):**
- Delivery Duration (days) — number input
- Special Terms / Notes (optional textarea)
- Total Amount (auto-filled from order, read-only)
- Transaction ID (auto-generated by backend, shown read-only)

On Submit:
1. Backend generates unique `transaction_id` (format: `RMA-{timestamp}-{random6}`)
2. Contract saved with `status: 'pending_buyer'`
3. Order status → `contract_sent`
4. Buyer gets notification (or sees in dashboard)

#### E. Seller Wallet
**Page:** `/seller/wallet`
- Current balance
- Transaction history (escrow holds, releases, admin credits)
- Cannot withdraw (dummy system, no real bank)

#### F. Mark as Shipped
- After contract signed and payment held:
  - **Mark as Shipped** button appears
  - On click → order status → `shipped`
  - Buyer gets notification to confirm delivery

---

### 8.2 BUYER FEATURES

#### A. Browse Listings
**Page:** `/buyer/browse`
- Grid of all `approved` listings
- Filter by: rice type, price range, seller
- Search by name
- Each card shows: image, name, rice type, price/kg, seller name, stock
- Click → Listing Detail page

#### B. Listing Detail
**Page:** `/buyer/listing/:id`
- Image gallery (all listing images)
- Full description, rice type, price, stock
- AI quality score display (visual badge/meter)
- AI quality notes
- Seller info
- **Order Now** button

#### C. Listing Approval Flow
**Important:** Before a listing goes live, a buyer must approve it.

- There is a special section in buyer dashboard: **"Listings Pending Approval"**
- Any buyer can approve a pending listing
- On approval: listing status → `approved`, stored with `approved_by: buyer_id`
- This simulates "market validation" by actual buyers

#### D. Place Order
**Modal triggered from Listing Detail**

Fields:
- Quantity in KG (number input, max = available stock)
- Price per KG (read-only, auto-filled)
- Total Amount (auto-calculated)

On Submit:
1. Order created with `status: 'placed'`
2. Buyer sees order in their orders page

#### E. Buyer Orders
**Page:** `/buyer/orders`
- List of all buyer's orders with status timeline
- For `contract_sent` orders:
  - **View Contract** button → shows contract details
  - Contract shows: transaction_id, delivery deadline, total, terms
  - **Accept Contract** button → 
    1. Order status → `contract_signed`
    2. Payment deducted from buyer wallet
    3. Escrow record created with `status: 'held'`
    4. Order status → `payment_held`
    5. Seller sees payment is secured

- For `shipped` orders:
  - **Confirm Delivery** button →
    1. Order status → `delivered` then `completed`
    2. Escrow released → seller wallet gets credited
    3. Escrow status → `released`

#### F. Buyer Wallet
**Page:** `/buyer/wallet`
- Current balance (starts at 0, admin adds funds)
- Transaction history: debits (payments), escrow holds
- Cannot self-add funds (only admin can)

---

### 8.3 ADMIN FEATURES

**App:** Port 5174

#### A. Admin Dashboard
- Stats: total users, total sellers, total buyers, total listings, total orders
- Recent activity log

#### B. User Management
**Page:** `/admin/users`
- Table of all users (buyers + sellers)
- Columns: name, email, role, wallet balance, joined date, status
- **Delete User** button per row
  - Soft delete: sets `is_active: false`
  - Hard delete option with confirmation modal
- Search and filter by role

#### C. Wallet Management
**Page:** `/admin/wallets`
- Table of all wallets
- Search user by name/email
- **Add Funds** button → modal with:
  - Amount input (PKR)
  - Note/reason
  - Confirms and credits wallet
  - Transaction recorded as `type: 'credit'`

---

## 9. AI INTEGRATION

### What AI Does
1. **Image Quality Analysis** — Scans rice images and returns:
   - Quality score (0.00–1.00)
   - Quality notes (e.g., "Images show clean, uniform grains, good color")
   - Detected rice type (cross-check with seller's input)

2. **Price Validation** — Based on quality score and rice type, returns:
   - Suggested minimum price (PKR/kg)
   - Suggested maximum price (PKR/kg)
   - Verdict: `price_ok` | `price_too_high` | `price_too_low`
   - Message for seller

### AI Service (Backend)
```python
# services/ai_service.py

async def analyze_listing(images: list[str], rice_type: str, seller_price: float) -> dict:
    """
    images: list of ImageKit URLs
    rice_type: e.g. 'Basmati'
    seller_price: seller's input price per kg

    Returns:
    {
        "quality_score": 0.85,
        "quality_notes": "High quality grains...",
        "detected_type": "Basmati",
        "suggested_min_price": 180.0,
        "suggested_max_price": 220.0,
        "price_verdict": "price_ok",  # or price_too_high / price_too_low
        "price_message": "Your price is within the acceptable range."
    }
    """
```

### AI Provider (To Be Decided)
The AI router (`/api/ai/analyze`) is abstracted. The actual provider (OpenAI GPT-4 Vision, Gemini Vision, or Claude API) can be plugged into `ai_service.py` later. The interface/contract stays the same.

**Prompt Structure (for whichever AI is chosen):**
```
You are an expert rice quality analyst. 
Analyze the provided rice images and:
1. Give a quality score from 0.0 to 1.0
2. Write quality notes (grain uniformity, color, cleanliness)
3. Detect rice type from the images
4. Based on quality and rice type ({rice_type}), suggest a fair price range per KG in PKR
5. Compare with seller's price ({seller_price} PKR/kg) and give verdict

Respond in JSON format only.
```

---

## 10. IMAGEKIT INTEGRATION

### How It Works
- Images are uploaded from frontend directly to ImageKit
- Backend provides a signed authentication parameter for security

### Backend Route
```
GET /api/imagekit/auth
→ Returns: { token, expire, signature }
```

Backend uses `imagekitio-python` SDK:
```python
imagekit.get_authentication_parameters()
```

### Frontend Upload Flow
1. User selects images in `ImageUploader.jsx`
2. Frontend calls `GET /api/imagekit/auth` to get signed params
3. Frontend uploads image directly to ImageKit using their JS SDK or REST API
4. ImageKit returns the image URL
5. URL stored in component state
6. On listing submit, URLs array sent to backend

### ImageKit Folder Structure
```
/ricemindai/
  /listings/
    /{listing_id}/
      image_1.jpg
      image_2.jpg
      ...
```

### Environment Variables (ImageKit)
```
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

---

## 11. WALLET SYSTEM (DUMMY ESCROW)

### Rules
- All transactions are in PKR
- No real money moves anywhere — this is a simulation
- Admin is the only source of adding funds
- Buyers pay sellers through the platform only
- Payment is held in escrow until delivery confirmed

### Escrow Flow (Step by Step)
```
1. Buyer places order
2. Seller approves order
3. Seller creates contract
4. Buyer accepts contract
   → System checks: buyer wallet balance >= order total?
   → If NO: "Insufficient balance" error
   → If YES:
      a. Deduct from buyer wallet
      b. Create escrow record (status: held)
      c. Log wallet_transaction (type: escrow_hold)
5. Seller ships order → marks shipped
6. Buyer confirms delivery
   → Escrow record updated (status: released)
   → Add amount to seller wallet
   → Log wallet_transaction (type: escrow_release) for seller
   → Log wallet_transaction (type: credit) for seller wallet
7. Done.
```

### Wallet Balance Calculation
```python
# Always calculate from transactions, never store stale balance
# OR update balance column on every transaction (easier for dummy system)
# Use the simpler approach: update wallets.balance directly on each transaction
```

---

## 12. CONTRACT SYSTEM

### Contract Generation
When seller clicks "Create Contract":

**Backend auto-generates:**
- `transaction_id`: `RMA-{YYYYMMDD}-{random6chars}` e.g. `RMA-20250115-A3X9KP`
- `delivery_deadline`: `NOW() + delivery_days`

**Seller provides:**
- Delivery duration (days)
- Optional extra terms

**Contract Template (shown on frontend):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         RICE PURCHASE CONTRACT
         RiceMindAI Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transaction ID  : RMA-20250115-A3X9KP
Date            : January 15, 2025

SELLER          : Muhammad Ali (seller)
BUYER           : Ahmed Khan (buyer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT         : Super Kernel Basmati
QUANTITY        : 500 KG
PRICE/KG        : PKR 190.00
TOTAL AMOUNT    : PKR 95,000.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELIVERY        : Within 7 days
DEADLINE        : January 22, 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TERMS           : Payment held in escrow.
                  Released upon delivery confirmation.
                  [Optional seller terms here]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELLER SIGNED   : ✅
BUYER SIGNED    : ⏳ Pending
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 13. ORDER LIFECYCLE (COMPLETE FLOW)

```
[BUYER]                          [SELLER]                    [SYSTEM]
  │                                  │                           │
  │ Browse approved listings         │                           │
  │ Click "Order Now"                │                           │
  │ Fill quantity                    │                           │
  │ Submit order                     │                           │
  │ ──────────────────────────────────────────────────────────► │
  │                                  │                           │ Order created
  │                                  │                           │ status: 'placed'
  │                                  │◄──────────────────────── │
  │                                  │ See new order             │
  │                                  │ Click "Approve"           │
  │                                  │ ─────────────────────────►│
  │                                  │                           │ status: 'seller_approved'
  │                                  │ Fill contract form        │
  │                                  │ Submit contract           │
  │                                  │ ─────────────────────────►│
  │                                  │                           │ Contract created
  │                                  │                           │ transaction_id generated
  │                                  │                           │ status: 'contract_sent'
  │◄─────────────────────────────────────────────────────────── │
  │ See contract in orders           │                           │
  │ Review contract details          │                           │
  │ Click "Accept Contract"          │                           │
  │ ──────────────────────────────────────────────────────────► │
  │                                  │                           │ Check wallet balance
  │                                  │                           │ Deduct from buyer
  │                                  │                           │ Create escrow (held)
  │                                  │                           │ status: 'payment_held'
  │                                  │◄──────────────────────── │
  │                                  │ Payment secured notice    │
  │                                  │ Click "Mark Shipped"      │
  │                                  │ ─────────────────────────►│
  │                                  │                           │ status: 'shipped'
  │◄─────────────────────────────────────────────────────────── │
  │ See "Shipped" status             │                           │
  │ Receive delivery                 │                           │
  │ Click "Confirm Delivery"         │                           │
  │ ──────────────────────────────────────────────────────────► │
  │                                  │                           │ Escrow released
  │                                  │                           │ Seller wallet credited
  │                                  │                           │ status: 'completed'
  │                                  │◄──────────────────────── │
  │                                  │ Payment received 💰       │
```

---

## 14. API ENDPOINTS (FastAPI)

### Auth Routes (`/api/auth`)
```
POST   /api/auth/sync              → Sync Clerk user to DB (called on login)
PUT    /api/auth/complete-profile  → Save role, username, phone, address
GET    /api/auth/me                → Get current user profile
```

### Listing Routes (`/api/listings`)
```
GET    /api/listings               → Get all approved listings (buyer browsing)
GET    /api/listings/pending       → Get all pending listings (for buyer approval)
GET    /api/listings/mine          → Seller: get own listings
POST   /api/listings               → Seller: create new listing
PUT    /api/listings/{id}          → Seller: update listing (only if pending)
DELETE /api/listings/{id}          → Seller: delete own listing
POST   /api/listings/{id}/approve  → Buyer: approve a pending listing
```

### AI Routes (`/api/ai`)
```
POST   /api/ai/analyze             → Analyze images + validate price
  Body: { images: [url1, url2, ...], rice_type: str, seller_price: float }
  Returns: quality score, notes, price verdict
```

### ImageKit Routes (`/api/imagekit`)
```
GET    /api/imagekit/auth          → Get signed upload params for frontend
```

### Order Routes (`/api/orders`)
```
GET    /api/orders/buyer           → Buyer: get own orders
GET    /api/orders/seller          → Seller: get own incoming orders
POST   /api/orders                 → Buyer: place new order
PUT    /api/orders/{id}/approve    → Seller: approve order
PUT    /api/orders/{id}/reject     → Seller: reject order
PUT    /api/orders/{id}/ship       → Seller: mark as shipped
PUT    /api/orders/{id}/deliver    → Buyer: confirm delivery
```

### Contract Routes (`/api/contracts`)
```
GET    /api/contracts/{order_id}   → Get contract by order
POST   /api/contracts              → Seller: create contract
PUT    /api/contracts/{id}/sign    → Buyer: accept/sign contract (triggers payment hold)
```

### Wallet Routes (`/api/wallet`)
```
GET    /api/wallet/me              → Get own wallet balance
GET    /api/wallet/transactions    → Get own transaction history
```

### Admin Routes (`/api/admin`)
```
GET    /api/admin/users            → List all users
DELETE /api/admin/users/{id}       → Delete/deactivate user
GET    /api/admin/wallets          → List all wallets
POST   /api/admin/wallets/credit   → Add funds to any wallet
  Body: { user_id: uuid, amount: float, note: str }
GET    /api/admin/stats            → Platform statistics
```

---

## 15. ENVIRONMENT VARIABLES

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# AI (fill when decided)
AI_PROVIDER=openai  # or anthropic or gemini
AI_API_KEY=sk-...

# App
SECRET_KEY=your_random_secret
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Frontend `.env` (Port 5173)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
VITE_IMAGEKIT_PUBLIC_KEY=public_...
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### Admin `.env` (Port 5174)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

---

## 16. UI/UX GUIDELINES

### Design Theme
- **Color Palette:** Deep forest green (`#1a3d2b`) as primary, warm gold (`#c8922a`) as accent, off-white (`#faf7f0`) background
- **Typography:** Display font: Playfair Display (headings), Body: DM Sans
- **Style:** Premium agricultural marketplace — clean, trustworthy, modern

### Shadcn/ui Components to Use
- `Card` — listing cards, order cards, wallet display
- `Dialog` — order modal, contract modal, add funds modal
- `Table` — orders list, admin user list, transaction history
- `Badge` — listing status, order status
- `Form` + `Input` + `Textarea` — all forms
- `Select` — rice type dropdown
- `Tabs` — dashboard navigation
- `Toast` — success/error notifications
- `Progress` — AI quality score display
- `Separator` — section dividers

### Key UI States
Every list/table must handle:
- Loading state (skeleton)
- Empty state (friendly message + CTA)
- Error state (retry button)

### Responsive Design
- Mobile-first
- Sidebar collapses to bottom nav on mobile
- Tables scroll horizontally on small screens

---

## 17. IMPORTANT RULES & EDGE CASES

1. **Wallet Check Before Payment:** Always verify buyer has enough balance before allowing contract acceptance. Return clear error if insufficient.

2. **Stock Check on Order:** When buyer places order, check listing stock >= requested quantity. Deduct stock on `payment_held` status (not on order placement).

3. **One Contract Per Order:** A contract can only be created once per order. If seller tries to create again, return error.

4. **Listing Approval:** Any single buyer can approve a listing. First approval wins. No double approval.

5. **Seller Cannot Buy:** If a user registered as seller, they cannot place orders. Role is fixed after onboarding.

6. **Admin Cannot Be Registered:** Admin accounts must be seeded directly in DB. No signup flow for admin. Clerk creates the account, then manually set `role: 'admin'` in DB.

7. **Deleted Users:** When admin deletes a user, set `is_active: false`. Do not cascade delete orders/contracts (keep records).

8. **Image Validation (Frontend):** Before uploading, validate: file type is image (jpg/png/webp), file size < 5MB, count between 3–5.

9. **Price Validation UX:** If AI says price is wrong, show clear warning UI but do NOT block submission. Seller can override with acknowledgment checkbox: "I understand the AI suggestion and want to keep my price."

10. **Transaction ID Display:** Show transaction ID prominently in contract. Buyer uses this ID as reference when paying (even though payment is internal wallet).

11. **CORS Configuration:** FastAPI must allow both `http://localhost:5173` and `http://localhost:5174`.

12. **Clerk JWT on Every Request:** All protected API calls must send `Authorization: Bearer {clerkToken}` header. Use Axios interceptor in both frontends.

```javascript
// lib/axios.js
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

13. **Database Migrations:** Use Alembic. Run `alembic upgrade head` before starting server. Never auto-create tables in production.

14. **AI Failure Handling:** If AI service fails or times out, allow listing to proceed with a warning: "AI analysis unavailable. Listing will be reviewed manually." Set `ai_quality_score: null`.

---

## QUICK START SUMMARY

```
1. Clone both repos
2. Backend: pip install -r requirements.txt → alembic upgrade head → uvicorn app.main:app --reload
3. Frontend (5173): npm install → npm run dev
4. Admin (5174): npm install → npm run dev -- --port 5174
5. Set all env variables
6. Seed one admin user in DB manually
7. Test Clerk signup → onboarding → role selection flow first
```

---

*End of RiceMindAI PRD v1.0*
*Built for Claude Code / AI Agent implementation*
