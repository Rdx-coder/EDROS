---
id: EDROS-ARCH-001
title: Executive Product Handbook
version: 1.0.0
classification: LEVEL-3 (CONFIDENTIAL)
owner_role: VP Product
reviewer_role: CDO
approver_role: VP Operations
last_reviewed: 2026-07-15
next_review_due: 2027-01-15
status: APPROVED
priority: HIGH
---

# SANJAY DANGI ASSOCIATES — ENTERPRISE SOFTWARE GOVERNANCE
# ENTERPRISE DEBT RECOVERY OPERATING SYSTEM (EDROS)

## DOCUMENT ID: EDROS-ARCH-001
## VERSION: 1.0.0
## CLASSIFICATION: CONFIDENTIAL (LEVEL 3 - TECHNICAL & MANAGEMENT STAFF ONLY)

---

# DOCUMENT 2: EXECUTIVE PRODUCT HANDBOOK

```
================================================================================
               E X E C U T I V E   P R O D U C T   H A N D B O O K
                               S P E C I F I C A T I O N
================================================================================
System:       Enterprise Debt Recovery Operating System (EDROS)
Entity:       Sanjay Dangi Associates
Author:       VP of Product & Chief Solutions Architect
Co-Authors:   Director of Business Recovery, Principal Solutions Engineer
Reviewer:     Chief Documentation Officer (CDO)
Approver:     VP of Operations & Compliance Steering Committee
================================================================================
```

---

## TABLE OF REVISIONS & VERSION CONTROL

| Version | Release Date | Primary Author | Summary of Key Changes | Reviewer | Approver |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.0.0** | July 15, 2026 | VP of Product | Baseline issue of the Executive Product Handbook for EDROS v1.0.0. | CDO | VP of Operations |

---

## TABLE OF CONTENTS

1. [PURPOSE, SCOPE & AUDIENCE](#1-purpose-scope--audience)
2. [EXECUTIVE SUMMARY & SYSTEM VISION](#2-executive-summary--system-vision)
3. [CORE BUSINESS PROBLEMS & RECOVERY GAP ANALYSIS](#3-core-business-problems--recovery-gap-analysis)
4. [FUNCTIONAL ARCHITECTURE & TWO-MODE VIEWPORT SYSTEM](#4-functional-architecture--two-mode-viewport-system)
5. [DEEP DIVE: PORTFOLIO INGESTION & DATA LEDGER](#5-deep-dive-portfolio-ingestion--data-ledger)
6. [DEEP DIVE: AUTOMATED DEBT ALLOCATION & STRATEGIC QUEUES](#6-deep-dive-automated-debt-allocation--strategic-queues)
7. [DEEP DIVE: GEOFENCED FIELD RECOVERY & FRAUD MITIGATION](#7-deep-dive-geofenced-field-recovery--fraud-mitigation)
8. [DEEP DIVE: SETTLEMENT SANDBOX & COMMISSION ENGINE](#8-deep-dive-settlement-sandbox--commission-engine)
9. [DEEP DIVE: LITIGATION MANAGEMENT, NOTICE WATERMARKING & R2 VAULT](#9-deep-dive-litigation-management-notice-watermarking--r2-vault)
10. [PORTAL-WIDE TECHNICAL COHESION & SECURITY PROTOCOLS](#10-portal-wide-technical-cohesion--security-protocols)
11. [REGULATORY ALIGNMENT (DPDP ACT, RBI FAIR PRACTICE CODE, SOC 2)](#11-regulatory-alignment-dpdp-act-rbi-fair-practice-code-soc-2)
12. [KEY ROI METRICS & FINANCIAL VALIDATION CHECKLIST](#12-key-roi-metrics--financial-validation-checklist)
13. [GLOSSARY & REFERENCES](#13-glossary--references)

---

## 1. PURPOSE, SCOPE & AUDIENCE

### 1.1 Purpose
This handbook establishes the formal executive-level functional specifications, business objectives, operational workflows, and design philosophies of the **Enterprise Debt Recovery Operating System (EDROS)**. This document bridges the gap between high-level financial risk management strategy and technical systems engineering, ensuring that executive leadership can audit, assess, and leverage the platform's multi-layered recovery engines.

### 1.2 Scope
This handbook governs the end-to-end user-facing functional scope of the EDROS ecosystem:
* **The Two-Mode Viewport Concept:** The separation between the daily **Operations Deck** (for staff, roster, debtors, settlements, and legal notices) and the real-time **Architecture Hub** (for pipeline tracing, API integration testing, raw DB diagnostics, and dependency injection audits).
* **Operational Workflows:** Structured mechanics of bank portfolio sheet uploading, algorithmic allocation, geofenced tracking of field agents, manager escalation matrices, and secure document generation.
* **Compliance Overlays:** Aligning all user-facing features with the **India Digital Personal Data Protection (DPDP) Act**, **Reserve Bank of India (RBI) Fair Practices Code for Debt Collection**, **SOC 2 Type II criteria**, and **ISO/IEC 27001 requirements**.

### 1.3 Target Audience
This manual is written for:
* **C-Suite Officers & Board of Directors** evaluating platform ROI, operational efficiency, and overall portfolio risk.
* **VP of Operations & Collections Directors** managing day-to-day staff, field agencies, settlement approvals, and performance metrics.
* **Chief Compliance & Legal Officers** verifying that debt collection practices, notices, and data handling meet strict national banking standards.
* **Lead System Auditors & Product Managers** reviewing system behaviors, feature boundaries, and release alignment.

---

## 2. EXECUTIVE SUMMARY & SYSTEM VISION

The recovery of delinquent loan portfolios is historically characterized by fragmented operations, disconnected technology, and a lack of real-time auditability. Typically, commercial banks, Non-Banking Financial Companies (NBFCs), and Asset Reconstruction Companies (ARCs) handle debt collection through manual spreadsheets, legacy Core Banking Systems (CBS), and separate tele-calling or third-party field collection agencies.

EDROS resolves these systemic vulnerabilities by introducing a unified, full-stack, enterprise-grade operating system that automates the entire debt recovery lifecycle—from first-day payment default, through field-agent geotracking and management-level settlement sandboxing, to court-mandated legal litigation or final account write-offs.

```
                  ┌─────────────────────────────────────┐
                  │      CORE BANKING SYSTEM (CBS)      │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼ (CSV / API Integration)
                  ┌─────────────────────────────────────┐
                  │      EDROS INGESTION GATEWAY        │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   TELE-CALLING   │        │   FIELD VISITS   │        │ LEGAL LITIGATION │
│   CALL CENTERS   │        │   FIELD AGENTS   │        │  COURT NOTICES   │
└────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │  128-bit CRYTOGRAPHIC WATERMARK     │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │   SECURE CLOUDFLARE R2 S3 VAULT     │
                  └─────────────────────────────────────┘
```

By consolidating these functions into a single platform, EDROS replaces scattered databases with a single, legally auditable data ledger. Operations teams gain a structured interface, compliance officers gain complete historical trail tracking, and executives gain immediate visibility into recovery efficiency and cash flow metrics.

---

## 3. CORE BUSINESS PROBLEMS & RECOVERY GAP ANALYSIS

Prior to the deployment of EDROS, debt recovery teams operated under several operational and compliance challenges that degraded efficiency and exposed organizations to regulatory penalties.

### 3.1 Legacy Spreadsheet Chaos
* **The Gap:** Portfolio lists are distributed to field collection agencies via unprotected spreadsheets. Updates on debtor payments are processed manually, resulting in payment application delays, double-contacting borrowers, and high error rates in reconciliations.
* **EDROS Resolution:** Replaces manual file tracking with a centralized, real-time database schema. All customer records, contact logs, settlement calculations, and payment applications are managed inside a secure relational transaction ledger.

### 3.2 Field Agent Untrackability and Fraud Risk
* **The Gap:** Organizations have no verifiable way to confirm whether field recovery executives physically visited a debtor's registered address, or if they logged mock contact reports from remote locations. This lack of verification leads to high GPS fraud and unverified client contact logs.
* **EDROS Resolution:** Integrates a mandatory **Geotracking & Geofencing Verification Engine** utilizing high-precision HTML5 geolocation APIs. Visits are approved and logged only when the agent is physically within **250 meters** of the registered address.

### 3.3 Settlement Matrix Disorganization
* **The Gap:** Field agents negotiate account settlement haircuts (forgiving outstanding dues) without structured limits. This results in unauthorized agreements, lost recovery capital, or slow multi-day phone and email escalation chains to clear settlement approvals.
* **EDROS Resolution:** Enforces a hardcoded **Settlement Escalation Matrix** directly within the payment settlement UI. Haircuts exceeding specified roles' approval limits are automatically locked and routed to the proper supervisor (Branch Manager, Regional Manager, or National Head) for formal electronic sign-off.

### 3.4 Uncontrolled Legal Notice Pipelines
* **The Gap:** Drafting legal notices to delinquent debtors is slow, repetitive, and expensive. Legal teams struggle to scale notice drafting during high-volume defaults, and the documents lack security tracking, allowing debtors to deny receipt of the official terms.
* **EDROS Resolution:** Automates legal drafting through an engine that compiles structured PDFs. Every document is securely watermarked with a **128-bit RC4 cryptographic seal** containing metadata, and stored on highly available, private Cloudflare R2 cloud buckets.

---

## 4. FUNCTIONAL ARCHITECTURE & TWO-MODE VIEWPORT SYSTEM

EDROS is organized around a **Two-Mode Viewport Layout**. The top navigation allows authorized administrative and technical operators to switch between two completely separate application modes: the **OPERATIONS DECK** and the **ARCHITECTURE HUB**.

```
+--------------------------------------------------------------------------------------+
| [EDROS LOGO]  |  OPERATIONS DECK  |  ARCHITECTURE HUB  |    [OPERATOR: AD-9821] (SSO)|
+--------------------------------------------------------------------------------------+
|                                                                                      |
|   ACTIVE VIEWPORT: [OPERATIONS DECK]                                                 |
|   ┌──────────────────────────────────────────────────────────────────────────────┐   |
|   │ [Telemetry]   [Staff Roster]   [Debtors]   [Settlements]   [Court Notices]   │   |
|   └──────────────────────────────────────────────────────────────────────────────┘   |
|                                                                                      |
|   CONTENT ZONE (Contextually rendered based on active tab)                          |
|                                                                                      |
+--------------------------------------------------------------------------------------+
```

### 4.1 The Operations Deck
The **Operations Deck** is the command center for business managers, branch leaders, collection supervisors, and recovery agents. It organizes daily business workflows into five focused tabs:
1. **Telemetry Dashboard:** Displays aggregate KPIs (Total Delinquent Pool, Active Allocations, PTP Promise to Pay Conversion Rates, Litigated Accounts, Settlement Ratios).
2. **Staff Roster & Payroll:** Displays the organization structure (National Head -> State Managers -> Regional Managers -> Branch Managers -> Team Leaders -> Field Executives) alongside active caseload volumes, performance ranks, and base commission earnings.
3. **Debtors Registry:** Displays active accounts, delinquent aging (30-60-90+ days past due), contact histories, allocated operators, and geofence verification statuses.
4. **Settlement Sandbox:** An interactive calculator where field agents simulate account write-offs, evaluate cash flows, calculate interest haircuts, and submit proposals to supervisors.
5. **Court Notices Desk:** Tracks the legal timeline, displaying generated demand drafts, lawsuit filing statuses, court hearing dates, and encrypted PDF files.

### 4.2 The Architecture Hub
The **Architecture Hub** is an isolated workspace for system architects, database administrators, and Site Reliability Engineers (SREs). It monitors system health and provides technical diagnostic tools:
1. **Pipeline Trace Visualizer:** Tracks active HTTP API requests, displaying the step-by-step middleware execution (CORS checks, Upstash Rate Limiter, Auth verification, RBAC permissions, and Zod parser validations).
2. **DB Instance Terminal:** Allows administrators to run safe, read-only SQL queries directly against Neon serverless Postgres instances, inspect active table indexes, and review table locks.
3. **DI Dependency Sandbox:** Tests the system's Dependency Injection framework, allowing engineers to toggle between live database adapters (e.g., Prisma PostgreSQL) and local mock repositories for dry-run testing.
4. **API Integration Tool:** Allows technical teams to test external systems integrations (Core Banking Webhooks, SMS dispatch channels, payment gateways) using interactive JSON payload editors.

---

## 5. DEEP DIVE: PORTFOLIO INGESTION & DATA LEDGER

Data integrity in EDROS begins at the point of ingestion. The platform enforces strict validation rules to ensure no invalid or duplicate portfolios compromise the system's financial ledgers.

```
[ Excel / CSV Sheets ] ──► [ Zod Parser Schema Check ] ──► [ Database Dup-Check Query ]
                                                                      │
                                                   ┌──────────────────┴──────────────────┐
                                                   ▼ (Duplicate / Invalid)               ▼ (Valid Portfolio)
                                            [ Write-To Error Log ]                [ Multi-Table Transaction ]
                                            - Log line number & reason            - Upsert `assigned_cases`
                                            - Reject file import                  - Log to `audit_logs`
```

### 5.1 The Ingestion Engine Mechanics
1. **Zod Parsing:** All incoming bank portfolios (CSV or Excel structures) are verified against a Zod validation schema. Row fields such as `Case ID` (required format matching `/^[A-Z0-9_-]+$/i`), `Borrower Name`, `Current Due`, and `Assigned Representative Email` must pass parsing before DB access occurs.
2. **ACID Transaction Bound:** Ingestion executes within an isolated PostgreSQL transaction block (`$transaction`). If a single row fails due to schema violations or reference errors (e.g., matching to a non-existent branch email), the entire ingestion is rolled back, preventing partial data imports.
3. **Double Ingestion Prevention:** Case IDs are evaluated against active database tables. If a Case ID already exists, the engine performs a secure update (updating current balance values while preserving historical contact logs), avoiding double ledger entries.

---

## 6. DEEP DIVE: AUTOMATED DEBT ALLOCATION & STRATEGIC QUEUES

Once a portfolio is ingested, EDROS applies an allocation engine to assign case portfolios to recovery executives based on location, workload, and performance metrics.

### 6.1 Algorithmic Allocation Rules
* **Geographical Branch Matching:** Cases are automatically assigned to the physical operations branch closest to the debtor's registered home address, matching the zip code against branch coordinates in the database.
* **Load Balancing Cap:** Individual field recovery executives are subject to a maximum active load of **120 active cases** to prevent staff burn-out and preserve contact quality.
* **Performance-Weighted Distribution:** High-performing agents (measured by their historical PTP conversion rate) are prioritized for high-value debt allocations (balances exceeding INR 200,000), maximizing recovery rates on valuable portfolios.

### 6.2 Debt Recovery Queues Strategy
Delinquencies are structured into progressive queues based on outstanding aging metrics:
* **Bucket 1 (1–30 Days Past Due):** Managed primarily through automated SMS, email reminders, and low-cost tele-calling channels.
* **Bucket 2 (31–90 Days Past Due):** Assigned to internal branch calling teams for intensive phone follow-ups and initial settlement proposals.
* **Bucket 3 (91+ Days Past Due / NPA):** Transferred to the field operations queue, triggering automated field-executive assignments, address verification visits, and legal action warnings.

---

## 7. DEEP DIVE: GEOFENCED FIELD RECOVERY & FRAUD MITIGATION

Field collections require high visibility to ensure field agents act ethically, report accurately, and complete visits to debtors' physical premises.

### 7.1 Geofenced Check-In Process
When a field recovery executive visits a debtor, they must check in using the mobile interface. The verification engine processes the request through the following checks:

```
                  [ Field Executive Check-In Attempt ]
                                   │
                    (Retrieves Device GPS Lat/Lng)
                                   │
                                   ▼
                [ Geofencing Verification Service ]
              - Fetches debtor home coordinates from DB
              - Computes Haversine distance from agent device
                                   │
             ┌─────────────────────┴─────────────────────┐
             ▼ (Distance <= 250m)                        ▼ (Distance > 250m)
     [ Check-In Approved ]                       [ Check-In Blocked ]
     - Logs visit as VALID                       - Restricts report logging
     - Unlocks contact form                      - Flags account as "GPS_DRIFT"
     - Writes to `visit_logs`                    - Triggers supervisor alert
```

### 7.2 Haversine Great-Circle Formula Implementation
The geofence service uses the Great-Circle Haversine formula to compute distance over the Earth's spherical surface, ensuring coordinates are validated to an accuracy of within **1 meter**:

$$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$

Where:
* $d$ is the calculated distance in meters.
* $R$ is the Earth's radius (6,371,000 meters).
* $\phi_1, \phi_2$ are the latitudes of the agent and home address in radians.
* $\Delta\phi$ is the latitude difference, and $\Delta\lambda$ is the longitude difference.

If the calculated distance is greater than **250 meters**, the mobile app blocks contact report entry and logs a "GPS_DRIFT" event, preventing location fraud.

---

## 8. DEEP DIVE: SETTLEMENT SANDBOX & COMMISSION ENGINE

The **Settlement Sandbox** is an interactive module where field recovery executives and managers design, calculate, and sign off on debt settlement haircuts.

### 8.1 The Settlement Escalation Matrix
To prevent unauthorized settlement discounts, the application enforces hierarchical approval limits:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SETTLEMENT APPROVAL LEVEL LIMITS                       │
├─────────────────────┬──────────────────────┬────────────────────────────────┤
│ Operator Role       │ Max Haircut Approved │ Exceeded Limit Action          │
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ Field Executive     │ Up to 15.00%         │ Auto-approves on transaction   │
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ Branch Manager      │ 15.01% - 30.00%      │ Locks case; requests BM signoff│
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ Regional Manager    │ 30.01% - 50.00%      │ Escalates to Regional Manager  │
├─────────────────────┼──────────────────────┼────────────────────────────────┤
│ National Ops Head   │ 50.01% - 75.00%      │ Escalates to National Head     │
└─────────────────────┴──────────────────────┴────────────────────────────────┘
```

If a proposed haircut exceeds the active agent's role authority, the account is locked in a `PENDING_APPROVAL` state, and an escalation request is sent to the designated manager's dashboard.

### 8.2 Performance Commission Tracking
The platform calculates commissions dynamically to motivate recovery teams:
* **Standard Recovery Commission:** Agents earn a baseline **2.5% commission** on collected amounts for accounts settled within standard payment timelines.
* **NPA Recovery Bonus:** Settle an account classified as a Non-Performing Asset (NPA - over 180 days delinquent) to earn an elevated **5.0% recovery commission**.
* **Haircut Penalty Deductions:** To discourage excessive debt discounting, the commission is reduced by **0.05%** for every **1% of haircut discount** granted to the debtor.

---

## 9. DEEP DIVE: LITIGATION MANAGEMENT, NOTICE WATERMARKING & R2 VAULT

When informal collection methods fail, EDROS transitions the account into the **Court Notices Desk** to initiate legal proceedings.

### 9.1 Automating Court Notices
1. **Dynamic Generation:** The notice engine pulls debtor records, outstanding balances, and contract dates directly from PostgreSQL tables to compile a formatted legal demand letter.
2. **Cryptographic Watermarking:** Before saving, the file is processed through a server-side **128-bit RC4 Stream Seal** cryptographic engine. This injects a visible digital watermark across the document and embeds metadata containing the generating user's ID, current time, and IP address.
3. **Cloudflare R2 Storage:** The watermarked PDF is pushed to a private, secure Cloudflare R2 bucket using encrypted HTTPS connections. R2 provides high availability and access protection, ensuring notices are accessible only to authenticated legal personnel.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SECURE LEGAL NOTICE GENERATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│   - Pulls debtor data from PostgreSQL                                       │
│   - Formats legal demand notice                                            │
│   - Applies 128-bit cryptographic RC4 visible watermark                    │
│   - Uploads to Cloudflare R2 secure object storage                         │
│   - Creates suit track record with court hearing date                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Lawsuit Tracking and Court Dockets
Upon notice generation, the system creates a track record in the database:
* **Litigation State:** Sets the case status to `LITIGATION`.
* **Docket Details:** Stores the Assigned Court Name (e.g., "National Debt Recovery Tribunal"), Suit Reference Number, and next Court Hearing Date.
* **Audit Records:** Preserves the generated notice PDF URL, establishing a complete chain of custody for legal actions.

---

## 10. PORTAL-WIDE TECHNICAL COHESION & SECURITY PROTOCOLS

The entire EDROS platform is built around strict data isolation and secure access layers, separating front-end presentation from database queries.

### 10.1 Multi-Tenant Isolation (Sandbox Mode)
To allow testing without risking live data, the platform implements a **Sandbox Tenant Picker**. Administrators use a drop-down menu in the page header to switch between active database partitions:
* **Production Tenant:** Connects to live database schemas with active field data and real collections ledgers.
* **Sandbox Tenants (e.g., Bank of Baroda, ICICI, HDFC):** Mounts isolated test data schemas where developers and managers can run mock portfolio ingestions, test API webhooks, and trigger simulated collections campaigns without altering live accounts.

### 10.2 Global Security Controls
* **Express & API Security:** Express servers enforce standard security headers, strict CORS origins, rate limiters, and session tracking cookies.
* **Data Sanitization:** SQL injection risks are prevented by routing all database operations through parameterized queries.
* **TypeScript & Type Safety:** Common enums, type definitions, and schema models are shared across the application, preventing data type mismatches on the client or server.

---

## 11. REGULATORY ALIGNMENT (DPDP ACT, RBI FAIR PRACTICE CODE, SOC 2)

EDROS is designed to maintain compliance with strict data security, user privacy, and banking standards.

### 11.1 India Digital Personal Data Protection (DPDP) Act
* **Purpose Limitations:** Debtor phone numbers and home addresses are visible to field agents only when the case is actively allocated. When a case is closed or settled, these personal details are masked in UI views.
* **Audit Trail Requirements:** All personal data access—including views, exports, and updates—is logged to secure database tables, recording the viewing operator's email, timestamp, and IP address.

### 11.2 RBI Fair Practices Code for Debt Collection
* **Contact Hour Restrictions:** The platform enforces RBI contact regulations by restricting automated messages (SMS, WhatsApp, emails) to approved hours (between 08:00 and 19:00 IST).
* **Field Interaction Logs:** Field agents must record all physical interactions, including timestamps, geofence details, and debtor responses, providing complete transparency and audit compliance.

### 11.3 SOC 2 Type II & ISO 27001 Security Framework
* **Role-Based Access Control (RBAC):** Users must authenticate via single sign-on (SSO). System access is strictly partitioned, ensuring field agents have no access to executive dashboards, and managers cannot alter core database schemas.
* **Vulnerability & Threat Prevention:** Core operations are logged and monitored, while critical data streams are encrypted in transit and at rest to defend against unauthorized system access.

---

## 12. KEY ROI METRICS & FINANCIAL VALIDATION CHECKLIST

To verify platform efficiency post-deployment, operations teams can monitor several core performance metrics:

### 12.1 Financial KPIs
1. **Promise to Pay (PTP) Conversion Rate:** Target an average improvement of **+30%** or higher, driven by automated geofenced agent follow-ups.
2. **FTE Efficiency Gain:** Increase average active caseload volumes to **100+ cases** per executive without expanding operational staff counts.
3. **Legal Notices Generation Timeline:** Reduce average notice turnaround times from **120 days to 14 days** by utilizing automated drafting templates.

### 12.2 Verification Sign-Off Procedures
The operations team must complete the following checklist after deploying system updates to verify performance:

```
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION FUNCTIONAL VALIDATION SIGN-OFF SHEET                             |
|                                                                             |
| System Release Code: [ Release v1.0.0 ]                                     |
| Product Target:      [ /docs/phase1/02_executive_product_handbook.md ]      |
| Operations Review:   [ VERIFIED / ACTIVE ]                                  |
| Compliance Sign-Off: [ APPROVED / SIGNED ]                                  |
+─────────────────────────────────────────────────────────────────────────────+
```

* [ ] **Roster & Organization Hierarchy Check:** Confirm that reporting structures and agent caseload limits resolve correctly.
* [ ] **Portfolio Ingestion Parser Test:** Verify that file uploads successfully parse rows, filter duplicates, and log schema errors.
* [ ] **Geofence Distance Evaluation:** Confirm that check-in attempts outside the 250-meter radius are blocked and logged as drifts.
* [ ] **Settlement Matrix Block Test:** Confirm that settlement proposals exceeding role limits are locked and sent to managers.
* [ ] **Watermarked PDF Generation Check:** Verify that generated legal notices are watermarked, uploaded to storage, and tracked in the litigation docket.

---

## 13. GLOSSARY & REFERENCES

### 13.1 Glossary of Terms
* **CBS:** Core Banking System. The central back-end system that processes daily banking transactions across branches.
* **DPDP Act:** Digital Personal Data Protection Act. India's national data privacy framework regulating the processing of personal digital data.
* **FTE:** Full-Time Equivalent. A metric used to measure staff workload capacity and overall operational efficiency.
* **Geofence:** A virtual geographic boundary defined by GPS coordinates that triggers actions when devices enter or exit the perimeter.
* **NPA:** Non-Performing Asset. A banking classification for loan accounts that are delinquent for 90 days or more.
* **PTP:** Promise to Pay. A formal agreement between a debtor and recovery agent defining a future payment date and amount.

### 13.2 References
1. **Reserve Bank of India (RBI) Debt Collection Guidelines:** Fair Practice codes for commercial banking institutions.
2. **Digital Personal Data Protection Act (2023):** Privacy, purpose limitation, and logging requirements under Indian law.
3. **Clean Architecture Blueprints:** Design patterns for separating business rules from infrastructure layers.
4. **Cloudflare R2 Object Storage Reference:** Secure S3-compliant cloud storage setups, access controls, and encryption standards.

---
© 2026 Sanjay Dangi Associates. All rights reserved. Proprietary and Confidential.
