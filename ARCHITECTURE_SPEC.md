# Inventro — Architecture Specification & Diagram Blueprint

This document defines the exact architecture, components, ports, and data flow of the **Sparknity Inventro** Inventory Management System. It can be used as a design reference or fed directly into diagram tools and image generators.

---

## 1. High-Level Architectural Flow

```text
                             ┌───────────────────────────────────┐
                             │           Eureka Server           │
                             │      (Spring Cloud Netflix)       │
                             │          (:8761 Dashboard)        │
                             └─────────────────▲─────────────────┘
                                               │
                                               │ Heartbeat / Registration
                                               │ (Status: UP)
┌───────────────────────────┐        ┌─────────┴─────────────────────────┐
│       React + Vite        │        │        Spring Boot Backend        │
│         Frontend          │        │         inventory-service         │
│         (:5173)           │        │              (:8080)              │
│                           │        │                                   │
│ • Dashboard               │ =====> │ • Controllers (REST API)          │
│ • Items                   │  REST  │ • DTOs (Request / Response)       │
│ • Suppliers               │  JSON  │ • Services (Business Logic)       │
│ • Low Stock               │ <===== │ • Repositories (Spring Data JPA)  │
│                           │        │ • Entities (Item, Supplier)       │
└───────────────────────────┘        └─────────────────┬─────────────────┘
                                                       │
                                                       │ JPA / Hibernate ORM
                                                       │ SQL Queries
                                                       ▼
                                     ┌───────────────────────────────────┐
                                     │           MySQL Database          │
                                     │            inventory_db           │
                                     │         (localhost:3306)          │
                                     └───────────────────────────────────┘
```

---

## 2. Component Specifications

### Block 1: Frontend (Client Layer)
- **Role:** Single Page Application (SPA)
- **Tech Stack:** React 19, Vite, Axios, React Router v7, Vanilla CSS
- **Port / URL:** `http://localhost:5173`
- **Pages & Views:**
  - `Dashboard`: 4 summary metrics (Total Items, Total Suppliers, Low Stock Items, Inventory Valuation) + live low-stock alerts table.
  - `Items`: Full CRUD, real-time search, category dropdown filter, and deletion confirmation modal.
  - `Suppliers`: Vendor CRUD, contact validation (phone, email), and foreign-key safe deletion protection.
  - `Low Stock`: Configurable threshold filter (`< 5`, `< 10`, `< 15`, `< 25`) with warning badges and instant restock action.

---

### Block 2: Backend (Application & Business Logic Layer)
- **Role:** Core REST API & Eureka Client
- **Tech Stack:** Java 25, Spring Boot, Maven, Spring Web, Spring Data JPA, Hibernate, Jakarta Validation
- **Port / URL:** `http://localhost:8080`
- **Application Name:** `inventory-service`
- **Internal Layered Architecture (Top to Bottom):**
  1. **Controllers (REST API):**
     - `ItemController` (`/api/items`, `/api/items/search`, `/api/items/low-stock`, `/api/items/categories`)
     - `SupplierController` (`/api/suppliers`)
     - `DashboardController` (`/api/dashboard`)
  2. **DTOs (Data Transfer Objects):**
     - `ItemRequest`, `ItemResponse`
     - `SupplierRequest`, `SupplierResponse`
     - `DashboardResponse`
  3. **Services (Business Logic):**
     - `ItemService`
     - `SupplierService`
     - `DashboardService`
  4. **Repositories (Data Access):**
     - `ItemRepository` (Spring Data JPA)
     - `SupplierRepository` (Spring Data JPA)
  5. **Entities (JPA Models):**
     - `Item`
     - `Supplier`
     - *Relationship:* `Supplier (1) ───< (N) Item` via `@ManyToOne` foreign key `supplier_id`
- **Cross-Cutting Modules:**
  - **Swagger / OpenAPI:** Interactive UI documentation at `/swagger-ui/index.html`.
  - **Validation:** Jakarta Bean Validation (`@NotBlank`, `@Min`, `@Positive`, `@Email`).
  - **Global Exception Handling:** `@RestControllerAdvice` mapping 400 Bad Request, 404 Not Found, and 409 Conflict.
  - **CORS Configuration:** `CorsConfig` allowing origins `http://localhost:5173` and `http://127.0.0.1:5173`.
  - **Data Seeder:** `DataInitializer` populates 4 suppliers and 8 sample items on initial startup.

---

### Block 3: Service Discovery (Registry Layer)
- **Role:** Centralized Service Registry
- **Tech Stack:** Spring Cloud Netflix Eureka Server
- **Port / URL:** `http://localhost:8761`
- **Application Name:** `eureka-server`
- **Behavior:** Receives heartbeat pings and auto-registers `INVENTORY-SERVICE` with status `UP`.

---

### Block 4: Database (Persistence Layer)
- **Role:** Relational Data Storage
- **Tech Stack:** MySQL 8.x
- **Port:** `3306`
- **Database Name:** `inventory_db`
- **Credentials:** Default `root / root` (configurable via `${DB_USERNAME}`, `${DB_PASSWORD}`)
- **Primary Tables:**
  - `suppliers` (`id`, `name`, `phone`, `email`, `created_at`, `updated_at`)
  - `items` (`id`, `name`, `category`, `quantity`, `price`, `supplier_id`, `created_at`, `updated_at`)

---

## 3. Communication & Connection Rules

| Source | Destination | Protocol / Type | Description |
| :--- | :--- | :---: | :--- |
| **Frontend** | **Backend (Controllers)** | HTTP / REST | JSON requests (`GET`, `POST`, `PUT`, `DELETE`) |
| **Backend (Controllers)** | **Frontend** | HTTP / JSON | Status codes & JSON payloads (`200 OK`, `201 Created`, `204 No Content`, `400`, `404`, `409`) |
| **Backend (Repositories)** | **MySQL Database** | JDBC / TCP | JPA & Hibernate ORM mapping, SQL query execution |
| **Backend (`inventory-service`)** | **Eureka Server** | HTTP Heartbeat | Periodic service registration & discovery ping (Status: UP) |

> ⚠️ **Key Architectural Constraint:** The Frontend communicates **only** with the Backend (`:8080`). There is **no direct connection** between the React Frontend and the Eureka Server (`:8761`).

---

## 4. Mermaid Diagram (For GitHub & Markdown Viewers)

```mermaid
graph TD
    subgraph Client["Client Layer (:5173)"]
        UI["React 19 + Vite Frontend<br/>• Dashboard<br/>• Items<br/>• Suppliers<br/>• Low Stock"]
    end

    subgraph ServiceDiscovery["Discovery Layer (:8761)"]
        EUREKA["Eureka Server<br/>(Spring Cloud Netflix)"]
    end

    subgraph Backend["Application Layer (:8080)"]
        direction TB
        CTRL["Controllers (REST API)<br/>Item, Supplier, Dashboard"]
        DTO["DTOs (Request / Response)"]
        SVC["Services (Business Logic)<br/>ItemService, SupplierService, DashboardService"]
        REPO["Repositories (Spring Data JPA)<br/>ItemRepository, SupplierRepository"]
        ENT["Entities (JPA / Hibernate)<br/>Item (N) <---> (1) Supplier"]
        
        CTRL --> DTO
        DTO --> SVC
        SVC --> REPO
        REPO --> ENT
    end

    subgraph Database["Persistence Layer (:3306)"]
        MYSQL[("MySQL Database<br/>inventory_db")]
    end

    UI -->|HTTP REST / JSON Requests| CTRL
    CTRL -->|JSON Responses| UI
    ENT <-->|JPA / Hibernate ORM & SQL Queries| MYSQL
    Backend -.->|Heartbeat Registration (Status: UP)| EUREKA

    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef backend fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
    classDef discovery fill:#f3e8ff,stroke:#9333ea,stroke-width:2px;
    classDef db fill:#fee2e2,stroke:#dc2626,stroke-width:2px;

    class UI client;
    class CTRL,DTO,SVC,REPO,ENT backend;
    class EUREKA discovery;
    class MYSQL db;
```

---

## 5. Visual Layout & Diagram Description

```text
A clean, professional modern software architecture diagram for "Inventro - Sparknity Inventory Management System".

Layout Structure:
1. Left Block (Blue Theme): "Frontend (React JS + Vite)" running on "http://localhost:5173" showing pages: Dashboard, Items, Suppliers, Low Stock.
2. Center Block (Green Theme): "Inventory Service (Spring Boot)" running on "http://localhost:8080" with 5 internal stacked layers:
   - Controllers (REST API)
   - DTOs (Request / Response Objects)
   - Services (Business Logic)
   - Repositories (Spring Data JPA)
   - Entities (Item, Supplier)
   On the side of this block are badges for Swagger OpenAPI (/swagger-ui/index.html), Jakarta Validation, Global Exception Handling (@RestControllerAdvice), and CORS Configuration.
3. Top Block (Purple Theme): "Eureka Server (Service Discovery)" on "http://localhost:8761". A dashed purple arrow connects ONLY from the Spring Boot Inventory Service up to Eureka Server labeled "Service Registration & Heartbeat". Frontend does NOT connect to Eureka.
4. Bottom Block (Red/Pink Theme): "MySQL Database" (inventory_db on port 3306), connected to the Spring Boot backend via a bi-directional arrow labeled "JPA / Hibernate ORM & SQL Persistence".
5. Horizontal bi-directional arrows between Frontend and Backend labeled "HTTP REST API (JSON)".

Style: Crisp vectors, modern enterprise software blueprint, clear typography, no cluttered overlaps, professional color palette.
```
