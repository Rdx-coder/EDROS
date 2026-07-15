# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-ARCH-005
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 1: ENTERPRISE SOLUTION ARCHITECTURE

```
================================================================================
              E N T E R P R I S E   A R C H I T E C T U R E
                         B I B L E   C O R E
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       Chief Enterprise Architect (CEA)
Co-Authors:   Principal Solution Architect, Principal Security Architect
Reviewer:     Principal Cloud Architect, Principal DevOps Lead
Approver:     Chief Technology Officer & Architecture Review Board
================================================================================
```

---

## REVISION HISTORY

| Version | Date | Summary of Key Changes | Author | Approver |
| :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | Baseline publication of the Enterprise Solution Architecture Blueprint. | Chief Enterprise Architect | CTO & Steering Committee |

---

## TABLE OF CONTENTS

1. [EXECUTIVE SUMMARY & SYSTEM SCOPE](#1-executive-summary--system-scope)
2. [ARCHITECTURE VISION & OBJECTIVES](#2-architecture-vision--objectives)
3. [ARCHITECTURE PRINCIPLES & CRITERIA](#3-architecture-principles--criteria)
4. [BUSINESS ARCHITECTURE & VALUE CHAINS](#4-business-architecture--value-chains)
5. [APPLICATION ARCHITECTURE & LOGICAL MODEL](#5-application-architecture--logical-model)
6. [TECHNOLOGY ARCHITECTURE & SYSTEM STACK](#6-technology-architecture--system-stack)
7. [DATA ARCHITECTURE & RECOVERY LEDGERS](#7-data-architecture--recovery-ledgers)
8. [INFRASTRUCTURE & ENVIRONMENT SCHEMATICS](#8-infrastructure--environment-schematics)
9. [SECURITY & COMPLIANCE ARCHITECTURE](#9-security--compliance-architecture)
10. [DEPLOYMENT & RELEASING TOPOLOGY](#10-deployment--releasing-topology)
11. [SCALABILITY, RESILIENCE & RELIABILITY STRATEGY](#11-scalability-resilience--reliability-strategy)
12. [DISASTER RECOVERY & DISRUPTION PLAN](#12-disaster-recovery--disruption-plan)
13. [ARCHITECTURE CONSTRAINTS & TRADE-OFFS](#13-architecture-constraints--trade-offs)
14. [KEY ARCHITECTURAL DECISIONS & MATRIX](#14-key-architectural-decisions--matrix)
15. [ARCHITECTURE RISKS & MITIGATION MATRIX](#15-architecture-risks--mitigation-matrix)
16. [ARCHITECTURE GOVERNANCE & COMPLIANCE](#16-architecture-governance--compliance)
17. [ARCHITECTURE REVIEW CHECKLIST](#17-architecture-review-checklist)
18. [GLOSSARY & REFERENCES](#18-glossary--references)

---

## 1. EXECUTIVE SUMMARY & SYSTEM SCOPE

### 1.1 Executive Summary
The Enterprise Debt Recovery Operating System (EDROS) is the official core platform designed by Sanjay Dangi Associates to automate, digitize, and optimize the highly regulated end-to-end debt collection and recovery lifecycle. 

Historically, financial recovery operations have been fragmented across legacy Core Banking Systems (CBS), disconnected collection agency CRM software, manual spreadsheets, and offline law networks. This fragmentation leads to operational inefficiencies, a lack of process auditability, high write-off ratios, and risk of non-compliance with regulatory frameworks such as the Reserve Bank of India (RBI) directives on Fair Practices and the Digital Personal Data Protection (DPDP) Act.

EDROS introduces a unified, robust, full-stack enterprise architecture that acts as a secure, audited layer between financial creditors (banks, NBFCs, ARCs) and field/legal recovery channels. It provides core modules for automated portfolio ingestion, geofenced staff geotracking, intelligent settlement calculators, legal notices generation, and secure watermarked document vaulting.

This document serves as the high-level Enterprise Solution Architecture blueprint, defining the structural patterns, integration routes, database topologies, cloud environments, and security safeguards required to support high-throughput, legally defensible debt recovery campaigns.

### 1.2 System Boundary & Scope
The system boundaries of EDROS define what is managed inside the platform versus external systems:

```
+─────────────────────────────────────────────────────────────────────────────+
|                                SYSTEM BOUNDARY                              |
|                                                                             |
|   [ External Portals ] ──────► [ Cloudflare Edge WAF & CDN ] ──────┐        |
|                                                                    │        |
|   +──────────────────────────────────────────────────────────────+ │        |
|   | EDROS PLATFORM BOUNDARY (Next.js / Node.js Runtime)          | │        |
|   |                                                              | │        |
|   |  - Core Recovery API Gateway                                 |◄┘        |
|   |  - Web Application Console (Client UI)                       |          |
|   |  - Queue Managers (Upstash Redis / BullMQ)                   |          |
|   |  - Background Worker Pool (Railway Engine)                   |          |
|   |  - Database Relational Engine (Prisma / Neon Postgres)       |          |
|   |  - Secure Document Vault (Cloudflare R2 Storage)             |          |
|   |                                                              |          |
|   +──────────────────────────────┬───────────────────────────────+          |
|                                  │                                          |
|                                  ▼ (Strict Secured VPC / API Routes)        |
|   [ External Banking Systems ]   [ Communications Gateways ]                |
|   - Core Banking Systems (CBS)   - SMS, WhatsApp, Email                     |
|   - National Judicial Networks   - Payment Gateway Processors               |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. ARCHITECTURE VISION & OBJECTIVES

### 2.1 Architecture Vision
The structural vision of EDROS is built on an isolated, highly secure, fully auditable, serverless-first, and event-driven model. The platform is engineered to support up to 10,000 parallel operator sessions, manage millions of open debt cases, and coordinate high-frequency automated campaigns (voice, message, and legal filings) with zero single points of technical failure.

### 2.2 Core Architectural Objectives

#### 1. Zero-Trust Access Control (ZTAC)
All requests—whether initiated by an internal branch executive, an external creditor bank officer, or an automated service container—must be explicitly authenticated, checked against granular Role-Based Access Control (RBAC) scopes, and logged within non-repudiable system audit streams.

#### 2. Relational Consistency & Transaction Safety
Since EDROS actively logs legal adjournments, payment collection records, and debt settlement haircuts (which have direct balance-sheet and regulatory impact), the application layer must prioritize ACID (Atomicity, Consistency, Isolation, Durability) properties on all transaction routes.

#### 3. Low-Latency Geofenced Synchronization
To guarantee the accuracy of field recovery reports, the mobile and backend architecture must perform low-latency coordinate matching (`<500ms` calculation overhead) using database-level spatial logic. This prevents geofence clock-in overrides or artificial visit reports.

#### 4. Cost-Effective Scaling
The system relies on serverless compute (Vercel edge functions) and serverless databases (Neon Postgres with scale-to-zero capabilities) during off-peak periods, with dedicated worker nodes (Railway) to process high-volume task queues efficiently.

---

## 3. ARCHITECTURE PRINCIPLES & CRITERIA

The EDROS system design is guided by nine foundational architecture principles aligned with the AWS Well-Architected Framework and the TOGAF standard.

### 3.1 Principles Registry

#### Principle 1: Separate Compute from Storage
* **Statement:** System compute nodes (Vercel frontends, Railway worker containers) must remain stateless. All state must reside in persistent PostgreSQL nodes, cache pools (Redis), or secure object repositories (R2).
* **Justification:** This allows independent scaling of compute layers during high-traffic campaigns without risking data drift or storage corruption.

#### Principle 2: Secure by Default (OWASP Alignment)
* **Statement:** No route, endpoint, database port, or cloud storage bucket may be exposed publicly. All traffic must pass through API authentication gateways, Cloudflare WAF protections, and internal SSL/TLS connections.
* **Justification:** Avoids credential leaks and SQL injections, ensuring the system meets security standards required by banking clients.

#### Principle 3: Event-Driven Queueing
* **Statement:** High-latency tasks—such as batch legal document drafting, watermarking, RC4 encryption, and massive SMS dispatches—must be processed asynchronously using a queue manager (Redis/BullMQ).
* **Justification:** Decouples the primary client UI from resource-heavy background processes, ensuring smooth UI performance under heavy load.

#### Principle 4: Single Point of Schema Definition
* **Statement:** Database tables, relationships, constraints, and data validations must be defined in a single source of truth: the Prisma schema.
* **Justification:** Eliminates schema drift, typing mismatches, and data inconsistencies across developers.

#### Principle 5: Audit-Ready Traceability
* **Statement:** Every user action that modifies system state must log an immutable audit record containing the operator's identity, timestamp, origin IP, action type, and payload hash.
* **Justification:** Guarantees compliance with external regulatory requirements (such as RBI, ISO 27001, and SOC 2 audits).

#### Principle 6: Modular Boundaries and DDD (Domain-Driven Design)
* **Statement:** Codebases must be split into clean domain boundaries (Staff Roster, Case Ledger, Legal Docket, Secure Vault, Caching).
* **Justification:** Prevents the system from turning into a complex monolith, ensuring code maintainability and clear team boundaries.

#### Principle 7: High-Availability and Failover Resilience
* **Statement:** Every infrastructure layer must support active-passive clustering or multi-region replication, with an RTO of `< 30 minutes` and an RPO of `< 15 minutes`.
* **Justification:** Protects the platform from data loss and downtime during region outages.

#### Principle 8: Compliance by Design (DPDP & RBI Safeguards)
* **Statement:** System logic must enforce data minimization, personal identifier masking (for PII), and automatic data purge rules when retention limits are reached.
* **Justification:** Protects borrower privacy and keeps operations compliant with financial regulations.

#### Principle 9: API-First Integration
* **Statement:** All business functions must be accessible via clean, standard REST JSON APIs.
* **Justification:** Allows banks and collection partners to integrate easily with the platform.

---

## 4. BUSINESS ARCHITECTURE & VALUE CHAINS

EDROS translates business processes into software modules, establishing a clear path from debt delinquency to recovery, case closed, or legal resolution.

### 4.1 Business Value Chain Diagram

```
                    ┌─────────────────────────────────┐
                    │  Delinquent Portfolio Ingestion  │ (CBS Ingest / REST API)
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │   Case Assignment & Allocation  │ (Intelligent Work Distribution)
                    └────────────────┬────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Tele-Calling  │         │   Field Visit   │         │ Legal Litigation│
│   Campaigns     │         │   & Geofencing  │         │   Notice Desk   │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                    ┌─────────────────────────────────┐
                    │  Settlement & Haircut Approval  │ (Branch / Regional Review)
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────┐
                    │   Reconciliation & Case Closed  │ (Core Accounting Update)
                    └─────────────────────────────────┘
```

### 4.2 Key Functional Domains & Business Sub-processes

#### 1. Delinquent Ingestion Domain
* **Action:** external financial systems upload debtor portfolios (customer info, overdue balances, interest, loan types).
* **System Process:** Files are parsed, typed, validated against formatting rules, and loaded into Postgres using database transactions.

#### 2. HR & Resource Allocation Domain
* **Action:** HR maintains the staff directory, maps team hierarchies, and tracks geofenced clock-in times.
* **System Process:** Field check-ins require coordinate validation against branch-assigned geofences to ensure the team is on-site.

#### 3. Settlement Sandbox Domain
* **Action:** Field agents negotiate payoffs with debtors and submit settlement haircut proposals.
* **System Process:** The platform calculates the haircut percentage and routes the proposal to the appropriate manager based on their approval limits (e.g. Regional Manager for haircuts up to 30%).

#### 4. Legal notice & Court Docket Domain
* **Action:** Legal teams track hearings, adjourments, and draft demand notices.
* **System Process:** Standard notice drafts are auto-generated and stored as watermarked, RC4-encrypted PDFs in secure storage.

---

## 5. APPLICATION ARCHITECTURE & LOGICAL MODEL

The application layer uses a layered architecture, enforcing a strict separation of concerns from the client UI down to physical storage.

### 5.1 Layered Architecture Pattern

```
┌───────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Next.js SPA / React 19 / Tailwind CSS)    │
│  - Captures inputs, renders state-driven dashboards           │
└───────────────────────────────┬───────────────────────────────┘
                                │ (Secure HTTPS / JWT Headers)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│  API CONTROLLER / ENTRY LAYER (Next.js Serverless Route Handlers)
│  - Parses JSON requests, validates cookies, checks JWT scopes │
└───────────────────────────────┬───────────────────────────────┘
                                │ (Domain Event / Function Calls)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│  BUSINESS LOGIC & DOMAIN SERVICE LAYER (Node.js Services)      │
│  - Evaluates business rules (e.g., haircut authorization limits)│
└───────────────────────────────┬───────────────────────────────┘
                                │ (Asynchronous Queue Triggers)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│  ASYNC QUEUE & WORKER RUNTIME LAYER (Upstash Redis & BullMQ)  │
│  - Manages background tasks, PDF generation, SMS dispatches    │
└───────────────────────────────┬───────────────────────────────┘
                                │ (Prisma Client Queries)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│  DATA PERSISTENCE & ACCESS LAYER (Prisma ORM engine)           │
│  - Coordinates connections, migrations, and PostgreSQL access │
└───────────────────────────────────────────────────────────────┘
```

### 5.2 Core Domain Modules and Component Isolation
To maintain clean boundaries, developers must isolate features within specific folders under `/src`. Mixing business domains (e.g., calling case queries directly inside presentation files) is strictly forbidden.

* **`/src/components/`**: Standard UI elements (cards, buttons, inputs, alerts, modals) styled with Tailwind CSS.
* **`/src/services/`**: Class structures containing pure business logic (e.g., `SettlementService`, `NoticeGeneratorService`, `AuditLoggerService`).
* **`/src/queues/`**: Task definitions and worker files for BullMQ.
* **`/prisma/`**: Schema definitions, seed files, and DB migration scripts.

---

## 6. TECHNOLOGY ARCHITECTURE & SYSTEM STACK

EDROS's tech stack is selected for its high performance, type safety, and cost-efficiency.

```
       [ Next.js 15 Client ] ──────────► [ Next.js API Gateway ]
                 │ (React 19 Core)                   │
                 ▼                                   ▼
        [ Cloudflare R2 S3 ]               [ Prisma ORM Engines ]
                 ▲                                   │
                 │ (S3 Secure APIs)                  ▼
        [ Railway Workers Pool ]◄───────── [ Neon Serverless Postgres ]
                 ▲
                 │ (BullMQ Tasks)
        [ Upstash Redis Cache ]
```

### 6.2 Key Technology Justification Matrix

| Stack Tier | Technology Selected | Justification & Architectural Core |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 / React 19** | Server-Side Rendering (SSR) for administration portals, coupled with single-page-app mechanics for responsive operator screens. |
| **Type Safety** | **TypeScript** | Eliminates runtime syntax errors, enforces consistent API payloads, and ensures code contract compliance. |
| **Database Access** | **Prisma ORM** | Type-safe query generation, simplified database schema management, and automated migration version control. |
| **Primary Database** | **Neon PostgreSQL** | Serverless relational database supporting fast connection scaling, automatic branching for testing, and scale-to-zero cost optimization. |
| **Queue & Cache Pool**| **Upstash Redis** | Serverless, low-latency Redis engine used for API rate-limiting, operator session caching, and running BullMQ workflows. |
| **Background Workers**| **Railway Engine** | Highly reliable, Docker-based container hosting for dedicated background workers. |
| **Secure Storage** | **Cloudflare R2** | Zero-egress-fee, S3-compatible object storage for secure PDF archives, legal notices, and watermarked documents. |
| **Security Edge** | **Cloudflare CDN/WAF** | Protects the system from DDoS attacks and SQL injections, provides SSL/TLS termination, and manages DNS routing. |

---

## 7. DATA ARCHITECTURE & RECOVERY LEDGERS

The database architecture ensures absolute consistency, tracking data history and maintaining complete audit records for every record.

### 7.1 Database Entity Relationship Architecture
The relational schema is configured to maintain references across delinquent records, system users, litigation histories, and secure document entries:

```
  ┌─────────────────────────────────┐
  │           operators             │
  ├─────────────────────────────────┤
  │ PK email         VARCHAR(150)   │◄┐
  │    first_name    VARCHAR(100)   │ │
  │    last_name     VARCHAR(100)   │ │
  │    role          VARCHAR(50)    │ │
  │    base_salary   DECIMAL(12,2)  │ │
  │    department    VARCHAR(100)   │ │
  └─────────────────────────────────┘ │
                   │                  │
                   ▼ (1:N)            │ (1:N Owner)
  ┌─────────────────────────────────┐ │
  │          audit_trails           │ │
  ├─────────────────────────────────┤ │
  │ PK log_id        UUID           │ │
  │ FK operator_em   VARCHAR(150)   │─┘
  │    action_msg    TEXT           │
  │    ip_address    VARCHAR(45)    │
  │    payload_hash  VARCHAR(64)    │
  └─────────────────────────────────┘
                   ▲
                   │ (1:N Related Case)
  ┌─────────────────────────────────┐
  │         assigned_cases          │
  ├─────────────────────────────────┤
  │ PK case_id       VARCHAR(50)    │◄┐
  │    customer_name VARCHAR(200)   │ │
  │    current_due   DECIMAL(12,2)  │ │
  │ FK owner_email   VARCHAR(150)   │─┘
  │    status        VARCHAR(50)    │
  └─────────────────────────────────┘
                   │
                   ▼ (1:N Parent Case)
  ┌─────────────────────────────────┐
  │        litigation_suits         │
  ├─────────────────────────────────┤
  │ PK suit_no       VARCHAR(100)   │
  │ FK related_case  VARCHAR(50)    │──┘
  │    court_name    VARCHAR(200)   │
  │    hearing_date  DATE           │
  │    suit_nature   VARCHAR(100)   │
  └─────────────────────────────────┘
```

### 7.2 Database Operations Policies

#### 1. Indexing Strategy
To maintain low latency on complex search queries, secondary composite B-Tree indexes must be applied to frequently queried fields:
* `assigned_cases(owner_email, status)`
* `litigation_suits(related_case, hearing_date)`
* `secure_documents(is_encrypted, tag)`

#### 2. Soft-Deletes Enforcement
To comply with financial regulatory standards, no data row in the core recovery tables may be deleted via raw SQL `DELETE` commands. Tables must include `is_deleted` (BOOLEAN) and `deleted_at` (TIMESTAMP) fields. The prisma engine must filter out records where `is_deleted = true` by default.

#### 3. High-Concurrency Connection Pooling
Neon Postgres serverless configurations scale connections automatically. To handle sudden spikes during campaigns, client queries must route through pgBouncer connection pools configured with a target maximum size of 200 concurrent pool connections.

---

## 8. INFRASTRUCTURE & ENVIRONMENT SCHEMATICS

EDROS uses a decoupled cloud architecture, distributing frontend, backend compute, caching, and storage across optimized providers.

### 8.1 Network & Data Flow Topology

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    INTERNET ROADWAY (EXTERNAL)                             |
|                                                                                           |
|   [ Client Intranet / Mobile ] ──────► [ Cloudflare Edge WAF / CDN Proxy (SSL Term) ]     |
+─────────────────────────────────────────────────────────┬─────────────────────────────────+
                                                          │
                                                          ▼ (Public API Gateway / HTTPS)
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    FRONTEND COMPUTE VPC (VERCEL)                          |
|                                                                                           |
|   [ Next.js API Routes Handlers ] ────► [ Upstash Redis Cache Pool ]                      |
+────────────────────────┬──────────────────────────────────────────────────────────────────+
                         │                                 ▲
                         ▼ (Prisma secure Connection)      │ (BullMQ Task Event)
+──────────────────────────────────────────────────────────┼────────────────────────────────+
|                                    BACKEND ENGINE RUNTIME (RAILWAY)                       |
|                                                                                           |
|   [ Neon PG Serverless Master Instance ] ◄────► [ BullMQ Workers Pool Container ]         |
|   (Automatic Scale-to-Zero Engine)            │                                           |
|                                               ▼ (AWS S3 APIs)                             |
|                                         [ Cloudflare R2 Storage ]                         |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

### 8.2 Environment Segmentation Matrix
The platform separates resources across three identical, isolated environments:

1. **Development (DEV):** Shared database instances for code testing and validation. Scale-to-zero is enabled to reduce idle compute costs.
2. **Staging (STG):** Mimics the scale and performance of the production environment. Used for running automated Playwright E2E test suites prior to deployment.
3. **Production (PROD):** Fully isolated high-availability environment with strict access controls, read-replicas, and active system logging.

---

## 9. SECURITY & COMPLIANCE ARCHITECTURE

Because EDROS processes sensitive borrower information and coordinates legal notices, security is embedded directly into the platform architecture.

### 9.1 Identity Management & Authentication
* **Protocol:** JSON Web Tokens (JWT) signed with `RS256` keys, rotating every 90 days.
* **MFA Gate:** Multi-factor authentication is mandatory for all user classes. Standard login attempts trigger a one-time verification passcode (OTP) challenge that must be verified within 180 seconds.
* **Session Lifecycle:** Active login tokens expire after 8 hours. Administrative accounts (Super Admin, Legal Team) have an inactivity timeout of 15 minutes.

### 9.2 Cryptographic Safeguards
* **Transit Encryption:** All network traffic requires TLS 1.3. Standard HTTP requests (Port 80) are automatically upgraded to HTTPS (Port 443) at the Cloudflare Edge load balancer.
* **Storage Encryption:** PostgreSQL data partitions are encrypted at rest using AES-256.
* **Cryptographic PDF Seal:** Legal notice PDFs inside the R2 storage vault are secured using a server-side 128-bit RC4 Stream Seal engine. This protects notice templates and customer data from unauthorized external modification.

### 9.3 Regulatory Compliance Roadmap

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         REGULATORY SYSTEM GATES                         │
  ├────────────────────────────────────┬────────────────────────────────────┤
  │ DPDP ACT COMPLIANCE                │ RBI RECOVERY COMPLIANCE            │
  │ - Granular Customer Consent Tracker│ - Strictly Monitored Contact Hours │
  │ - Automatic Right-to-Be-Forgotten  │ - Call Log Integrity & GPS Audits  │
  │ - Strict Personal Identifier Mask  │ - Non-Repudiable Action Trails     │
  └────────────────────────────────────┴────────────────────────────────────┘
```

#### 1. DPDP Compliance Framework
* **Consent Logging:** Keeps track of explicit customer consent for data processing.
* **Data Masking:** Automatically masks Personal Identifiable Information (PII), such as phone numbers and national identifiers, inside screens accessed by general field executives.

#### 2. RBI Recovery Fair Practice Code Integration
* **Contact Hours Guard:** Prevents outreach actions (automated dialers, SMS alerts, field visits) outside of RBI-permitted hours (usually 08:00 to 19:00).
* **System Lockout:** The UI automatically locks out communication tools outside of permitted contact hours.

---

## 10. DEPLOYMENT & RELEASING TOPOLOGY

EDROS uses GitOps principles to manage deployments, automating testing and validation through CI/CD pipelines.

### 10.1 CI/CD Pipeline Flowchart

```
 [ Developer Push to GitHub ]
               │
               ▼
   [ GitHub Actions Runner ]
               │
         ┌─────┴────────────────────────────────┐
         ▼                                      ▼
 [ Job 1: Lint & Code Scan ]           [ Job 2: Unit / Integration Tests ]
 (Tsc, ESLint, CodeQL)                 (Vitest, Jest Spec validation)
         │                                      │
         └─────┬────────────────────────────────┘
               ▼
 [ Job 3: Isolated Staging Deploy ] ────► Run Playwright E2E Tests
               │
               ▼
 [ Job 4: Production Rollout ]
               │
         ┌─────┴────────────────────────────────┐
         ▼                                      ▼
 [ Vercel Edge Serverless ]            [ Railway Workers Pool ]
 (Static assets & APIs)                (Docker Container Build)
```

### 10.2 Zero-Downtime Release Deployment
1. **Frontend:** Vercel manages routing and assets dynamically. New deployments are fully warmed up and verified before being routed to users, ensuring zero downtime.
2. **Backend Workers:** Railway handles container upgrades using rolling releases. New containers are launched and confirmed healthy before old containers are terminated, preventing queue processing interruptions.

---

## 11. SCALABILITY, RESILIENCE & RELIABILITY STRATEGY

The application handles unexpected spikes and scale requirements without compromising system performance or data integrity.

### 11.1 Dynamic Auto-scaling Rules
* **Frontend Scale:** Vercel edge functions scale compute capacity automatically in response to request volume.
* **Worker Containers:** Railway worker pools scale horizontally based on container CPU and memory utilization.

```
Worker Scale Thresholds:
Memory Utilization > 75% for 180s ──► Provision New Worker Instance
CPU Utilization    > 80% for 120s ──► Provision New Worker Instance
```

### 11.2 Rate Limiting and Circuit Breaker Controls
To prevent denial-of-service attempts and protect connection limits:
* **API Rate Limiting:** Exposes a sliding window rate-limiter managed via Upstash Redis. Client IP connections are capped at `100 API requests / 60 seconds`.
* **Database Circuit Breakers:** Query handlers use timeout thresholds. If database queries take longer than `5000ms`, the application terminates the query and returns a `504 Gateway Timeout` error, protecting database connection pools from being exhausted.

---

## 12. DISASTER RECOVERY & DISRUPTION PLAN

To protect business operations from regional cloud outages, EDROS maintains high-availability systems with automated disaster recovery procedures.

### 12.1 Backup and Replication Strategy
* **Database Backups:** Neon Postgres is configured with daily snapshots, streaming write logs, and a 14-day Point-in-Time Recovery (PITR) window.
* **Storage Replication:** Cloudflare R2 object buckets are replicated across multiple geographic regions automatically.

### 12.2 Emergency Recovery Targets
To ensure business continuity, EDROS commits to strict Recovery Point and Recovery Time Objectives (RPOs/RTOs):

| Metric | Target Limit | System Process |
| :--- | :--- | :--- |
| **RPO (Recovery Point Objective)** | **< 15 Minutes** | Maximum allowable data loss under active transaction states. |
| **RTO (Recovery Time Objective)** | **< 30 Minutes** | Maximum time to fully restore operational capabilities. |

### 12.3 Multi-Region Failover Sequence (Active-Passive)
1. **Outage Detection:** External health checks monitor system endpoints. If consecutive health checks fail for more than 180 seconds, the system triggers the alert chain.
2. **Database Promotion:** SRE tools verify database health and promote passive read-replicas in secondary regions to master write status.
3. **DNS Re-routing:** Cloudflare DNS updates regional routing paths to point user traffic to the secondary failover region.
4. **Validation:** Sanity check scripts verify system performance and confirm database access in the new active region.

---

## 13. ARCHITECTURE CONSTRAINTS & TRADE-OFFS

Architectural decisions involve balancing platform performance, development velocity, and infrastructure complexity.

### 13.1 Systems Constraints
* **Vercel Execution Limits:** Edge function execution times are capped at 30 seconds. Long-running tasks must be delegated to background workers on Railway.
* **Database Pool Sizing:** Neon serverless databases scale connections automatically, requiring robust client connection pooling to prevent exceeding overall connection limits.

### 13.2 Key Architectural Trade-offs

#### Trade-off 1: Serverless PostgreSQL vs. Dedicated Cluster
* **Choice:** Deployed Neon Serverless PostgreSQL instead of a self-managed multi-node PostgreSQL cluster.
* **Pros:** Scale-to-zero compute reduces idle costs, with automated snapshotting and database branching for testing.
* **Cons:** Cold starts can add minor latency (`~2s`) to connection requests during off-peak hours.
* **Resolution:** Configured keep-alive queries to run every 10 minutes, keeping connection pools warm during business hours.

#### Trade-off 2: Serverless Upstash Redis vs. Dedicated Redis Cluster
* **Choice:** Selected serverless Upstash Redis over a dedicated, self-managed Redis cluster.
* **Pros:** Scalability is managed automatically with zero maintenance overhead and low cost.
* **Cons:** High-volume operations can introduce minor latency compared to dedicated, in-memory deployments.
* **Resolution:** Validated that Upstash latency meets system requirements (`<5ms` query response times under standard loads).

---

## 14. KEY ARCHITECTURAL DECISIONS & MATRIX

Critical system choices are tracked using formal Architecture Decision Records (ADR). Detailed ADR sheets are maintained in Document 10.

| Reference ID | Architecture Choice | Alternatives | Key Selection Factors | Status |
| :--- | :---: | :--- | :--- | :---: |
| **EDROS-ADR-001** | **PostgreSQL Database** | MongoDB, MySQL | Relational data integrity, foreign key validation, and spatial index support for geofenced visits. | **APPROVED** |
| **EDROS-ADR-002** | **Prisma ORM** | TypeORM, Raw SQL | Type safety, automated migrations, and deep integration with TypeScript. | **APPROVED** |
| **EDROS-ADR-003** | **Next.js & React** | Angular, Vue SPA | Server-Side Rendering (SSR) support, optimized build compiling, and deployment speed. | **APPROVED** |
| **EDROS-ADR-004** | **BullMQ & Redis** | RabbitMQ, Kafka | Lightweight setup, reliable message processing, and seamless integration with Node.js. | **APPROVED** |
| **EDROS-ADR-005** | **Cloudflare R2** | Amazon AWS S3 | Zero data-egress fees, native CDN integration, and reliable performance. | **APPROVED** |

---

## 15. ARCHITECTURE RISKS & MITIGATION MATRIX

Potential technical risks are tracked alongside mitigation strategies to ensure long-term platform stability.

| Threat / Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Database Connection Exhaustion** | High | Medium | Implement pgBouncer connection pools on all client adapters and set robust query timeouts. |
| **Exceeding Vercel Execution Limits** | Medium | Low | Delegate heavy workloads (e.g. batch notice generation, report compilation) to background workers. |
| **Location Tracking Mismatch** | High | Medium | Use browser-level coordinate checks and cross-reference locations against assigned branch geofences. |
| **Sensitive Client Data Leakage** | Critical | Low | Encrypt database storage at rest, mask PII in dashboards, and encrypt secure PDFs with server-side RC4 seals. |

---

## 16. ARCHITECTURE GOVERNANCE & COMPLIANCE

The architecture review process ensures system changes align with security, performance, and compliance standards.

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                           GOVERNANCE WORKFLOW                           │
  ├────────────────────────────────────┬────────────────────────────────────┤
  │ 1. INITIATION                      │ 2. EVALUATION                      │
  │ Developer requests system change   │ Architecture Review Board (ARB)    │
  │ or database schema update.         │ reviews the schema and impact.     │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ 3. SIGN-OFF                        │ 4. IMPLEMENTATION                  │
  │ Security, Database, and SRE leads  │ Approved changes are merged and    │
  │ sign off on the proposed update.   │ applied to staging and production. │
  └────────────────────────────────────┴────────────────────────────────────┘
```

1. **Initiation:** Developers request architectural changes or database schema updates by submitting a technical proposal.
2. **Evaluation:** The Architecture Review Board (ARB) evaluates the request, reviewing system performance impact and schema structure.
3. **Sign-off:** Security, Database, and SRE leads sign off on the proposed changes.
4. **Implementation:** Approved changes are merged and applied to staging and production environments.

---

## 17. ARCHITECTURE REVIEW CHECKLIST

Before deploying architectural updates or system modifications to production, reviewers must verify compliance against this checklist:

* [ ] **Type Safety Check:** Verify that all TypeScript compile checks pass without warnings or type bypasses (`any`).
* [ ] **Schema Migration Check:** Ensure database schema changes are generated via Prisma and run successfully in staging.
* [ ] **Vercel Timeout Check:** Confirm no API routes or endpoints run operations that could exceed Vercel's 30-second limit.
* [ ] **Secret Hygiene Check:** Verify that no active API keys, connection strings, or system secrets are included in the source code.
* [ ] **Audit Logs Check:** Ensure all state-modifying endpoints trigger audit logs with matching user context and payload hashes.
* [ ] **Regulatory Check:** Confirm compliance with DPDP data minimization rules and RBI fair practice guidelines.

---

## 18. GLOSSARY & REFERENCES

### 18.1 Glossary of Terms
* **ACID:** Atomicity, Consistency, Isolation, Durability. Standard database properties that guarantee reliable transaction processing.
* **API Gateway:** A routing interface that manages, secures, and audits incoming API calls.
* **CISO:** Chief Information Security Officer.
* **DDD:** Domain-Driven Design. A software development approach that aligns the system structure with the business domain.
* **WAF:** Web Application Firewall. Protects web applications by filtering and monitoring HTTP traffic.
* **SRE:** Site Reliability Engineer. Focused on system availability, performance, and disaster recovery.

### 18.2 Industry & Technical References
1. **AWS Well-Architected Framework:** Core principles for designing secure, high-performing, resilient, and efficient cloud infrastructures.
2. **The Open Group Architecture Framework (TOGAF):** An industry-standard methodology and framework for enterprise architecture design.
3. **OWASP Top 10 Security Risks:** Standard awareness document representing broad consensus on the most critical security risks to web applications.
4. **Prisma Schema Best Practices:** Official design guidelines for schema formulation and relations mapping.

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
