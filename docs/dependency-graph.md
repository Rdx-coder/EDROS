# EDROS Module Dependency Boundaries Graph

In Clean Architecture, **the Dependency Rule is absolute**: Source code dependencies must only point inwards, towards the **Domain Layer**. Nothing in the Domain Layer can know anything at all about anything in the outer layers (Infrastructure, Presentation, Databases, Web Frameworks).

Below is the conceptual structure showing the flow of control versus the direction of dependencies.

## 1. Architectural Layers & Boundaries

```
                    ┌──────────────────────────────┐
                    │      PRESENTATION LAYER      │
                    │   - Express API Controllers  │
                    │   - Route Handlers           │
                    │   - HTTP Middlewares (RBAC)  │
                    └──────────────┬───────────────┘
                                   │
                                   │ (Uses)
                                   ▼
                    ┌──────────────────────────────┐
                    │      APPLICATION LAYER       │
                    │   - Use Case Services        │
                    │   - Transaction boundaries   │
                    │   - Business Flow control    │
                    └──────────────┬───────────────┘
                                   │
                                   │ (Refers to)
                                   ▼
                    ┌──────────────────────────────┐
                    │         DOMAIN LAYER         │
                    │   - Pure Entities (Types)    │
                    │   - Repository Contracts     │ (Interfaces)
                    └──────────────▲───────────────┘
                                   │
                                   │ (Implements - DEPENDENCY INVERSION!)
                                   │
                    ┌──────────────┴───────────────┐
                    │     INFRASTRUCTURE LAYER     │
                    │   - Relational Repositories  │
                    │   - Redis Caching Adapters   │
                    │   - Structured Logger        │
                    │   - Cloud Notification APIs  │
                    └──────────────────────────────┘
```

## 2. Dependency Inversion in Action (SOLID)

In traditional systems, the service layer depends directly on the database repository (meaning the business logic is tied to SQL or specific tables). 

In **EDROS**, we apply the **Dependency Inversion Principle**:
1. The **Domain Layer** defines the `IDebtCaseRepository` interface.
2. The **Application Layer** use cases reference only `IDebtCaseRepository` to query data.
3. The **Infrastructure Layer** implements the actual `InMemoryDebtCaseRepository` or `PostgresDebtCaseRepository` by satisfying the interface.
4. During application boot-up inside `server.ts`, the **DI Container** wires the infrastructure adapter into the use-case service.
5. This ensures the Core Domain remains pristine, highly testable (we can swap Postgres for In-Memory mock in milliseconds), and free of infrastructure concerns.

## 3. Request Flow Pipeline

```
Client Request ──► Security Headers ──► Rate Limiter ──► Auth JWT ──► RBAC Check ──► Controller ──► Use Case ──► Domain Repo ──► Postgres
```
