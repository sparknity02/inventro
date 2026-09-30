# Inventro — Sparknity Inventory Management System

A modern, production-ready full-stack Inventory Management System built with **Java 25**, **Spring Boot**, **MySQL**, **Spring Cloud Netflix Eureka**, and **React + Vite**.

---

## 1. Overview

**Inventro** enables businesses to effortlessly manage stock items, maintain supplier relationships, identify low-stock items before they run out, search and filter inventory, and monitor overall inventory valuation via a streamlined dashboard.

---

## 2. Tech Stack

- **Backend:** Java 25, Spring Boot 4.x / 3.x, Maven, Spring Web, Spring Data JPA, Hibernate, Jakarta Validation, Springdoc OpenAPI (Swagger), Eureka Client
- **Service Discovery:** Spring Cloud Netflix Eureka Server
- **Database:** MySQL (`inventory_db`)
- **Testing:** JUnit 5, Mockito
- **Frontend:** React 19, Vite, Axios, React Router v7, Vanilla CSS Design System

---

## 3. Architecture

```text
                 ┌─────────────────────────────────┐
                 │          React + Vite           │
                 │         Frontend (:5173)        │
                 │                                 │
                 │  Dashboard │ Items │ Suppliers  │
                 │          Low Stock              │
                 └────────────────┬────────────────┘
                                  │
                             REST / JSON
                                  │
                                  ▼
                 ┌─────────────────────────────────┐
                 │       Spring Boot Backend       │
                 │     inventory-service (:8080)   │
                 │                                 │
                 │  Controller │ Service │ DTO     │
                 │  Repository │ Exception Handler │
                 └────────────────┬────────────────┘
                                  │
                            JPA / Hibernate
                                  │
                                  ▼
                        ┌──────────────────┐
                        │      MySQL       │
                        │ inventory_db     │
                        │     (:3306)      │
                        └──────────────────┘

                                  ▲
                                  │ Service Discovery
                                  │
                        ┌──────────────────┐
                        │  Eureka Server   │
                        │     (:8761)      │
                        └──────────────────┘
```

---

## 4. Key Features

- **Item Management (CRUD):** Add, update, view, and delete inventory items with name, category, quantity, price, and supplier.
- **Supplier Management (CRUD):** Manage vendors with phone and email validation. Cleanly protects against accidental deletion of suppliers with active items.
- **Item-Supplier Relationship:** 1-to-N mapping cleanly linked via foreign keys and DTO responses.
- **Search & Category Filtering:** Instant search by name and filtering by category.
- **Low-Stock Detection:** Real-time query for items with stock below a configurable threshold (default < 10 units), highlighted with visual alerts.
- **Summary Dashboard:** High-level metrics for Total Items, Total Suppliers, Low-Stock Count, and Total Inventory Valuation (sum of quantity × price).
- **Validation:** Jakarta Validation (`@NotBlank`, `@Min`, `@Positive`, `@Email`) with structured 400 Bad Request error feedback.
- **Centralized Exception Handling:** `@RestControllerAdvice` delivering clean JSON errors without stack traces.
- **Service Discovery:** Automatic registration with Spring Cloud Netflix Eureka Server.
- **API Documentation:** Interactive Swagger UI documentation.
- **Unit Testing:** JUnit 5 and Mockito coverage for core business services.
- **Preloaded Sample Data:** Automatic seeding on initial launch for realistic demonstration.

---

## 5. Ports & Services

| Service | Port | URL |
| :--- | :--- | :--- |
| **MySQL Database** | `3306` | `localhost:3306/inventory_db` |
| **Eureka Server** | `8761` | [http://localhost:8761](http://localhost:8761) |
| **Backend API** | `8080` | [http://localhost:8080/api](http://localhost:8080/api) |
| **Swagger UI** | `8080` | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |
| **React Frontend** | `5173` | [http://localhost:5173](http://localhost:5173) |

---

## 6. API Endpoints

### Items
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/items` | List items (supports optional `name`, `category`, `page`, `size`) |
| `GET` | `/api/items/search?name={name}` | Search items by name |
| `GET` | `/api/items/low-stock?threshold={n}` | Items below stock threshold (default 10) |
| `GET` | `/api/items/categories` | List distinct item categories |
| `GET` | `/api/items/{id}` | Get item by ID |
| `POST` | `/api/items` | Create item (201 Created) |
| `PUT` | `/api/items/{id}` | Update item |
| `DELETE` | `/api/items/{id}` | Delete item (204 No Content) |

### Suppliers
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/suppliers` | List all suppliers |
| `GET` | `/api/suppliers/{id}` | Get supplier by ID |
| `POST` | `/api/suppliers` | Create supplier (201 Created) |
| `PUT` | `/api/suppliers/{id}` | Update supplier |
| `DELETE` | `/api/suppliers/{id}` | Delete supplier (204 No Content) |

### Dashboard
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Aggregated statistics (total items, suppliers, low stock, value) |

---

## 7. Setup & Execution Guide

### Step 1: Ensure MySQL is Running
Make sure MySQL is running on port 3306 with database `inventory_db`:
```bash
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS inventory_db;"
```
*(Default credentials are `root` / `root`. You can override with `DB_USERNAME` and `DB_PASSWORD` environment variables.)*

### Step 2: Start Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
```
Visit Eureka dashboard at [http://localhost:8761](http://localhost:8761).

### Step 3: Start Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will start on port 8080 and register itself as `INVENTORY-SERVICE` on Eureka.
Swagger UI is accessible at: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html).

### Step 4: Run Unit Tests
```bash
cd backend
mvn test
```

### Step 5: Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 8. Application Walkthrough & Features

1. Open the **Dashboard** at `http://localhost:5173/` to see initial metrics and low-stock warnings.
2. Navigate to **Suppliers** (`/suppliers`) to view, add, or edit vendors.
3. Navigate to **Items** (`/items`) to view stock, search items by name, filter by category, or create a new item.
4. Navigate to **Low Stock** (`/low-stock`) to review items below 10 units and test updating their quantity.
5. Attempt to delete a supplier that has associated items to verify graceful error handling (409 Conflict).
