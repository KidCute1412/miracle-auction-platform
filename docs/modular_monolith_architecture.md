# Modular Monolith Architecture Design

This document outlines the architecture for refactoring the [Backend](file:///D:/HCMUS/Third%20Year/Ultra%20Web%20Skills/ReflourishedOnlineAuction/Online-Auction/Backend) from the current MVC pattern to a Modular Monolith.

---

## 1. Directory Structure

The codebase will be reorganized by feature domains rather than technical layers:

```text
Backend/src/
├── config/                  # Global configurations
├── middlewares/             # Shared/global middlewares
├── helpers/                 # Shared helper functions
├── interfaces/              # Shared TypeScript interfaces
├── jobs/                    # Background jobs/cron schedules
├── modules/                 # Self-contained domain modules
│   ├── accounts/
│   │   ├── accounts.controller.ts
│   │   ├── accounts.service.ts
│   │   ├── accounts.model.ts
│   │   └── accounts.routes.ts
│   ├── bids/
│   │   ├── bids.controller.ts
│   │   ├── bids.service.ts
│   │   ├── bids.model.ts
│   │   └── bids.routes.ts
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.model.ts
│   │   └── products.routes.ts
│   └── users/
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.model.ts
│       └── users.routes.ts
└── server.ts                # App entrypoint
```

---

## 2. Core Components in Each Module

* **Routes (`*.routes.ts`)**: Defines the HTTP endpoints and maps them to controllers and route-specific middlewares.
* **Controllers (`*.controller.ts`)**: Parses HTTP requests, performs basic validation, and delegates business logic to services.
* **Services (`*.service.ts`)**: Encapsulates business logic, domain rules, and workflow orchestrations.
* **Models/Repositories (`*.model.ts`)**: Houses database queries using raw SQL.

---

## 3. Important Rules and Steps for Refactoring

### A. Strict Module Boundaries
* Modules must be as decoupled as possible.
* A controller in one module (e.g., `bids`) **must never** call a service or model in another module (e.g., `products`).
* Communication between modules should only happen via public service methods or interfaces.

### B. Business Logic Extraction
* Move database queries out of controller files into model/repository files.
* Remove business logic (e.g., validations, mail notifications, calculation) from controllers and place them into services.

### C. Phase-by-Phase Execution Order
1. **Define imports and path aliases:** Update `tsconfig.json` paths mapping if needed.
2. **Move one module at a time:** Begin with the least dependent module (e.g., `categories` or `users`), then move to complex ones (e.g., `products`, `bids`).
3. **Verify imports:** Relink local imports (`../../models` to `./bids.model`) and update server routes.
