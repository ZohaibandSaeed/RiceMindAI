# RiceMindAI
## Comprehensive Project Documentation
**Project Title:** RiceMindAI - AI-Powered B2B/B2C Rice Marketplace
**Document Type:** Final Project Documentation
**Version:** 2.0 (Extended and Detailed)
**Language:** English

---

## Abstract
The agricultural trade sector, particularly the buying and selling of rice, has traditionally been hindered by manual quality inspections, price manipulation, and a lack of trust between transacting parties. **RiceMindAI** is an advanced, AI-driven B2B and B2C marketplace platform explicitly built to solve these issues. By leveraging cutting-edge Artificial Intelligence for image-based quality analysis, secure digital contracts, and an integrated escrow wallet system, RiceMindAI provides a transparent, secure, and highly automated ecosystem for farmers, distributors, and buyers.

---

## Table of Contents
1. [Chapter 1: Introduction](#chapter-1-introduction)
2. [Chapter 2: System Architecture](#chapter-2-system-architecture)
3. [Chapter 3: Detailed Technology Stack](#chapter-3-detailed-technology-stack)
4. [Chapter 4: Authentication, Authorization, and Security](#chapter-4-authentication-authorization-and-security)
5. [Chapter 5: Comprehensive Database Schema Design](#chapter-5-comprehensive-database-schema-design)
6. [Chapter 6: Stakeholder Modules and Functional Requirements](#chapter-6-stakeholder-modules-and-functional-requirements)
7. [Chapter 7: Artificial Intelligence Integration](#chapter-7-artificial-intelligence-integration)
8. [Chapter 8: Escrow Wallet and Contract System](#chapter-8-escrow-wallet-and-contract-system)
9. [Chapter 9: API Design and Endpoints](#chapter-9-api-design-and-endpoints)
10. [Chapter 10: Conclusion and Future Scope](#chapter-10-conclusion-and-future-scope)
11. [List of Figures and Tables](#list-of-figures-and-tables)

---

## Chapter 1: Introduction

### 1.1 Problem Statement
In the conventional rice trading market, buyers face difficulties verifying the quality and exact type of rice (e.g., Basmati vs. Jasmine) before purchasing. Sellers often struggle to reach a broader market and guarantee that they will receive payment upon delivery. There is a mutual lack of trust, which necessitates a third-party mediator.

### 1.2 Proposed Solution (RiceMindAI)
RiceMindAI eliminates the need for manual mediators. It introduces an automated platform where Sellers can list their stock, which is instantly validated by a Computer Vision AI. The AI grades the quality of the rice grains and cross-references it with global market prices to suggest a fair trading price. Buyers can browse these AI-validated listings, place orders, and pay using an in-platform Escrow Wallet, which guarantees funds to the seller only upon successful delivery.

### 1.3 Core Objectives
- To digitize and automate the rice trading supply chain.
- To provide unbiased AI-driven quality grading for agricultural commodities.
- To secure financial transactions through a digital escrow system.
- To generate and enforce digital contracts between buyers and sellers.

---

## Chapter 2: System Architecture

The architecture of RiceMindAI follows a decoupled Client-Server model. This allows the frontend and backend to scale independently and ensures a separation of concerns.

### 2.1 The Client Layer
The client layer is divided into two separate applications to ensure that administrative tools and user-facing tools do not overlap, thereby increasing security.
1. **The Marketplace Application (Port 5173):** This app is used by both Buyers and Sellers. It handles listing creation, AI scanning feedback, marketplace browsing, and wallet management.
2. **The Admin Dashboard (Port 5174):** An exclusive portal designed solely for platform administrators. It provides a macroscopic view of the system, including user metrics, total transaction volumes, and the ability to inject virtual funds into user wallets.

### 2.2 The Backend Layer
The backend is powered by **FastAPI**. It acts as a monolithic RESTful API that handles all business logic. It securely processes JWT tokens sent by the frontend, queries the PostgreSQL database via asynchronous SQLAlchemy, formats data, and communicates with external services like ImageKit and the AI Vision API.

### 2.3 Data Flow Architecture
1. **Request Initiation:** The user interacts with the React frontend.
2. **Authentication:** The frontend fetches a JWT from Clerk and attaches it to the HTTP request header.
3. **API Processing:** FastAPI receives the request, passes it through a Dependency Injection layer to verify the JWT, and extracts the user's ID and Role.
4. **Database Query:** The backend queries Neon PostgreSQL asynchronously to fetch or mutate data.
5. **Response:** Data is serialized using Pydantic schemas and returned as a JSON response to the client.

---

## Chapter 3: Detailed Technology Stack

The technology stack was chosen based on modern industry standards, ensuring high performance, rapid development, and strict type safety.

### 3.1 Frontend Technologies
- **React 18:** The core library for building interactive, component-based user interfaces.
- **Vite:** A next-generation frontend tooling system that provides lightning-fast Hot Module Replacement (HMR) and optimized builds.
- **Tailwind CSS v3:** A utility-first CSS framework that allows for rapid UI styling directly within JSX.
- **Shadcn/ui:** A collection of re-usable, accessible, and highly customizable UI components (like Modals, Tables, and Dropdowns).
- **Zustand & React Query:** Used for global state management and server-state caching, respectively. React Query handles API loading states and data synchronization.
- **Clerk React SDK:** Provides drop-in components for seamless authentication and identity management.

### 3.2 Backend Technologies
- **FastAPI (Python):** A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
- **SQLAlchemy (Async):** The Python SQL toolkit and Object Relational Mapper that gives application developers the full power and flexibility of SQL.
- **Pydantic:** Data validation and settings management using Python type annotations.
- **Uvicorn:** An ASGI web server implementation for Python.

### 3.3 Database and External Services
- **Neon PostgreSQL:** A serverless, cloud-native PostgreSQL database that scales dynamically.
- **ImageKit:** A global Content Delivery Network (CDN) used for real-time image optimization, resizing, and secure storage of listing images.
- **Computer Vision API:** Used to process listing images, grade quality, and validate prices.

---

## Chapter 4: Authentication, Authorization, and Security

Security is a primary concern for any marketplace handling financial agreements. RiceMindAI offloads identity management to an industry leader while strictly controlling access within the backend.

### 4.1 Clerk Authentication Flow
1. A user visits the platform and chooses to Sign Up or Log In via Google OAuth or standard Email/Password credentials.
2. Clerk handles the cryptographic exchange, verifies the user, and sets a secure HTTP-only session or provides a JWT to the frontend.
3. Upon first login, the frontend sends a `POST /api/auth/sync` request. The backend verifies the JWT signature using Clerk's JSON Web Key Set (JWKS).
4. If the user's `clerk_id` does not exist in the database, a new record is created. The user is then forced through an onboarding process to select their role (Buyer/Seller) and complete their profile.

### 4.2 Role-Based Access Control (RBAC)
While Clerk handles *Authentication* (who the user is), the FastAPI backend strictly handles *Authorization* (what the user can do). 
- **Buyer Routes (`/api/buyer/*`):** Restricted entirely to users with the `buyer` role. Sellers and Admins attempting to access these routes receive a `403 Forbidden` response.
- **Seller Routes (`/api/seller/*`):** Restricted to the `seller` role. Buyers cannot create listings or manage stock.
- **Admin Routes (`/api/admin/*`):** Highly protected endpoints. Only accounts manually flagged as `admin` in the database can view system metrics or inject funds.

---

## Chapter 5: Comprehensive Database Schema Design

The Neon PostgreSQL database relies on relational integrity, utilizing Foreign Keys and cascading deletes to maintain a healthy data ecosystem.

### 5.1 The `users` Table
This table acts as the central hub for identity.
- `id` (UUID, Primary Key): Unique identifier generated by the database.
- `clerk_id` (VARCHAR): The unique string provided by Clerk Auth.
- `email`, `username`, `full_name` (VARCHAR): Standard user details.
- `role` (VARCHAR): Restricted to 'buyer', 'seller', or 'admin'.
- `profile_complete` (BOOLEAN): Flags whether the user has finished onboarding.

### 5.2 The `listings` Table
Stores all the inventory submitted by Sellers.
- `id` (UUID, Primary Key)
- `seller_id` (UUID, Foreign Key referencing `users(id)`)
- `name`, `description`, `rice_type` (VARCHAR/TEXT): Textual details of the product.
- `suggested_price` (DECIMAL): The price the seller originally wanted.
- `ai_validated_price` (DECIMAL): The fair price calculated by the AI.
- `final_price` (DECIMAL): The agreed-upon listing price.
- `stock_kg` (DECIMAL): Inventory quantity.
- `images` (TEXT ARRAY): Stores URLs pointing to ImageKit.
- `ai_quality_score` (DECIMAL): A grading metric from 0.0 to 1.0.
- `status` (VARCHAR): Can be 'pending_approval', 'approved', 'rejected', or 'sold_out'.

### 5.3 The `orders` and `contracts` Tables
- **`orders`:** Links a `buyer_id`, `seller_id`, and `listing_id`. Tracks the `quantity_kg` requested and the `total_amount`. Uses a status machine ('placed', 'seller_approved', 'contract_sent', 'contract_signed', 'shipped', 'delivered').
- **`contracts`:** Created when an order is approved by the seller. Includes legal terms (`delivery_days`, `terms`). It mandates boolean signatures (`seller_signed`, `buyer_signed`).

### 5.4 The `wallets`, `wallet_transactions`, and `escrow` Tables
- **`wallets`:** 1-to-1 relationship with `users`. Tracks the overall `balance`.
- **`wallet_transactions`:** An immutable ledger tracking every penny added or subtracted (`type`: credit, debit, escrow_hold, escrow_release).
- **`escrow`:** Tied to an `order_id`. Holds funds safely in a 'held' state until delivery, after which it transitions to 'released'.

---

## Chapter 6: Stakeholder Modules and Functional Requirements

### 6.1 The Seller Module
Sellers are the suppliers of the platform. Their dashboard provides comprehensive tools for inventory and sales management.
- **Inventory Creation:** Sellers upload images and provide details. They are immediately presented with the AI's feedback on their listing. If their price is drastically higher than the AI's estimation, the system forces a justification or adjustment.
- **Order Management:** Sellers view incoming orders in real-time. They can approve viable orders or reject them if logistics are impossible.
- **Contract Drafting:** Upon approving an order, the Seller specifies the delivery timeline and any special conditions, generating a digital contract for the Buyer.

### 6.2 The Buyer Module
Buyers fuel the economy of the platform.
- **Marketplace Discovery:** Buyers can filter listings by Rice Type (e.g., Basmati, Sella), Price Range, and AI Quality Score.
- **Community Approval:** To maintain market integrity, listings created by Sellers remain 'pending' until a Buyer visually approves them to go live.
- **Purchasing Workflow:** The Buyer places a quantity request. Once the Seller responds with a contract, the Buyer reviews the terms. Clicking "Sign & Accept" triggers a financial transaction where funds are moved from their wallet into the Escrow hold.

### 6.3 The Admin Module
Operating on a separate port (5174), the Admin module is the command center.
- **User Auditing:** Admins can view the profiles, roles, and wallet balances of every individual on the platform. They have the power to deactivate malicious users.
- **Virtual Economy Injection:** Because the platform uses dummy funds, the Admin acts as the central bank, injecting PKR into user wallets to facilitate testing and simulated trading.

---

## Chapter 7: Artificial Intelligence Integration

The integration of Artificial Intelligence transforms a standard marketplace into a "Smart" marketplace. The AI Service runs asynchronously to prevent blocking the main server thread.

### 7.1 Image Quality Assessment
When a listing is submitted, the backend extracts the ImageKit URLs and constructs a specialized prompt for the Vision AI. The AI analyzes the pixels to look for:
- **Grain Uniformity:** Are the grains of a consistent length and shape?
- **Coloration:** Are there signs of rot, excessive yellowness, or impurities?
- **Foreign Matter:** Does the batch contain stones, dust, or broken grains?

### 7.2 Price Validation Matrix
Based on the visual assessment, the AI generates a `quality_score`. The system combines this score with the declared `rice_type` and current market baselines to output a `suggested_min_price` and `suggested_max_price`. 
- **Verdict Generation:** The system compares the Seller's requested price against this range. It generates a verdict (e.g., `price_ok`, `price_too_high`) along with a human-readable message explaining the AI's reasoning.

---

## Chapter 8: Escrow Wallet and Contract System

The financial backbone of RiceMindAI is designed to eliminate fraud.

### 8.1 The Wallet Ledger
Instead of merely storing a single integer for a balance, the system relies on a Ledger. The `wallet_transactions` table records every movement of funds. A user's actual balance is always a reflection of the sum of their transactions, preventing race conditions or database manipulation.

### 8.2 The Escrow Lifecycle
1. **Contract Signing:** Buyer accepts the contract.
2. **Debit:** The backend verifies the Buyer has sufficient funds. It debits the `total_amount` from the Buyer's wallet.
3. **Escrow Hold:** An entry is made in the `escrow` table linking the funds to the specific `order_id`. The money is now in a state of limbo—neither the Buyer nor the Seller has it.
4. **Logistics:** The Seller ships the rice. The Buyer receives the physical goods and clicks "Confirm Delivery" on the platform.
5. **Release:** The backend updates the escrow status to `released`, credits the Seller's wallet, and marks the contract/order as `completed`.

---

## Chapter 9: API Design and Endpoints

The FastAPI backend utilizes modular routing. Below is a high-level overview of the critical endpoints.

- **Authentication (`/api/auth`)**
  - `POST /sync`: Synchronizes Clerk user with the PostgreSQL database.
  - `PUT /complete-profile`: Updates user metadata and role during onboarding.

- **Listings (`/api/listings`)**
  - `GET /`: Retrieves paginated, approved listings for the marketplace.
  - `POST /`: Creates a new listing (triggers AI validation).
  - `PUT /{id}/approve`: Allows a buyer to approve a pending listing.

- **Orders & Contracts (`/api/orders`, `/api/contracts`)**
  - `POST /orders`: Creates a new purchase request.
  - `POST /contracts`: Generates a digital contract linked to an order.
  - `POST /contracts/{id}/sign`: Processes the digital signature and triggers Escrow.

- **Wallet & Admin (`/api/wallet`, `/api/admin`)**
  - `GET /wallet/me`: Retrieves current balance and transaction history.
  - `POST /admin/wallets/add-funds`: Admin endpoint to inject dummy currency.

---

## Chapter 10: Conclusion and Future Scope

**Conclusion:**
RiceMindAI successfully achieves its goal of modernizing the agricultural commodity trade. By combining cutting-edge Vision AI for quality assurance, Clerk for seamless identity management, and a robust Escrow logic system, the platform establishes trust in a traditionally trustless environment. The decoupled React and FastAPI architecture ensures high performance and maintainability.

**Future Scope:**
- **Real Payment Gateways:** Transitioning the dummy wallet system to integrate with Stripe or local banking APIs for real-world fiat transactions.
- **Blockchain Contracts:** Migrating the internal database contracts to Smart Contracts on a blockchain (like Ethereum or Solana) for absolute immutability.
- **Logistics Integration:** Integrating with third-party courier APIs (e.g., DHL, TCS) to provide real-time GPS tracking of rice shipments directly within the dashboard.

---

## List of Figures and Tables

### Textual Description of Necessary Diagrams (For Future Creation)

- **Figure 1: High-Level System Architecture Diagram**
  *Details:* A 3-tier diagram. Top tier: Buyer/Seller React App (Port 5173) and Admin React App (Port 5174). Middle tier: FastAPI Backend serving routing and business logic. Bottom tier: Neon PostgreSQL (Database), ImageKit (Storage), and AI Vision Service. Arrows indicate REST API JSON communication.
  
- **Figure 2: Authentication and Role-Based Access Control Flow**
  *Details:* A sequence diagram. Actor (User) -> Clerk (Auth Provider) [Returns JWT] -> React App [Sends HTTP Header] -> FastAPI [Verifies JWKS] -> Database [Fetches Role]. 

- **Figure 3: Entity Relationship Diagram (ERD) of Database**
  *Details:* Visualizes the PostgreSQL schema. Central `users` table branching out to `listings` (1:N), `orders` (1:N), and `wallets` (1:1). The `orders` table has a 1:1 link to `contracts` and `escrow`.

- **Figure 4: Listing Creation and AI Validation Workflow**
  *Details:* A flowchart. Step 1: Seller inputs data & images. Step 2: Upload to ImageKit. Step 3: Backend triggers AI. Step 4: AI Decision Matrix (Is price within range?). Step 5: Save as Pending.

- **Figure 5: Escrow Payment and Contract Lifecycle Diagram**
  *Details:* A state machine diagram tracking an Order. States: `placed` -> `seller_approved` -> `contract_sent` -> `payment_held` (Escrow Active) -> `shipped` -> `delivered` (Escrow Released to Seller).

### Tables Included in Documentation
- **Table 1:** Technology Stack Summary (Chapter 3)
- **Table 2:** Role-Based Access Control matrix (Chapter 4)
- **Table 3:** Comprehensive breakdown of `users`, `listings`, and `orders` schemas (Chapter 5)
