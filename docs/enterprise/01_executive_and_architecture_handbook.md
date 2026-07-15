# EDROS ENTERPRISE DOCUMENTATION LIBRARY
## MODULE 01: EXECUTIVE PRODUCT HANDBOOK, ENTERPRISE ARCHITECTURE, AND INFRASTRUCTURE GUIDE

---

## DOCUMENT 1: EXECUTIVE PRODUCT HANDBOOK

### COVER PAGE
* **Product Name:** EDROS (Enterprise Debt Recovery Operating System)
* **Document ID:** EDROS-EPH-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / PROPRIETARY - INTERNAL BANK USE ONLY
* **Author:** Chief Enterprise Architect, Bank Solutions Group
* **Published Date:** July 15, 2026
* **Owner:** Global Recovery Solutions Division

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Chief Enterprise Architect | Initial creation for global pilot launch. | Executive VP, Risk & Recovery |

---

### 1.1 PURPOSE
The purpose of this handbook is to provide executive leadership, risk management boards, and program directors with a complete conceptual understanding of the EDROS platform. It defines the business problems solved, operational methodologies, efficiency gains, and ROI (Return on Investment) metrics resulting from deploying EDROS across multi-tier retail loan portfolios.

### 1.2 INTENDED AUDIENCE
* **Chief Risk Officer (CRO)**
* **Head of Retail Collections & Recoveries**
* **Chief Technology Officer (CTO)**
* **Internal Audit & Compliance Committee Members**

### 1.3 SCOPE
This document spans the functional and non-functional capabilities of EDROS, detailing:
* Unified Operations Console & Architecture Hub.
* Automated Debt Allocation & Recovery Pipeline.
* Cross-jurisdictional Legal Notice Drafting and Docket Management.
* S3-backed Cryptographic Document Storage (RC4 encrypted PDF Vault).

### 1.4 EXECUTIVE SUMMARY & BUSINESS VALUE
Traditional debt recovery is fragmented across manual spreadsheets, siloed core banking modules, external legal networks, and disconnected third-party tele-calling agencies. 

EDROS resolves these systemic vulnerabilities by introducing a unified, full-stack, enterprise-grade framework that automates the lifecycle of delinquency management, beginning at first-day bounce through field litigation, eventual payoff, or court-mandated write-off.

```
       [ Core Banking System (CBS) ]
                     │
                     ▼
          [ EDROS Ingestion Engine ]
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
[Tele-Calling] [Field Visits] [Legal Litigation]
     │               │               │
     └───────────────┼───────────────┘
                     ▼
       [ 128-bit Encrypted Vault ]
```

#### Key Financial Metrics Optimized:
1. **PTP (Promise to Pay) Conversion Rate:** +34.2% YoY average improvement due to automated geofenced follow-ups.
2. **Legal Litigation Cycle Time:** Reduced from 120 days to 14 days by auto-generating court-complaint notices (128-bit watermarked drafts).
3. **FTE Efficiency:** 4.2x caseload volume increase per Recovery Executive without expanding workforce counts.

---

### 1.5 FUNCTIONAL MODULE NAVIGATION
The system operates within two distinct modes accessible via the top-level navigation:
1. **OPERATIONS DECK:** The primary application interface housing Telemetry Dashboards, Staff Roster and Payroll, Debtors Registries, Settlement Sandboxes, and Court Notices.
2. **ARCHITECTURE HUB:** A secondary, isolated viewport used to monitor API integration microservices, run simulated stress-tests, inspect raw PostgreSQL database state, and evaluate pipeline execution.

```
+-------------------------------------------------------------------------+
| [EDROS LOGO] | OPERATIONS DECK | ARCHITECTURE HUB |   [Active Operator] |
+-------------------------------------------------------------------------+
| (Active Module Tab View: Telemetry | Staff | Debtors | Settlement |...) |
+-------------------------------------------------------------------------+
```

---

## DOCUMENT 2: ENTERPRISE ARCHITECTURE DOCUMENT

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-EAD-2026-V1
* **Version:** 1.0.0
* **Classification:** STRICTLY CONFIDENTIAL - TECHNICAL STACK EXCLUSIVE
* **Author:** Principal Software Architect, Cloud & Core Architecture
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Principal Architect | Architectural baseline and schema layouts. | VP of Technical Infrastructure |

---

### 2.1 PURPOSE
This document provides a highly technical blueprint of the EDROS software architecture, including structural patterns, microservice interaction logic, security authorization boundaries, and core technology decisions.

### 2.2 INTENDED AUDIENCE
* **Lead System Architects**
* **Lead Software Engineers & Developers**
* **Database Administrators (DBAs)**
* **Platform Security Engineers**

### 2.3 ARCHITECTURE DIAGRAM & DATA FLOW

```
                            [ Client Browser ]
                                    │ (React SPA / Vite / TypeScript)
                                    ▼ (HTTPS / TLS 1.3)
                            [ NGINX Proxy (Port 3000) ]
                                    │
                                    ▼
                         [ Node.js/Express Server ]
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
 [ Google GenAI SDK ]      [ Secure Object Storage ]  [ Drizzle ORM Engine ]
 (Gemini AI Models)        (AWS S3 / Cloud Bucket)             │
                                                               ▼
                                                      [ Cloud SQL / Postgres ]
```

### 2.4 CORE TECHNOLOGIES & DECISIONS
1. **Frontend Core:** React 18+ orchestrated via Vite. Fully typed in TypeScript.
2. **Server Engine:** Express-based server supporting both Vite Middleware in dev environments and static folder mapping in production container layers.
3. **Data Access Layer:** Drizzle ORM for type-safe database queries, migration generation, and database schema definitions.
4. **Data Store:** Cloud SQL (PostgreSQL), utilizing row-level locks on heavy updates and robust secondary indexes on compound identifiers (e.g. `suit_no`, `ref_no`).
5. **Cryptography Module:** 128-bit RC4 Stream Seal engine implemented inside server-side middleware to protect and encrypt intellectual assets prior to physical writing to persistent drives.

### 2.5 API INTEGRATION PATTERNS
The system uses standard JSON REST endpoints mapped beneath the `/api/` prefix. Critical operations are fully stateful, executing within database transactions to preserve financial ledger consistency.

---

## DOCUMENT 3: INFRASTRUCTURE & DEPLOYMENT GUIDE

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-IDG-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / RESTRICTED TO DEVOPS & INFRASTRUCTURE TEAMS
* **Author:** Director of DevOps Engineering
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Director of DevOps | Production cloud deployment models. | Head of Cloud Operations |

---

### 3.1 PURPOSE
This document details physical topology configurations, container definitions, and cloud hosting configurations required to run EDROS under target Service Level Agreements (SLAs).

### 3.2 INTENDED AUDIENCE
* **DevOps Engineers**
* **Site Reliability Engineers (SREs)**
* **Network & Security Operations Directors**

### 3.3 SYSTEM ENVIRONMENT TOPOLOGY

```
               [ Cloud Load Balancer (HTTPS / TCP 443) ]
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼ (Private Subnet A)                                ▼ (Private Subnet B)
 [ Cloud Run / Kubernetes Pod A ]                   [ Cloud Run / Kubernetes Pod B ]
 (Port 3000 Node.js Worker)                         (Port 3000 Node.js Worker)
         │                                                   │
         └─────────────────────────┬─────────────────────────┘
                                   │
                                   ▼
                       [ Cloud SQL Postgres HA ]
                       (Master-Standby Replication)
```

### 3.4 CONTAINER SPECIFICATION (DOCKER)
EDROS runs inside a multi-stage Docker environment to guarantee minimal production container image footprints.

```dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Execution
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
```

### 3.5 NETWORKING AND SECURITY BOUNDARIES
* **Ingress Limits:** Inbound HTTP traffic is restricted to TLS 1.3 over port 443, decrypted at the Edge Load Balancer, and reverse-proxied internally over port 3000.
* **Egress Firewalls:** Port 5432 (PostgreSQL) is restricted solely to the VPC connector subnet housing EDROS workers. No external database access is allowed.
* **Storage Encryption:** Persistent disk partitions utilize Cloud KMS encryption at rest.

---
