# EDROS ENTERPRISE DOCUMENTATION LIBRARY
## MODULE 03: USER ROLES, PERMISSION HIERARCHIES, AND ADMINISTRATIVE OPERATIONAL MANUALS

---

## DOCUMENT 8: USER ROLES & PERMISSIONS MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-URM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / GENERAL COMPLIANCE OFFICE
* **Author:** Global Head of Security & Identity
* **Published Date:** July 15, 2026

---

### VERSION HISTORY
| Version | Date | Author | Description of Change | Approved By |
|---|---|---|---|---|
| 1.0.0 | July 15, 2026 | Global Identity Lead | Baseline RBAC matrix formulation. | VP of Enterprise Security |

---

### 8.1 PURPOSE
This manual establishes the legal and administrative roles configured within EDROS, specifying authorization boundaries, permission matrices, and security level controls.

### 8.2 INTENDED AUDIENCE
* **Information Security Officers**
* **External IT Security Auditors**
* **HR Specialists & Resource Management Leads**

### 8.3 THE SYSTEM ROLE HIERARCHY
EDROS implements a rigid hierarchical Role-Based Access Control (RBAC) schema. Authority descends from the executive administrative core to field agents:

```
                  ┌───────────────────┐
                  │    SUPER_ADMIN    │ (Full control, system metrics)
                  └─────────┬─────────┘
                            ▼
                  ┌───────────────────┐
                  │   NATIONAL_HEAD   │ (Country-wide portfolios, macros)
                  └─────────┬─────────┘
                            ▼
                  ┌───────────────────┐
                  │   STATE_MANAGER   │ (State performance, cross-branch)
                  └─────────┬─────────┘
                            ▼
                  ┌───────────────────┐
                  │ REGIONAL_MANAGER  │ (Regional audits, haircut approvals)
                  └─────────┬─────────┘
                            ▼
                  ┌───────────────────┐
                  │  BRANCH_MANAGER   │ (Branch operations, attendance)
                  └─────────┬─────────┘
                            ▼
                  ┌───────────────────┐
                  │    TEAM_LEADER    │ (Case allocations, team trackers)
                  └─────────┬─────────┘
                            ▼
                  ┌───────────────────┐
                  │RECOVERY_EXECUTIVE │ (Field calls, telemetry logs)
                  └───────────────────┘
```

---

### 8.4 SYSTEM PERMISSION MATRIX
The primary RBAC grid mapping operational capabilities across the platform:

| Permission / Action | SUPER ADMIN | NATIONAL HEAD | STATE MGR | REGIONAL MGR | BRANCH MGR | TEAM LEADER | RECOVERY EXEC |
|---|---|---|---|---|---|---|---|
| `RECON_TELEMETRY` | Yes | Yes | Yes | Yes | Yes | No | No |
| `RBAC_RULE_UPDATE` | Yes | No | No | No | No | No | No |
| `APPROVE_HAIRCUT` | Unlimited | Up to 80% | Up to 50% | Up to 30% | Up to 15% | No | No |
| `ALLOCATE_CASE` | Yes | Yes | Yes | Yes | Yes | Yes | No |
| `RECORD_ATTENDANCE` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `DISPATCH_PAYROLL` | Yes | Yes | No | No | No | No | No |
| `DRAFT_LEGAL_NOTICE` | Yes | Yes | Yes | Yes | No | No | No |
| `ENCRYPT_VAULT_PDF` | Yes | Yes | Yes | No | No | No | No |

---

## DOCUMENT 9: SUPER ADMIN MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-SAM-2026-V1
* **Version:** 1.0.0
* **Classification:** SUPER ADMINISTRATIVE LEVEL EXCLUSIVE
* **Author:** Principal Operations Architect
* **Published Date:** July 15, 2026

---

### 9.1 SYSTEM ADMINISTRATION PROCEDURES
The Super Admin is the ultimate structural root. Super Admins possess access to both the **Operations Deck** and the **Architecture Hub**.

#### Procedure A: Update Role Permission Matrices (RBAC)
1. Select **Operations Deck** -> **RBAC & Profiles** tab.
2. Under "Role Permission Matrix", review the currently loaded grid.
3. Click any checkbox or toggle icon to grant or strip access.
4. Click **SAVE RULES** to write rules directly to Postgres.
5. Swapping rules forces immediate JWT authorization re-evaluations across all active user sessions.

#### Procedure B: Core System Auditing
1. Under **RBAC & Profiles**, select the **System Audit Trails** sub-tab.
2. Read the centralized log stream detailing operator action hashes, origin IP allocations, and state-mutation logs.

---

## DOCUMENT 10: NATIONAL HEAD MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-NHM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / NATIONAL RISK CONTROL
* **Author:** Global Retail Risk Lead
* **Published Date:** July 15, 2026

---

### 10.1 NATIONAL OPERATIONS MANAGEMENT
The National Head is responsible for national indicators and macroeconomic portfolio performance.

#### Procedure: Review National Portfolio Trends
1. Access **Operations Deck** -> **Telemetry Dashboard**.
2. Set geographic boundaries to "National - All Territories".
3. Evaluate total cash volumes locked under litigation dockets versus active PTP status pipelines.
4. Execute macro adjustments to target national recovery agencies.

---

## DOCUMENT 11: STATE MANAGER MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-SMM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / REGIONAL RISK CONTROL
* **Author:** Collections Program Director
* **Published Date:** July 15, 2026

---

### 11.1 STATE-LEVEL ALLOCATIONS & COMPLIANCE
The State Manager oversees performance metrics across multiple branches within a specific state boundary.

#### Procedure: Inter-Branch Case Balance
1. Select **Operations Deck** -> **Bank & Org Setups** -> **State Portfolios**.
2. View high-delinquency nodes.
3. Select and re-route delinquent customer accounts from branch offices lacking capacity to branch offices containing unallocated field agents.

---

## DOCUMENT 12: REGIONAL MANAGER MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-RMM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / OPERATIONAL LEVEL CONTROL
* **Author:** Operations Management Lead
* **Published Date:** July 15, 2026

---

### 12.1 REGIONAL COMPLIANCE & SETTLEMENT APPROVALS
The Regional Manager approves settlement haircuts up to **30%** of total delinquent principal balances.

#### Procedure: Evaluate and Approve Settlement Haircut
1. Select **Operations Deck** -> **Settlement Sandbox**.
2. Select the queue marked "Pending Review / Haircut Approval".
3. Select an active case (e.g. "Ankit Kumar").
4. Evaluate the proposed payoff amount ($180,000.00 against $245,000.00 total due - representing a 26.53% haircut).
5. Ensure the required authority matches "REGIONAL_MANAGER".
6. Click **AUTHORIZE SECURE SETTLEMENT PAYOFF** to release the block and generate the clearance token.

---

## DOCUMENT 13: BRANCH MANAGER MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-BMM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / BRANCH MANAGEMENT
* **Author:** Collections Training Lead
* **Published Date:** July 15, 2026

---

### 13.1 BRANCH OFFICE OPERATIONS
The Branch Manager controls operator roster schedules, monitors branch-level attendance, and audits local document uploads.

#### Procedure: Audit Operator Roster & Attendance
1. Navigate to **Operations Deck** -> **Staff Roster & Payroll**.
2. Filter the staff directory by the local branch name.
3. Verify attendance status.
4. If an employee's attendance GPS punch was rejected due to geofencing boundaries, cross-reference coordinates and manually override the record if valid.

---

## DOCUMENT 14: TEAM LEADER MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-TLM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / TEAM MANAGEMENT
* **Author:** Operations Training Lead
* **Published Date:** July 15, 2026

---

### 14.1 PORTFOLIO ALLOCATION & FOLLOW-UP ASSIGNMENT
The Team Leader manages immediate field operations, distributes case targets, and monitors daily Promise to Pay (PTP) collection targets.

#### Procedure: Distribute Target Portfolios
1. Navigate to **Operations Deck** -> **Debtors Registries**.
2. Locate high-balance delinquent customer accounts.
3. Select "Modify Assignee" dropdown.
4. Allocate cases to active field Recovery Executives based on current caseload and performance scores.

---

## DOCUMENT 15: RECOVERY EXECUTIVE MOBILE MANUAL

### COVER PAGE
* **Product Name:** EDROS
* **Document ID:** EDROS-REM-2026-V1
* **Version:** 1.0.0
* **Classification:** CONFIDENTIAL / FIELD AGENT REFERENCE
* **Author:** Field Operations Specialist
* **Published Date:** July 15, 2026

---

### 15.1 FIELD OPERATIONS AND GEOLOCATION WORKFLOWS
The Recovery Executive is the front-line user navigating field calls and physically tracing business assets.

#### Procedure A: Record Geofenced GPS Attendance Punch
1. Access the application on a mobile device or laptop browser.
2. Select **Operations Deck** -> **Staff Roster & Payroll**.
3. Under the personal Metadata Card, locate the "Attendance Registry".
4. Set action selector to **CLOCK-IN**.
5. Click **PUNCH GPS-GEOFENCE CLOCK**.
6. The application queries the browser geolocation service (`navigator.geolocation`) and matches coordinates against local branch geofences.
7. Upon successful validation, the dashboard logs `PUNCH_SUCCESSFUL`.

#### Procedure B: Log Field Visits
1. Select **Operations Deck** -> **Settlement Sandbox**.
2. Select an assigned case from the sidebar list.
3. Click the **Geofenced Visit** tab.
4. Click "Get Coordinates" or enter coordinates (e.g., Latitude `12.9716`, Longitude `77.5946`).
5. Choose visit status: `ASSET_FOUND` or `ASSET_MISSING`.
6. Enter complete observations (e.g. asset conditions, tracking info).
7. Click **COMMIT FIELD VERIFICATION REPORT** to upload logs and capture physical coordinates.

---
