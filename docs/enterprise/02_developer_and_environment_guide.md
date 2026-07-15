# EDROS ENTERPRISE DOCUMENTATION LIBRARY
## MODULE 02: DEVELOPER INSTALLATION, ENVIRONMENT CONFIGURATION, DATABASE DESIGN, AND API REFERENCE

---

## DOCUMENT 4: DEVELOPER INSTALLATION GUIDE

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-DIG-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / TECHNICAL DEPLOYMENT EXCLUSIVE
* **Author:** Principal Software Architect, Cloud Solutions
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Principal Architect | Initial setup guidelines. | VP of Application Development |

---

### 4.1 PURPOSE
The purpose of this guide is to lead software engineers, QA technicians, and third-party integrators through the local setup, compilation, and initial seed of the EDROS local codebase.

### 4.2 INTENDED AUDIENCE
* **Full-stack Software Engineers**
* **QA Engineers & Automation Architects**
* **Technical Onboarding Leads**

### 4.3 SYSTEM PREREQUISITES
Before initializing the repository, verify that the local workstation possesses:
* **Node.js:** v24.0.0 or higher (Active LTS).
* **NPM:** v10.0.0 or higher.
* **Docker Desktop:** (Optional - required for local Postgres instances).
* **PostgreSQL Server:** v16.0 or higher (if not running inside Docker containers).

### 4.4 STEP-BY-STEP LOCAL ASSEMBLY

#### Step 1: Clone and Enter the Directory
```bash
git clone https://github.com/edros-org/edros-core.git
cd edros-core
```

#### Step 2: Clean and Install Baseline Dependencies
```bash
npm cache clean --force
npm ci
```

#### Step 3: Run Database Migrations and Seeding
EDROS uses Drizzle ORM to interface with PostgreSQL. Initialize the schema using:
```bash
# Push database changes directly to local database container
npx drizzle-kit push:pg

# Seed baseline reference tables (e.g. baseline operators, departments)
npm run db:seed
```

#### Step 4: Run Dev Environment Server
Start the Express server hosting both the back-end endpoints and mounting the Vite client middleware over Port 3000:
```bash
npm run dev
```

#### Step 5: Verify Build Compilation
Verify that the static code compiler and TypeScript analyzer complete without warnings or fatal type errors:
```bash
npm run build
```

---

## DOCUMENT 5: ENVIRONMENT CONFIGURATION GUIDE

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-ECG-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / SECRET DISTRIBUTION
* **Author:** Lead Platform DevSecOps
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Lead DevSecOps | Secure variable mapping definitions. | Chief Information Security Officer |

---

### 5.1 PURPOSE
This document outlines every environment variable utilized by EDROS, their storage formats, secret masking, and dynamic propagation mechanisms across container runners.

### 5.2 INTENDED AUDIENCE
* **SecOps Administrators**
* **Cloud Infrastructure Engineers**
* **Security Compliance Officers**

### 5.3 COMPREHENSIVE VARIABLE REGISTRY
All system settings are injected at container startup as environment parameters. Never store active secret credentials inside raw Git files.

| Variable Name | Description | Required? | Default / Example Value | Secret Level |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string with TLS/SSL query flags. | Yes | `postgresql://edros:pwd@10.0.12.3:5432/edros_db?ssl=true` | Critical |
| `NODE_ENV` | Running runtime flag. | Yes | `production` / `development` | Public |
| `PORT` | Networking ingress target. | Yes | `3000` | Public |
| `GEMINI_API_KEY` | Secret token to authenticate with Google's GenAI endpoint. | Yes | `AIzaSyCsK...` (Google Cloud IAM Token) | Critical |
| `RC4_SECRET_KEY` | Master byte array used by the 128-bit document encryption module. | Yes | `EDROS_CRYPT_SECRET_99812A` | Critical |
| `VITE_API_URL` | Public API routing base exposed inside client browsers. | No | `https://api.edros-prod.net` | Public |

### 5.4 CRITICAL SECURITY CONSTRAINTS FOR THE GEMINI API KEY
1. **No Client Leakage:** The Gemini API Key must never possess the `VITE_` prefix, preventing Vite from packing it into bundles served to the client browser.
2. **Server-Side Encapsulation:** All Gemini AI calls are made exclusively within server-side endpoints (e.g. `/api/generate/notice`). The API client is instantiated lazily on first call:
   ```ts
   import { GoogleGenAI } from "@google/genai";
   let aiClient: GoogleGenAI | null = null;
   export function getAI() {
     if (!aiClient) {
       const key = process.env.GEMINI_API_KEY;
       if (!key) throw new Error("GEMINI_API_KEY is not defined");
       aiClient = new GoogleGenAI({ apiKey: key });
     }
     return aiClient;
   }
   ```

---

## DOCUMENT 6: DATABASE DESIGN & ER DOCUMENTATION

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-DDE-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / TECHNICAL DATABASE ARCHITECTURE
* **Author:** Principal Database Engineer
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Principal DB Engineer | Completed relational model definition. | VP of Core Banking Systems |

---

### 6.1 PURPOSE
This document provides full schema definitions, primary/secondary relationships, indexes, and constraint mappings for the PostgreSQL relational database supporting EDROS.

### 6.2 INTENDED AUDIENCE
* **Database Engineers & DBAs**
* **Application Developers**
* **Financial Data Compliance Officers**

### 6.3 ENTITY RELATIONSHIP ARCHITECTURE

```
   ┌─────────────────┐             ┌──────────────────┐
   │    operators    │             │  assigned_cases  │
   ├─────────────────┤             ├──────────────────┤
   │ PK  email       │             │ PK  case_id      │
   │     first_name  │             │     customer_name│
   │     last_name   │             │     current_due  │
   │     role        │────────────►│ FK  owner_email  │
   └─────────────────┘             └──────────────────┘
            │                               │
            ▼                               ▼
   ┌─────────────────┐             ┌──────────────────┐
   │  audit_trails   │             │ litigation_suits │
   ├─────────────────┤             ├──────────────────┤
   │ PK  log_id      │             │ PK  suit_no      │
   │ FK  operator_em │             │     court_name   │
   │     action_msg  │             │ FK  related_case │
   └─────────────────┘             └──────────────────┘
```

### 6.4 HIGH-LEVEL TABLE SCHEMAS

#### 1. Table: `operators`
Represents the collection of workforce personnel authenticated to interact with the OS.
* **PK:** `email` (VARCHAR(150))
* **Fields:** 
  * `first_name` (VARCHAR(100))
  * `last_name` (VARCHAR(100))
  * `role` (VARCHAR(50)) — Enumeration: `SUPER_ADMIN`, `NATIONAL_HEAD`, `REGIONAL_MANAGER`, `BRANCH_MANAGER`, `TEAM_LEADER`, `RECOVERY_EXECUTIVE`
  * `base_salary` (DECIMAL(12,2))
  * `department` (VARCHAR(100))

#### 2. Table: `assigned_cases`
Accounts containing active delinquent portfolios assigned to specific Recovery Executives.
* **PK:** `case_id` (VARCHAR(50))
* **FK:** `owner_email` References `operators(email)`
* **Fields:**
  * `customer_name` (VARCHAR(200))
  * `current_due` (DECIMAL(12,2))
  * `allocated_date` (TIMESTAMP)
  * `recovery_status` (VARCHAR(50)) — Enumeration: `CONTACTED`, `PROMISED_TO_PAY`, `SETTLEMENT_PROPOSED`, `LITIGATION_PENDING`

#### 3. Table: `litigation_suits`
Formal cases logged inside regional or national courts.
* **PK:** `suit_no` (VARCHAR(100))
* **FK:** `related_case` References `assigned_cases(case_id)`
* **Fields:**
  * `court_name` (VARCHAR(200))
  * `hearing_date` (DATE)
  * `suit_nature` (VARCHAR(100))

#### 4. Table: `secure_documents`
S3 objects watermarked and optionally RC4-encrypted inside the vault.
* **PK:** `file_id` (UUID)
* **Fields:**
  * `filename` (VARCHAR(255))
  * `tag` (VARCHAR(50))
  * `is_encrypted` (BOOLEAN)
  * `encrypted_hash` (VARCHAR(256))

---

## DOCUMENT 7: COMPLETE API REFERENCE

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-CAR-2026-V1
* **Version:** 1.0.0
* **Classification:** TECHNICAL ARCHITECTURE INTERFACES
* **Author:** Principal API Architect
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Principal API Architect | API interface compilation. | Chief Security Architect |

---

### 7.1 PURPOSE
This document provides complete specifications for endpoints exposed beneath the `/api` prefix, outlining expected headers, query structures, JSON payload validation rules, and status responses.

### 7.2 INTENDED AUDIENCE
* **UI Developers**
* **Third-Party Integration Partners**
* **Security Auditors**

### 7.3 CORE API BLUEPRINTS

#### 1. POST /api/auth/authenticate
Authenticate operator credentials and initiate multi-factor validation.
* **Request Format:**
  ```json
  {
    "email": "rahul.dangi.sait@gmail.com",
    "password": "edros-secure-2026"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "MFA_REQUIRED",
    "mfa_token": "token_session_9081273",
    "message": "Enter 6-digit verification pass to authenticate."
  }
  ```

#### 2. POST /api/auth/verify-mfa
Submit MFA verification digit tokens.
* **Request Format:**
  ```json
  {
    "mfa_token": "token_session_9081273",
    "otp": "123456"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "AUTHENTICATED",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "operator": {
      "email": "rahul.dangi.sait@gmail.com",
      "first_name": "Rahul",
      "last_name": "Dangi",
      "role": "SUPER_ADMIN"
    }
  }
  ```

#### 3. GET /api/cases
Retrieve active delinquent portfolios assigned to the authenticated operator.
* **Query Parameters:**
  * `status`: Filter by pipeline phase (e.g. `PROMISED_TO_PAY`).
* **Success Response (200 OK):**
  ```json
  [
    {
      "case_id": "CASE_881273",
      "customer_name": "Ankit Kumar",
      "current_due": 245000.00,
      "allocated_date": "2026-06-01T10:00:00Z",
      "recovery_status": "CONTACTED"
    }
  ]
  ```

#### 4. POST /api/settlements/propose
Submit dynamic settlement haircuts for review.
* **Request Format:**
  ```json
  {
    "case_id": "CASE_881273",
    "proposed_amount": 180000.00
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "ACTION_COMMITTED",
    "case_id": "CASE_881273",
    "haircut_percentage": 26.53,
    "authority_level_required": "REGIONAL_MANAGER",
    "msg": "Settlement proposal committed and queued for approval."
  }
  ```

---
