# 🛒 Mini D-Mart — Grocery Store Application

A full-stack online grocery store. Customers browse products, fill a cart and place **home-delivery** or **store-pickup** orders. **Staff** prepare and dispatch orders, and **Admins** manage the catalogue, prices and every order.

- **Frontend:** React 19 + Vite (single-page app)
- **Backend:** Spring Boot REST API secured with JWT and role-based access
- **Database:** MySQL (created automatically on first run)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Configuration](#configuration)
6. [Default Accounts](#default-accounts)
7. [Roles & Access](#roles--access)
8. [Order Lifecycle](#order-lifecycle)
9. [REST API](#rest-api)
10. [Running Tests](#running-tests)
11. [Known Limitations & Roadmap](#known-limitations--roadmap)
12. [Author](#author)

---

## Features

### Customer
- Register and log in (new accounts are always created with the `CUSTOMER` role)
- Browse products by category (Grocery, Dairy, Beverages, Snacks, Personal Care, Home Care, Household, Pooja Needs)
- See **MRP, selling price and discount %** on every product
- Shopping cart that is saved in the browser between visits
- Checkout with **Home Delivery** (address required) or **Store Pickup** (choose a Today/Tomorrow time slot)
- Payment method selection: **COD, UPI or Card**
- Order confirmation page, **My Orders** history, and cancellation of orders that are still `PENDING`
- Profile page and customer dashboard

### Staff
- Staff dashboard with live stock quantities (low / out-of-stock highlighting)
- View all customer orders and move them through the order statuses
- Create, update and delete products

### Admin
- Admin dashboard with an overview (total / pending / delivered orders), a **Products** tab and an **Orders** tab
- Full product management: add, edit, delete, MRP / price / discount, stock, category, image
- View every order and change its status

### Built-in safeguards
- **Prices are always taken from the database**, never from the browser
- **Stock is row-locked while an order is placed**, so two simultaneous orders cannot oversell an item
- Cancelling an order **restocks** its items automatically
- Cancelled orders cannot be re-opened; delivered orders cannot be cancelled
- Other people's order ids return `404`, so they are not revealed
- Expired or invalid token → `401` and the frontend sends the user back to the login page

---

## Tech Stack

| Layer          | Technology |
| -------------- | ---------- |
| Frontend       | React 19, React Router 7, Axios, Vite 8, plain CSS per page/component, ESLint |
| Backend        | Java 17, Spring Boot 4, Spring Web MVC, Spring Data JPA (Hibernate), Spring Security, Bean Validation |
| Authentication | JWT (JJWT 0.11.5), BCrypt password hashing, stateless sessions |
| Database       | MySQL 8 (H2 in-memory for automated tests) |
| Build tools    | Maven (wrapper included), npm |

---

## Project Structure


miniD-mart/
├── backend/                         # Spring Boot REST API (port 8081)
│   ├── pom.xml
│   └── src/main/java/com/minidmart/backend/
│       ├── config/                  # SecurityConfig, CORS, DataInitializer (seed data)
│       ├── controller/              # Auth, Product, Order, Admin*, Staff* controllers
│       ├── service/                 # Business logic (OrderService, ProductService, AuthService, ...)
│       ├── repository/              # Spring Data JPA repositories
│       ├── entity/                  # User, Role, Product, Category, Order, OrderItem, ReturnExchangeRequest
│       ├── dto/                     # Request / response objects
│       ├── security/                # JwtUtils, JwtAuthFilter
│       └── exception/               # GlobalExceptionHandler + custom exceptions
│
└── frontend/                        # React + Vite app (port 5173)
    ├── .env.example
    └── src/
        ├── Pages/                   # Home, Products, Cart, Login, Register, MyOrders,
        │                            # Profile, UserDashboard, StaffDashboard, AdminDashboard, ...
        ├── Components/              # Header, Footer, Checkout, ProtectedRoute, ProductCatalog
        ├── context/                 # CartContext (cart state + localStorage)
        ├── Services/                # api.jsx (Axios + JWT interceptor), productPricing.js
        └── css/                     # Stylesheets


---

## Getting Started

### Prerequisites

| Tool    | Version |
| ------- | ------- |
| Java JDK | 17 or newer |
| Node.js  | 20.19+ or 22.12+ (required by Vite 8) |
| MySQL    | 8.x, running on `localhost:3306` |
| Git      | any recent version |

> Maven does **not** need to be installed — use the included `mvnw` / `mvnw.cmd` wrapper.

### 1. Clone the repository


git clone https://github.com/SwarupChoudhary2024/miniD-mart.git
cd miniD-mart


### 2. Start the backend

Make sure MySQL is running. The `mini_dmart` database is **created automatically**.

The default connection is user `root` / password `123456`. If yours is different, set it with environment variables (no file editing needed):


cd backend

# macOS / Linux
DB_USERNAME=root DB_PASSWORD=your_password ./mvnw spring-boot:run

# Windows (PowerShell)
$env:DB_PASSWORD="your_password"; .\mvnw.cmd spring-boot:run


On first start the app creates the tables, the roles, the default Admin and Staff accounts, and 12 demo products. The API is then available at **http://localhost:8081/api**.

### 3. Start the frontend

In a second terminal:


cd frontend
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run dev


Open **http://localhost:5173**.

### Production build (frontend)


npm run build      # output in frontend/dist
npm run preview    # serve the built app locally


---

## Configuration

### Backend — `backend/src/main/resources/application.properties`

Every value can be overridden with an environment variable.

| Environment variable | Default | Purpose |
| -------------------- | ------- | ------- |
| `DB_URL` | `jdbc:mysql://localhost:3306/mini_dmart?createDatabaseIfNotExist=true&...` | JDBC connection string |
| `DB_USERNAME` | `root` | Database user |
| `DB_PASSWORD` | `123456` | Database password |
| `JWT_SECRET` | *(development key)* | Token signing secret — **use your own random 32+ character value** |
| `JWT_EXPIRATION_MS` | `86400000` (24 h) | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:*,http://127.0.0.1:*` | Origins allowed to call the API |

`app.seed-sample-products=true` seeds demo products only when the products table is empty. Set it to `false` to start with an empty catalogue.

### Frontend — `frontend/.env`

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `VITE_API_URL` | `http://localhost:8081/api` | Base URL of the backend API |

---

## Default Accounts

Created automatically on first start (only if they do not already exist):

| Role  | Email             | Password   |
| ----- | ----------------- | ---------- |
| Admin | `admin@gmail.com` | `admin123` |
| Staff | `staff@gmail.com` | `staff123` |

Customers sign up from the **Register** page.

> ⚠️ These are demo credentials. **Change them (and `JWT_SECRET` / `DB_PASSWORD`) before deploying anywhere public.**

---

## Roles & Access

| Area                              | Public | Customer | Staff | Admin |
| --------------------------------- | :----: | :------: | :---: | :---: |
| Browse products                   | ✅ | ✅ | ✅ | ✅ |
| Cart, checkout, my orders         |    | ✅ | ✅ | ✅ |
| Customer dashboard (`/user`)      |    | ✅ |    |    |
| Staff dashboard (`/staff`)        |    |    | ✅ |    |
| Admin dashboard (`/admin`)        |    |    |    | ✅ |
| Create / edit / delete products   |    |    | ✅ | ✅ |
| Update order status               |    |    | ✅ | ✅ |

Access is enforced **on the server** (Spring Security) as well as in the React routes.

---

## Order Lifecycle


PENDING → PREPARING → READY → DISPATCHED → DELIVERED → COMPLETED
   │
   └──────────────────────────► CANCELLED   (stock is restored)


- Order types: `DELIVERY` (needs an address) or `PICKUP` (needs a time slot)
- Payment methods: `COD`, `UPI`, `CARD`
- A customer can cancel only while the order is `PENDING`; staff/admin can cancel until it is delivered

---

## REST API

Base URL: `http://localhost:8081/api`. Protected endpoints need the header `Authorization: Bearer <token>` (returned by login).

### Authentication
| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| POST | `/auth/register` | Public | Create a customer account |
| POST | `/auth/login` | Public | Log in, returns JWT + user details |

### Products
| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| GET | `/products` | Public | List all products |
| GET | `/products/{id}` | Public | Get one product |
| GET | `/products/category/{category}` | Public | Products in a category |
| POST | `/products` | Staff / Admin | Add a product |
| POST | `/products/bulk` | Staff / Admin | Add many products at once |
| PUT | `/products/{id}` | Staff / Admin | Update a product |
| DELETE | `/products/{id}` | Staff / Admin | Delete a product |
| GET / POST / PUT / DELETE | `/admin/products[/{id}]` | Admin | Admin product management |

### Orders
| Method | Endpoint | Access | Description |
| ------ | -------- | ------ | ----------- |
| POST | `/orders` | Logged in | Place an order |
| GET | `/orders/my` | Logged in | My orders (newest first) |
| GET | `/orders/{id}` | Logged in | One order (own orders only for customers) |
| PATCH | `/orders/{id}/cancel` | Logged in | Cancel my `PENDING` order |
| GET | `/staff/orders` | Staff / Admin | All orders |
| PUT | `/staff/orders/{id}/status` | Staff / Admin | Change order status |
| GET | `/admin/orders` | Admin | All orders (admin view) |
| PATCH | `/admin/orders/{orderId}/status` | Admin | Change order status |

**Example — place an order**


POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderType": "DELIVERY",
  "deliveryAddress": "12 MG Road, Indore",
  "paymentMethod": "COD",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 4, "quantity": 1 }
  ]
}


Errors are returned as JSON: `{ "status": 400, "error": "...", "message": "..." }`.

---

## Running Tests


cd backend
./mvnw test          # Windows: .\mvnw.cmd test


Tests run against an in-memory H2 database, so MySQL is **not** required.

---

## Known Limitations & Roadmap

- Payment is recorded as a method only — no real payment gateway is integrated yet
- Return / Exchange has data models and a service in the backend, but **no REST endpoints or UI yet**
- No user-management screen for admins (users register themselves; Admin/Staff accounts are seeded)
- Product images are stored as text (base64) in the database — a file/cloud storage solution would scale better
- Test coverage is minimal (a single context-load test); unit and API tests for orders and security are a good next step
- Ideas: order e-mail/SMS notifications, product search and filters, pagination, Docker Compose setup, CI pipeline

---

## Author

**Swarup Choudhary** — [github.com/SwarupChoudhary2024](https://github.com/SwarupChoudhary2024)